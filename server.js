require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const { connectRedis, redisClient } = require("./src/Db/redis");
const app = require("./src/app");
const connectDB = require("./src/Db/db");
const startWorker = require("./src/workers/job.workers");

const PORT = process.env.PORT || 3000;

// Initialize connections
connectRedis();
connectDB().then(() => {
    // Launch background worker alongside express server
    startWorker();
}).catch((err) => {
    console.error("Failed to initialize database:", err.message);
});

const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger UI documentation available at http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
    console.log(`${signal} received. Closing gracefully...`);
    server.close(async () => {
        try {
            await mongoose.connection.close(false);
            if (redisClient && redisClient.isOpen) {
                await redisClient.quit();
            }
            console.log("Database and Redis connections closed cleanly.");
            process.exit(0);
        } catch (err) {
            console.error("Error during graceful shutdown:", err);
            process.exit(1);
        }
    });

    setTimeout(() => {
        console.error("Forceful shutdown after timeout.");
        process.exit(1);
    }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
