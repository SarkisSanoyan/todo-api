import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import { app } from "./app";
import { connectDB } from "./config/db";
import { redis } from "./config/redis";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

/**
 * Graceful shutdown handler
 */
const shutdown = async () => {
    try {
        console.log("🛑 Shutting down server...");

        // Upstash = no persistent connection → nothing to close
        console.log("🔌 Redis (Upstash) requires no manual disconnect");

        process.exit(0);
    } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
    }
};

/**
 * Handle crashes
 */
process.on("unhandledRejection", (err: any) => {
    console.error("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err: any) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
});

/**
 * Graceful shutdown signals
 */
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/**
 * Start server
 */
async function startServer() {
    try {
        console.log("🚀 Starting server...");

        // ✅ MongoDB
        await connectDB();
        console.log("🟢 MongoDB connected");

        // ✅ Upstash Redis test (use SET/GET instead of ping)
        try {
            await redis.set("healthcheck", "ok", { ex: 5 });
            const value = await redis.get("healthcheck");

            if (value === "ok") {
                console.log("🟢 Redis (Upstash) ready");
            }
        } catch (err) {
            console.warn("⚠️ Redis not available (continuing without cache)");
        }

        // ✅ Start server
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
        });

    } catch (err: any) {
        console.error("❌ Startup failed:", err.message);
        process.exit(1);
    }
}

startServer();