import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { redis } from "../config/redis";

export const authMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token) as {
      id: string;
      role: string;
      sessionId: string;
    };

    // 🔥 SESSION VALIDATION (IMPORTANT)
    const sessionKey = `session:${decoded.id}:${decoded.sessionId}`;
    const session = await redis.get(sessionKey);

    if (!session) {
      return res.status(401).json({
        message: "Session expired or logged out",
      });
    }

    // attach user
    req.user = {
      id: decoded.id,
      role: decoded.role,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({
      message:
        err.name === "TokenExpiredError"
          ? "Token expired"
          : "Invalid token",
    });
  }
};