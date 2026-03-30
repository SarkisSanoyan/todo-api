import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: Number(process.env.PORT) || 8000,
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGO_URI: process.env.MONGO_URI || "",
};
