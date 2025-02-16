const redis = require("redis");

let redisClient;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: "redis://redis:6379",
      password: process.env.REDIS_PASSWORD,
    });

    redisClient.on("error", (err) => {
      console.error("Redis client error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Redis client connected");
    });

    redisClient.on("end", () => {
      console.log("Redis client disconnected");
    });

    await redisClient.connect();
  }

  return redisClient;
}

module.exports = getRedisClient;
