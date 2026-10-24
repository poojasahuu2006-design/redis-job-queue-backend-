const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const fs = require("fs");
const Router = require("./routes/job.routes");

const app = express();

// Security Headers
app.use(helmet({
    contentSecurityPolicy: false // Allow Swagger UI scripts
}));

// CORS Configuration
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
const swaggerPath = path.join(__dirname, "../swagger.json");
if (fs.existsSync(swaggerPath)) {
    const swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
        customSiteTitle: "Redis Job Queue API Documentation"
    }));
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerDoc);
    });
}

// Health Check for Render
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "Redis & MongoDB Job Queue Backend",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Root welcome route
app.get("/", (req, res) => {
    res.status(200).json({
        name: "Distributed Job Queue Backend",
        version: "1.0.0",
        docs: "/api-docs",
        health: "/health",
        status: "operational"
    });
});

// Main API Routes
app.use("/api/jobs", Router);

// 404 Route
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.originalUrl} not found. Check /api-docs for documentation.`
    });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

module.exports = app;
