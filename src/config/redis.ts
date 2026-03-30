import Redis from "ioredis";

export const redis = new Redis({
    host: "127.0.0.1",  // Redis server host
    port: 6379,         // Default Redis port
});