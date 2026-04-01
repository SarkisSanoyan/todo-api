import { createClient } from "redis";

export const redis = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err: Error) => {
    console.error("❌ Redis error:", err);
});

async function connectRedis() {
    try {
        await redis.connect();
        console.log("🟢 Redis connected:", process.env.REDIS_URL || "redis://localhost:6379");
    } catch (err) {
        console.error("❌ Redis connection failed:", err);
        process.exit(1);
    }
}

connectRedis();