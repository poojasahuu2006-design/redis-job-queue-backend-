const mongoose=require("mongoose")
const express=require("express")
const jobController =require("../controllers/job.controllers")

const router=express.Router();

router.post("/",jobController.createJobs);
router.get("/",jobController.getAllJobs);

//static APIS first then only the dynamic APIS
router.get("/queueStatus",jobController.inspectQueue);
router.get("/:id",jobController.getJobById);
router.delete("/:id",jobController.deleteJobs);




module.exports=router;