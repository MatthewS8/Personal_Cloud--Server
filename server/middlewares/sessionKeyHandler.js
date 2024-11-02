const crypto = require("crypto");

const getRedisClient = require("../redisClient");

// TODO: This middleware can be the point where I get the key from
// the redis store and add it to the req as CryptoKey

const encryptDataWithSessionKey = async (req, res, next) => {
  try {
    const userId = req.userId;
    const redisClient = await getRedisClient();
    const sessionKey = await redisClient.hGet(`user:${userId}`, "sessionKey");
    if (!sessionKey) {
      return res.status(400).json({ message: "Session key not found" });
    }
    req.encrypt = (data) => {
      const cipher = crypto.createCipher("aes-256-cbc", sessionKey);
      let encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");
      return encrypted;
    };

    next();
  } catch (error) {
    console.error("Error encrypting data:", error);
    res.status(500).send("Server error");
  }
};

module.exports = {
  encryptDataWithSessionKey,
};
