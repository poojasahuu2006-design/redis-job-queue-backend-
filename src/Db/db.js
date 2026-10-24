const mongoose = require("mongoose");

async function connectDB() {
    let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

    if (!mongoUri) {
        console.error("FATAL: MONGO_URI is not defined! Please set MONGO_URI in your environment.");
        process.exit(1);
    }

    // Clean surrounding quotes and whitespace
    mongoUri = mongoUri.trim().replace(/^["']|["']$/g, "").trim();

    try {
        await mongoose.connect(mongoUri);
        console.log("DB is connected successfully to the server");
    } catch (err) {
        console.error("Database connection error:", err.message);
        process.exit(1);
    }

    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected. Attempting reconnection...");
    });
}

module.exports = connectDB;
