import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { swaggerDocument } from "./swagger";

import authRoutes from "./routes/auth.routes";
import todoRoutes from "./routes/todo.routes";

import { errorMiddleware } from "./middleware/error.middleware";
import { createRateLimiter } from "./middleware/rateLimit.middleware";
import { httpLogger } from "./middleware/logger.middleware";

import { redis } from "./config/redis";
import mongoose from "mongoose";

const API_PREFIX = "/api/v1";

export const app = express();

// Trust proxy (for correct client IPs behind proxies)
app.set("trust proxy", 1);

// HTTP request logger (morgan)
app.use(httpLogger);

// CORS configuration (adjust origin as needed)
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiter (100 requests per minute)
app.use(API_PREFIX, createRateLimiter(100, 60));

// Swagger UI setup
app.use(
    "/api/v1/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
        explorer: true,
        customSiteTitle: "Todo API Docs",
    })
);

// Health check endpoint
app.get("/health", async (_req: Request, res: Response) => {
    const redisStatus = redis.isOpen ? "connected" : "disconnected";
    const dbStatus =
        mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.json({
        status: "ok",
        redis: redisStatus,
        db: dbStatus,
    });
});

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
    res.json({
        message: "Welcome to the Todo API",
        status: "OK",
    });
});

// API routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/todos`, todoRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use(errorMiddleware);