const jobModel = require("../models/job.models");
const { v4: uuidv4 } = require('uuid');

// Generate a random ID for this specific worker when it starts up
const workerId = uuidv4();

async function processJob(job) {
    console.log(`\n👨‍🍳 Worker ${workerId} is cooking Job ${job._id}`);
    
    // REQUIREMENT 7: IDEMPOTENCY
    // If the job crashed halfway through previously, we don't want to repeat Step 1!
    if (!job.completedSteps.includes('step1')) {
        console.log(`Job ${job._id}: Doing step 1...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
        job.completedSteps.push('step1');
        await job.save();
    } else {
        console.log(`Job ${job._id}: Step 1 was already done previously, skipping!`);
    }

    // REQUIREMENT 3: RETRIES (Simulating a random crash to test our retry logic)
    if (Math.random() < 0.4 && job.attempts === 0) {
        throw new Error("Simulated transient error! The oven broke!");
    }

    if (!job.completedSteps.includes('step2')) {
        console.log(`Job ${job._id}: Doing step 2...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
        job.completedSteps.push('step2');
        await job.save();
    } else {
        console.log(`Job ${job._id}: Step 2 was already done previously, skipping!`);
    }

    // If we make it here without throwing an error, the job is 100% done!
    job.status = "completed";
    job.lockedBy = null;
    job.lockedUntil = null;
    await job.save();
    console.log(`✅ Job ${job._id} Completed successfully`);
}

async function startWorker() {
    console.log(`Worker ${workerId} Started and waiting for jobs...`);

    while (true) {
        try {
            const now = new Date();
            
            // REQUIREMENT 1, 2, & 5: DURABLE QUEUE, PRIORITY, & LEASE PATTERN
            // Find a job that is pending/failed, is due to run, and is NOT currently locked by someone else.
            const job = await jobModel.findOneAndUpdate(
                {
                    status: { $in: ["pending", "failed"] },
                    scheduledAt: { $lte: now },
                    $or: [
                        { lockedUntil: null },
                        { lockedUntil: { $lte: now } } // If locked time has passed, the previous worker crashed!
                    ]
                },
                {
                    $set: {
                        status: "processing",
                        lockedBy: workerId,
                        lockedUntil: new Date(now.getTime() + 5 * 60 * 1000) // Lock it for 5 minutes
                    }
                },
                {
                    sort: { priority: -1, scheduledAt: 1 }, // Grab highest priority first!
                    returnDocument: "after"
                }
            );

            if (!job) {
                // No jobs found. Sleep for 2 seconds and check again.
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }

             if (job.dependsOn && job.dependsOn.length > 0) {
                // Count how many parent jobs are NOT completed
                const incompleteParents = await jobModel.countDocuments({
                    _id: { $in: job.dependsOn },
                    status: { $ne: 'completed' }
                });
                if (incompleteParents > 0) {
                    console.log(`⏸️ Worker ${workerId} skipping Job ${job._id}. Waiting on ${incompleteParents} dependencies.`);
                    
                    // Unlock the job so we don't hog it
                    job.lockedBy = null;
                    job.lockedUntil = null;
                    
                    // Delay it for 5 seconds so the worker doesn't get stuck checking it instantly
                    job.scheduledAt = new Date(Date.now() + 5000);
                    
                    await job.save();
                    continue; 
                }
            }
            try {
                await processJob(job);
            } catch (error) {
                console.log(`❌ Worker ${workerId} failed Job ${job._id}:`, error.message);
                
                job.attempts += 1;
                job.lockedBy = null;   // Release the lock
                job.lockedUntil = null; 

                // REQUIREMENT 3: EXPONENTIAL BACKOFF
                if (job.attempts < job.maxAttempts) {
                    job.status = "failed";
                    
                    // Math: 2^1 = 2s, 2^2 = 4s, 2^3 = 8s
                    const backoff = Math.pow(2, job.attempts) * 1000;
                    job.scheduledAt = new Date(Date.now() + backoff);
                    console.log(`⏳ Job ${job._id} will retry in ${backoff / 1000} seconds...`);
                } else {
                    // REQUIREMENT 4: DEAD LETTER QUEUE
                    job.status = "dead";
                    console.log(`💀 Job ${job._id} failed too many times. Moved to Dead Letter Queue.`);
                }
                await job.save();
            }

        } catch (error) {
            console.error("Worker generic error:", error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

module.exports = startWorker;
