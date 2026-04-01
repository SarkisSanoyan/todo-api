export const config = {
  PORT: Number(process.env.PORT) || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI!,
  ACCESS_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET!,
};