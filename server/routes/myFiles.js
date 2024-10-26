const express = require("express");
const router = express.Router();
const File = require("../models/file");
const fs = require("fs");

const authenticateToken = require("../middlewares/authenticatorHandler");
const { encryptDataWithSessionKey } = require('../middlewares/sessionKeyHandler');

router.get("/", authenticateToken, async (req, res) => {
  try {
    const fileList = await File.findAll({ where: { ownerId: req.userId } });

    if (fileList.length === 0) {
      res.json({});
    } else {
      console.log("Found these files");
      res.json(fileList);
    }
  } catch (err) {
    console.error("Error on validating token: ", err);
    res.status(400).send("Invalid token");
  }
});

router.get("/download/:uuid", authenticateToken, encryptDataWithSessionKey, async (req, res) => {
  try {
    const file = await File.findOne({
      where: { uuid: req.params.uuid, ownerId: req.userId },
    });

    if (!file) {
      return res.status(404).json({error: "File not found"});
    }

    const filePath = file.filePath;
    const fileName = file.fileName;
    const fileData = fs.readFileSync(filePath, 'utf8');
    const encryptedData = req.encrypt(fileData);

    res.setHeader('Content-Disposition', `attachment; filename-${fileName}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(encryptedData);
  } catch (err) {
    console.error("Error downloading file: ", err);
    res.status(500).json({error: "Error downloading file"});
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
