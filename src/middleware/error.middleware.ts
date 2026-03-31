import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Internal Server Error";

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        message = err.message;
    }

    // 🔥 Structured logging
    logger.error({
        message,
        statusCode,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        stack: err instanceof Error ? err.stack : undefined,
    });

    return res.status(statusCode).json({
        message,
    });
};