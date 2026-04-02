import "dotenv/config";
import mongoose from "mongoose";

// MongoDB connection
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

// MongoDB disconnection
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("👋 MongoDB disconnected gracefully");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ MongoDB Disconnect Error: ${error.message}`);
    } else {
      console.error(`❌ MongoDB Disconnect Error: ${String(error)}`);
    }
  }
};