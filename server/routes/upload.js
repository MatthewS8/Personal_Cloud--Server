const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const authenticateToken = require("../middlewares/authenticatorHandler");
const File = require("../models/file");
const fs = require("fs");
const pako = require("pako");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const getRedisClient = require("../redisClient");

async function decryptData(encryptedData, key) {
  const ivArray = new Uint8Array(encryptedData.iv);
  const encryptedArray = Uint8Array.from(
    atob(encryptedData.encrypted)
      .split("")
      .map((char) => char.charCodeAt(0))
  );

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivArray,
      },
      key,
      encryptedArray
    );

    return new Uint8Array(decrypted);
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw error;
  }
}

router.post(
  "/upload",
  authenticateToken,
  upload.array("file", 10),
  async (req, res) => {
    try {
      const { userId, files } = req;
      console.log("req", req);
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      // redis
      const redisClient = await getRedisClient();
      const sessionKey = await redisClient.hGet(`user:${userId}`, "sessionKey");
      if (!sessionKey) {
        return res.status(401).json({ message: "Session key not found" });
      }
      const rawKey = Uint8Array.from(atob(Buffer.from(sessionKey)), (c) =>
        c.charCodeAt(0)
      );
      const key = await crypto.subtle.importKey(
        "raw",
        rawKey,
        "AES-GCM",
        true,
        ["decrypt"]
      );

      const decryptedFiles = await Promise.all(
        files.map(async (file) => {
          const encryptedData = JSON.parse(file.buffer.toString("utf8"));
          const decryptedData = await decryptData(encryptedData, key);
          // TODO: Remove the pako.inflate
          file.buffer = Buffer.from(pako.inflate(Buffer.from(decryptedData)));

          return file;
        })
      );
      const uploadedFiles = await Promise.all(
        decryptedFiles.map(async (file) => {
          const fileUUID = uuidv4();
          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            req.username,
            file.originalname
          );
          const newFile = await File.create({
            fileName: file.originalname,
            uuid: fileUUID,
            filePath: filePath,
            createdAt: file.createdAt,
            ownerId: req.userId,
          });
          await fs.promises.writeFile(filePath, file.buffer);
          return newFile;
        })
      );

      res.status(201).json({ message: "Files uploaded successfully" });
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
