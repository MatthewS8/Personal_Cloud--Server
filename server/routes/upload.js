const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const authenticateToken = require("../middlewares/authenticatorHandler");
const File = require("../models/file");
const fs = require("fs");
const archiver = require("archiver");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const getRedisClient = require("../redisClient");

async function decryptData(encryptedData, key) {
  const ivArray = Uint8Array.from(
    Buffer.from(String(encryptedData.iv), "base64")
  );
  const encryptedArray = Uint8Array.from(
    Buffer.from(encryptedData.encrypted, "base64")
  );

  console.log("pre decrypt");
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivArray,
    },
    key,
    encryptedArray
  );
  console.log("post decrypt");
  return new Uint8Array(decrypted);
}

// TODO remove all these functions for test
async function fileToUint8Array(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const uint8Array = new Uint8Array(arrayBuffer);
      resolve(uint8Array);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
}

testEncryption = async () => {};

testDecryption = async () => {};

router.post(
  "/upload",
  authenticateToken,
  upload.array("file", 10),
  async (req, res) => {
    try {
      const { userId, files } = req;
      const redisClient = await getRedisClient();
      const sessionKey = await redisClient.hGet(`user:${userId}`, "sessionKey");
      console.log("sessionKey from redis ", sessionKey);
      if (!sessionKey) {
        return res.status(401).json({ message: "Session key not found" });
      }
      const key = await crypto.subtle.importKey(
        "raw",
        new Uint8Array(Buffer.from(sessionKey, "base64")),
        "AES-GCM",
        true,
        ["decrypt"]
      );

      console.log("trying to encrypt file ", files[0]);
      const encryptedData = JSON.parse(files[0].buffer.toString("utf8"));

      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            file.originalname
          );
          console.log("file path ", filePath);
          await fs.promises.writeFile(filePath, file.buffer);
          const fileUUID = uuidv4();
          const newFile = await File.create({
            fileName: file.originalname,
            uuid: fileUUID,
            filePath: filePath,
            createdAt: file.createdAt,
            ownerId: req.userId,
          });
          return newFile;
        })
      );
      res.status(500).json({ error: "Internal Server Error" });
      return;
      // const decryptedFiles = await Promise.all(
      //   files.map( async (file) => {
      //     console.log(" in the map with this file ", file);
      //     const encryptedData = JSON.parse(file.buffer.toString('utf8'));
      //     const decryptedData = await decryptData(encryptedData, key);
      //     console.log("decrypted data ");
      //     file.buffer = Buffer.from(decryptedData);
      //     const filePath = path.join(__dirname, '..', 'uploads', file.originalname);
      //     await fs.promises.writeFile(filePath, file.buffer);
      //     return file;
      //   })
      // );
      // console.log("decryptedFiles ", decryptedFiles);
      // if (!decryptedFiles || decryptedFiles.length === 0) {
      //     return res.status(400).json({message: 'No files uploaded'});
      // }
      // const uploadedFiles = await Promise.all(files.map(async (file) => {
      //     const fileUUID = uuidv4();
      //     const newFile = await File.create({
      //         fileName: file.originalname,
      //         uuid: fileUUID,
      //         filePath: file.path,
      //         createdAt: file.createdAt,
      //         ownerId: req.userId
      //     });
      //     return newFile;
      // }));

      // res.status(201).json({ message: 'Files uploaded successfully', files: uploadedFiles });
    } catch (error) {
      console.error("Error decrypting data:", error);
      res.status(500).send("Error decypting files");
    }
  }
);
// router.post('/upload-folder', authenticateToken, upload.single('folder'), async (req, res) => {
//     try {
//         const { file } = req;
//         if (!file) {
//             return res.status(400).json({ message: 'No folder uploaded' });
//         }

//         const folderUUID = uuidv4();
//         const folderPath = path.join(__dirname, '..', 'uploads', folderUUID);

//         fs.mkdirSync(folderPath);

//         const zip = new archiver('zip', {
//             zlib: { level: 9 }
//         });

//         zip.on('error', (err) => {
//             throw err;
//         });

//         const output = fs.createWriteStream(path.join(folderPath, 'folder.zip'));
//         zip.pipe(output);
//         zip.directory(file.path, false);
//         await zip.finalize();

//         const newFolder = await File.create({
//             fileName: file.originalname,
//             uuid: folderUUID,
//             filePath: folderPath,
//             createdAt: new Date(),
//             ownerId: req.userId
//         });

//         res.status(201).json({ message: 'Folder uploaded successfully', folder: newFolder });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error');
//     }
// });
module.exports = router;
