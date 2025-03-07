const express = require("express");
const router = express.Router();
const File = require("../models/file");
const fs = require("fs");
const stream = require("stream");
const { pipeline } = require("stream");
const { promisify } = require("util");
const pipelineAsync = promisify(pipeline);

const getRedisClient = require("../utils/redisClient");

const authenticateToken = require("../middlewares/authenticatorHandler");
const {
  decryptData,
  encryptData,
  getServerKey,
} = require("../utils/cryptoUtilities");

const CHUNK_SIZE = 64 * 1024; // 64KB

router.get("/", authenticateToken, async (req, res) => {
  try {
    const fileList = await File.findAll({ where: { ownerId: req.userId } });

    if (fileList.length === 0) {
      res.json({});
    } else {
      // FIXME - This is a security issue. We should not be sending the file path to the client.
      res.json(fileList);
    }
  } catch (err) {
    console.error("Error on validating token: ", err);
    res.status(400).send("Invalid token");
  }
});

router.get("/download/:uuid", authenticateToken, async (req, res) => {
  try {
    const file = await File.findOne({
      where: { uuid: req.params.uuid, ownerId: req.userId },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const redisClient = await getRedisClient();
    const sessionKey = await redisClient.hGet(
      `user:${req.userId}`,
      "sessionKey"
    );
    if (!sessionKey) {
      return res.status(401).json({ message: "Session key not found" });
    }

    const rawKey = Uint8Array.from(atob(Buffer.from(sessionKey)), (c) =>
      c.charCodeAt(0)
    );
    const key = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, [
      "encrypt",
      "decrypt",
    ]);

    const filePath = file.filePath;
    const fileName = file.fileName;
    const readStream = fs.createReadStream(filePath, {
      highWaterMark: CHUNK_SIZE,
    });

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("fileName", fileName);
    res.setHeader("fileType", file.type);

    const serverKey = await getServerKey();
    let acc = "";
    let lastChunk = "";
    let chunkCount = 0;

    const transformStream = new stream.Transform({
      async transform(chunk, encoding, callback) {
        acc += chunk.toString("utf8");
        let boundary = acc.indexOf("}");
        while (boundary > 0) {
          lastChunk = acc.substring(0, boundary + 1);
          acc = acc.substring(boundary + 1);
          boundary = acc.indexOf("}");
          const encryptedChunk = JSON.parse(lastChunk);
          try {
            chunkCount += 1;
            const decryptedData = await decryptData(
              new Uint8Array(encryptedChunk.iv),
              encryptedChunk.encrypted,
              serverKey
            );
            const { iv, encrypted } = await encryptData(
              decryptedData,
              key,
              null
            );
            const response = JSON.stringify({ iv: iv, encrypted: encrypted });
            this.push(response);
          } catch (error) {
            callback(new Error("Error processing chunk"));
            return;
          }
        }
        callback();
      },
      async flush(callback) {
        if (acc.length > 0) {
          const encryptedChunk = JSON.parse(acc);
          try {
            const decryptedData = await decryptData(
              new Uint8Array(encryptedChunk.iv),
              encryptedChunk.encrypted,
              serverKey
            );
            const { iv, encrypted } = await encryptData(
              decryptedData,
              key,
              null
            );
            const response = JSON.stringify({ iv: iv, encrypted: encrypted });
            this.push(response);
          } catch (error) {
            callback(new Error("Error processing last chunk"));
            return;
          }
        }
        callback();
      },
    });

    await pipelineAsync(readStream, transformStream, res);
  } catch (err) {
    console.error("Error downloading file: ", err);
    res.status(500).json({ error: "Error downloading file" });
  }
});

router.delete("/delete/:uuid", authenticateToken, async (req, res) => {
  try {
    const file = await File.findOne({
      where: { uuid: req.params.uuid, ownerId: req.userId },
    });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    fs.unlinkSync(file.filePath);

    await File.destroy({
      where: { uuid: req.params.uuid, ownerId: req.userId },
    });
    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file: ", err);
    res.status(500).json({ error: "Error deleting file" });
  }
});

module.exports = router;
