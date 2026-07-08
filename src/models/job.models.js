const mongoose=require("mongoose")

const jobSchema=new mongoose.Schema(
{
    type: {
        type: String,
        required: true
    },

    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed", "dead"],
        default: "pending"
    },

    priority: {
        type: Number,
        default: 3
    },

    attempts: {
        type: Number,
        default: 0
    },

    maxAttempts: {
        type: Number,
        default: 5
    },

    scheduledAt: {
        type: Date,
        default: Date.now
    },

    lockedBy: {
        type: String,
        default: null
    },

    lockedUntil: {
        type: Date,
        default: null
    },

    completedSteps: {
        type: [String],
        default: []
    },
        dependsOn: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Job',
        default: []
    },

},
{
    timestamps: true
});


const jobModel= mongoose.model("Job", jobSchema);
module.exports=jobModel;