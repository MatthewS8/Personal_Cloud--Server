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

const getRedisClient = require("../utils/redisClient");
const {
  chunkedDecryptEncrypt,
  decryptData,
  encryptData,
  getServerKey,
} = require("../utils/cryptoUtilities");

router.post(
  "/upload",
  authenticateToken,
  upload.array("file", 10),
  async (req, res) => {
    try {
      const { userId, files } = req;
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
        ["encrypt", "decrypt"]
      );

      const decryptedFiles = await Promise.all(
        files.map(async (file) => {
          const encryptedData = JSON.parse(file.buffer.toString("utf8"));
          const reEncryptedData = await chunkedDecryptEncrypt(
            encryptedData,
            key,
            key
          );
          // const decryptedData = await decryptData(encryptedData, key);
          // const reEncryptedData = await encryptData(decryptedData, key);
          file.buffer = Buffer.from(JSON.stringify(reEncryptedData));

          file.fileType = encryptedData.fileType;
          file.lastModified = new Date(encryptedData.lastModified);

          return file;
        })
      );
      await Promise.all(
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
            size: file.size,
            type: file.fileType,
            createdAt: file.lastModified,
            ownerId: req.userId,
          });
          await fs.promises.writeFile(filePath, file.buffer);
          return newFile;
        })
      );

      res.status(201).json({ message: "Files uploaded successfully" });
    } catch (error) {
      console.error("Error decrypting data:", error);
      res.status(500).send("Error decrypting files");
    }
  }
);

const uploadChunks = multer({ storage: multer.memoryStorage() });
router.post(
  "/upload-chunk",
  authenticateToken,
  uploadChunks.none(),
  async (req, res) => {
    try {
      const {
        iv,
        encrypted,
        originalSize,
        chunkIndex,
        totalChunks,
        fileName,
        fileType,
        lastModified,
      } = req.body;

      const { userId, username } = req;

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
        ["encrypt", "decrypt"]
      );
      const parsedIv = new Uint8Array(JSON.parse(iv));
      const decryptedData = await decryptData(parsedIv, encrypted, key);
      const serverKey = await getServerKey();
      const { iv: serverIv, encrypted: serverEncrypted } = await encryptData(
        decryptedData,
        serverKey
      );
      const tempDir = path.join(__dirname, "temp", username, fileName);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const chunkPath = path.join(tempDir, `chunk_${chunkIndex}`);
      fs.writeFileSync(
        chunkPath,
        JSON.stringify({ iv: serverIv, encrypted: serverEncrypted })
      );
      await redisClient.hSet(
        `${userId}:${fileName}`,
        `${chunkIndex}`,
        "received"
      );
      const receivedChunks = await redisClient.hGetAll(`${userId}:${fileName}`);
      if (Object.keys(receivedChunks).length === Number(totalChunks)) {
        const outputFile = path.join(
          __dirname,
          "..",
          "uploads",
          `${username}`,
          `${fileName}.bin`
        );
        const chunks = fs.readdirSync(tempDir).sort((a, b) => {
          const indexA = parseInt(a.split("_")[1]);
          const indexB = parseInt(b.split("_")[1]);
          return indexA - indexB;
        });
        const writeStream = fs.createWriteStream(outputFile);
        chunks.forEach((chunk, index) => {
          const chunkPath = path.join(tempDir, chunk);
          const chunkData = fs.readFileSync(chunkPath);
          writeStream.write(chunkData);
        });
        writeStream.end();
        writeStream.on("finish", async () => {
          const fileUUID = uuidv4();
          const newFile = await File.create({
            fileName: fileName,
            uuid: fileUUID,
            filePath: outputFile,
            size: originalSize,
            type: fileType,
            createdAt: Date.parse(lastModified),
            ownerId: userId,
          });
          try {
            fs.rmSync(tempDir, { recursive: true, force: true });
          } catch (error) {
            console.error("Error deleting temp dir:", error);
            res
              .status(500)
              .send({ status: "Error uploading chunk", error: error.message });
          }
          await redisClient.del(`${userId}:${fileName}`);
          res.status(200).send({
            status: "File assembled successfully",
            filePath: outputFile,
          });
        });
      } else {
        res.status(200).send({ status: "Chunk received" });
      }
    } catch (error) {
      console.error("Error uploading chunk:", error);
      res
        .status(500)
        .send({ status: "Error uploading chunk", error: error.message });
    }
  }
);
module.exports = router;
