const crypto = require("crypto");

const getRedisClient = require('../redisClient');

async function decryptData(encryptedData, key) {
  const ivArray = new Uint8Array(encryptedData.iv);
  const encryptedArray = new Uint8Array(encryptedData.encrypted);

  console.log("pre decrypt");
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivArray
    },
    key,
    encryptedArray
  );
  console.log("post decrypt");
  return new Uint8Array(decrypted);
}

const encryptDataWithSessionKey = async (req, res, next) => {
  try {
    const userId = req.userId;
    const redisClient = await getRedisClient();
    const sessionKey = await redisClient.hGet(`user:${userId}`, "sessionKey");
    if (!sessionKey) {
      return res.status(400).json({ message: "Session key not found" });
    }
    req.encrypt = (data) => {
      const cipher = crypto.createCipher('aes-256-cbc', sessionKey);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    };
   
    next();
  } catch (error) {
    console.error("Error encrypting data:", error);
    res.status(500).send("Server error");
  }
};

const decryptDataWithSessionKey = async (req, res, next) => {
  
};

module.exports = {
  encryptDataWithSessionKey,
  decryptDataWithSessionKey,
};
