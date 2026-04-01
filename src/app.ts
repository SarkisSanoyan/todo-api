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

const API_PREFIX = "/api/v1";

export const app = express();

app.set("trust proxy", 1);

// HTTP request logging
app.use(httpLogger);

// Swagger UI setup
app.use(
    "/api/v1/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
        explorer: true,
        customSiteTitle: "Todo API Docs",
    })
);

// CORS configuration
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

// Rate limiter: 100 requests per 60 seconds
app.use(createRateLimiter(100, 60));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        redis: "connected",
        db: "connected",
    });
});

// Welcome endpoint
app.get("/", (_req: Request, res: Response) => {
    res.json({
        message: "Welcome to the Todo API",
        status: "OK",
    });
});

// Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/todos`, todoRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});

app.use(errorMiddleware);



