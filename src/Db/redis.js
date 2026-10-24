require("dotenv").config();
const { createClient } = require("redis");

let redisClient = null;

// Support both REDIS_URL and separate host/port parameters
const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST;

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
        console.log("Redis configuration not provided; operating in standalone MongoDB mode.");
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
