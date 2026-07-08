const mongoose =require("mongoose")

async function connectDB(){
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB is connected successfully to the server");
}

module.exports=connectDB;