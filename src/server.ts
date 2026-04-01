import dotenv from "dotenv";

dotenv.config();

import { app } from "./app";
import { connectDB } from "./config/db";
import { redis } from "./config/redis";

const PORT = Number(process.env.PORT) || 8080;

async function startServer() {
  try {
    // 1️⃣ DB first
    await connectDB();

    // 2️⃣ Redis connection check (node-redis safe)
    if (!redis.isOpen) {
      await redis.connect();
    }

    await redis.ping();

    // 3️⃣ Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on PORT: ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown(signal: string) {
  console.log(`⚠️ Received ${signal}. Shutting down...`);

  try {
    if (redis.isOpen) {
      await redis.quit();
    }
  } catch (err) {
    console.error("Redis shutdown error:", err);
  }

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();