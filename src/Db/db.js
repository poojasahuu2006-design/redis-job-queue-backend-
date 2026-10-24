const mongoose = require("mongoose");

const defaultClusterUri = "mongodb+srv://poojasahuu2006_db_user:Pooja2006@cluster0.kpjsxdz.mongodb.net/job_queue?retryWrites=true&w=majority";

async function connectDB() {
    let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || defaultClusterUri;

    // Clean surrounding quotes and whitespace
    mongoUri = mongoUri.trim().replace(/^["']|["']$/g, "").trim();

    // If pointing to old paused cluster3 or empty, fallback to working cluster0
    if (!mongoUri || mongoUri.includes("cluster3.z5zejke.mongodb.net")) {
        console.warn("Using active MongoDB Atlas cluster0...");
        mongoUri = defaultClusterUri;
    }

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
