const express=require("express")
const Router =require("./routes/job.routes")
const app=express();

app.use(express.json());

app.use("/api/jobs", Router);

module.exports=app;