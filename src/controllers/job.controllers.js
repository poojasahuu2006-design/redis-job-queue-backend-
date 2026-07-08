const jobModel = require("../models/job.models");

async function createJobs(req, res) {
    try {
        const { type, payload, priority, scheduledAt,dependsOn } = req.body;

        const job = await jobModel.create({
            type,
            payload,
            priority,
            dependsOn,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date()
        });

        res.status(201).json({
            success: true,
            message: "Job created successfully",
            job
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function getAllJobs(req, res) {
    try {
        const jobs = await jobModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function getJobById(req, res) {
    try {
        const { id } = req.params;
        const job = await jobModel.findById(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Job fetched successfully",
            job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function deleteJobs(req, res) {
    try {
        const { id } = req.params;
        const job = await jobModel.findByIdAndDelete(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Job deleted successfully",
            job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function inspectQueue(req, res) {
    try {
        const pendingCount = await jobModel.countDocuments({ status: "pending" });
        const processingCount = await jobModel.countDocuments({ status: "processing" });
        const deadCount = await jobModel.countDocuments({ status: "dead" });
        const completedCount = await jobModel.countDocuments({ status: "completed" });
        const failedCount = await jobModel.countDocuments({ status: "failed" });
        
        const deadJobs = await jobModel.find({ status: "dead" }).sort({ updatedAt: -1 }).limit(20);

        res.status(200).json({
            success: true,
            stats: {
                pending: pendingCount,
                processing: processingCount, // in-flight jobs
                dead: deadCount,
                completed: completedCount,
                failed: failedCount
            },
            deadLetterContents: deadJobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    createJobs,
    getAllJobs,
    getJobById,
    deleteJobs,
    inspectQueue
};
