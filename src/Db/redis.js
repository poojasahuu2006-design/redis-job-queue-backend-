require("dotenv").config();

const { createClient } = require("redis");

const redisClient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on("connect", () => {
  console.log("✅ Redis Connected Successfully");
});

redisClient.on("error", (err) => {
  console.log("❌ Redis Error:", err);
});

async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  redisClient,
  connectRedis,
};