const mongoose = require("mongoose");

async function connectDB() {
    let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

    if (!mongoUri) {
        console.error("FATAL: MONGO_URI is not defined! Please set MONGO_URI in your Render environment variables.");
        process.exit(1);
    }

    // Clean surrounding quotes and whitespace
    mongoUri = mongoUri.trim().replace(/^["']|["']$/g, "").trim();

    if (mongoUri.includes("cluster3.z5zejke.mongodb.net")) {
        console.warn("⚠️ NOTICE: Detected inactive/paused cluster3 in MONGO_URI.");
        console.warn("If you get querySrv ENOTFOUND, please update MONGO_URI in Render to use your active cluster0.");
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("DB is connected successfully to the server");
    } catch (err) {
        console.error("Database connection error:", err.message);
        if (err.message.includes("ENOTFOUND")) {
            console.error("👉 Solution: Update MONGO_URI in your Render Dashboard -> Environment to your active MongoDB Atlas cluster (cluster0.kpjsxdz.mongodb.net).");
        }
        process.exit(1);
    }

    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected. Attempting reconnection...");
    });
}

module.exports = connectDB;
