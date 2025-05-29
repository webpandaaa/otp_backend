import mongoose from "mongoose";
import { config } from "dotenv";

export const connection = () =>{
    mongoose.connect(process.env.MONGO_URI, {
        dbName : "OTP_AUTHENTICATION",
    })
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed", error);
    });
}

