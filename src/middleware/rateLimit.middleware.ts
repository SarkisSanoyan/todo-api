import { redis } from "../config/redis";

export const createRateLimiter = (limit: number, windowSec: number) => {
    return async (req: any, res: any, next: any) => {
        const ip = req.ip.replace("::ffff:", "");   // Handle IPv4-mapped IPv6 addresses

        const key = `rate:${ip}:${req.baseUrl}`;    // Unique key per IP and route

        const count = await redis.incr(key);        // Increment request count

        if (count === 1) {
            await redis.expire(key, windowSec);
        }

        if (count > limit) {
            return res.status(429).json({ message: "Too many requests" });
        }

        next();
    };
};
