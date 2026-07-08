require("dotenv").config();
const { connectRedis } = require("./src/Db/redis");
const app=require("./src/app");
const connectDB = require("./src/Db/db");
const startWorker=require("./src/workers/job.workers")

connectRedis();
connectDB();
startWorker();
app.listen(3000,()=>{
    console.log("Server is connected successfully");
})

