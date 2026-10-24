require("dotenv").config();
const { createClient } = require("redis");

let redisClient = null;

const redisUrl = process.env.REDIS_URL;
let redisHost = process.env.REDIS_HOST;

// Ignore known dead expired demo host
if (redisHost === "velvet-reaction-dime-80817.db.redis.io") {
    redisHost = null;
}

if (redisUrl) {
    redisClient = createClient({ url: redisUrl.trim().replace(/^["']|["']$/g, "") });
} else if (redisHost) {
    redisClient = createClient({
        username: process.env.REDIS_USERNAME || "default",
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: redisHost.trim().replace(/^["']|["']$/g, ""),
            port: parseInt(process.env.REDIS_PORT) || 6379,
            connectTimeout: 5000
        }
    });
}

if (redisClient) {
    redisClient.on("connect", () => {
        console.log("Redis Connected Successfully");
    });

    redisClient.on("error", (err) => {
        console.warn("Redis Notice:", err.message);
    });
}

async function connectRedis() {
    if (!redisClient) {
        console.log("Redis not configured or inactive; job queue is running in standalone MongoDB mode.");
        return;
    }

    try {
        await redisClient.connect();
    } catch (err) {
        console.warn("Redis connection warning (non-fatal):", err.message);
    }
}

module.exports = {
    redisClient,
    connectRedis
};
