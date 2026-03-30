import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { swaggerDocument } from "./swagger";

import authRoutes from "./routes/auth.routes";
import todoRoutes from "./routes/todo.routes";

import { Todo } from "./models/todo.model";
import { errorMiddleware } from "./middleware/error.middleware";
import { createRateLimiter } from "./middleware/rateLimit.middleware";

const API_PREFIX = "/api/v1";

export const app = express();

app.set("trust proxy", 1);

app.use(
    "/api/v1/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
        explorer: true,
        customSiteTitle: "Todo API Docs",
    })
);

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.use(createRateLimiter(100, 60));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
    res.json({
        message: "Welcome to the Todo API",
        status: "OK",
    });
});

app.get("/test-db", async (_req, res) => {
    await Todo.create({ title: "Hello DB" });
    res.send("Inserted");
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/todos`, todoRoutes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});

app.use(errorMiddleware);


