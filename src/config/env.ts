export const config = {
  PORT: Number(process.env.PORT) || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI!,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL!,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN!,
  ACCESS_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET!,
};