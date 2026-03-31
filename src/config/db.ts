import "dotenv/config";
import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error("MONGO_URI is not defined in .env");
    }

    try {
        await mongoose.connect(uri);
        console.log(`✅ MongoDB connected: ${uri}`);
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};