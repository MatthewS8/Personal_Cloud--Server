const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const crypto = require("crypto");
const { PRIVATE_RSA_KEY } = require("../config/config");
const getRedisClient = require("../redisClient");

const router = express.Router();
const authenticateToken = require("../middlewares/authenticatorHandler");

router.post("/session-key", authenticateToken, async (req, res) => {
  try {
    const { userId } = req;
    const { sessionKey } = req.body;

    const decryptedSessionKey = crypto.privateDecrypt(
      {
        key: PRIVATE_RSA_KEY,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(sessionKey, "base64")
    ).toString("base64");

    const redisClient = await getRedisClient();

    await redisClient.hSet(`user:${userId}`, "sessionKey", decryptedSessionKey);
    res.json({ message: "Session key saved successfully." });
  } catch (error) {
    console.error("Error saving session key:", error);
    res.status(500).send("Server error");
  }
});

router.post("/password-change", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current password and new password are required." });
  }

  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
