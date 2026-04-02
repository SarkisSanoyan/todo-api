import { redis } from "../config/redis";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../utils/token";
import { hashToken } from "../utils/hash";
import { logger } from "../utils/logger";
import { randomUUID } from "crypto";
import { AppError } from "../middleware/error.middleware";

type TokenPayload = {
    id: string;
    role: string;
    sessionId: string;
};

export const authService = {
    async login(
        user: { _id: string; role: string },
        meta?: { ip?: string; userAgent?: string }
    ) {
        const sessionId = randomUUID();

        logger.info("Creating new session", {
            userId: user._id,
            sessionId,
            ip: meta?.ip,
        });

        const payload: TokenPayload = {
            id: user._id.toString(),
            role: user.role,
            sessionId,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const sessionKey = `session:${payload.id}:${sessionId}`;

        await redis.set(
            sessionKey,
            JSON.stringify({
                refreshHash: hashToken(refreshToken),
                ip: meta?.ip || null,
                userAgent: meta?.userAgent || null,
                createdAt: Date.now(),
            }),
            {
                "EX": 7 * 24 * 60 * 60
            }
        );

        return { accessToken, refreshToken, sessionId };
    },

    async refresh(refreshToken: string) {
        let decoded: TokenPayload;

        try {
            decoded = verifyRefreshToken(refreshToken) as TokenPayload;
        } catch {
            logger.warn("Invalid refresh token attempt");
            throw new AppError("Invalid refresh token", 401);
        }

        const { id, sessionId, role } = decoded;

        const sessionKey = `session:${id}:${sessionId}`;
        const sessionRaw = await redis.get(sessionKey);

        if (!sessionRaw) {
            logger.warn("Refresh failed - session expired", { userId: id, sessionId });
            throw new AppError("Session expired", 401);
        }

        const session = JSON.parse(sessionRaw);
        const incomingHash = hashToken(refreshToken);

        // 🚨 SECURITY CRITICAL
        if (session.refreshHash !== incomingHash) {
            logger.warn("Refresh token reuse detected", {
                userId: id,
                sessionId,
            });

            await redis.del(sessionKey);

            throw new AppError("Refresh token reuse detected", 401);
        }

        // ✅ ROTATION
        const newAccessToken = generateAccessToken({ id, role, sessionId });
        const newRefreshToken = generateRefreshToken({ id, role, sessionId });

        session.refreshHash = hashToken(newRefreshToken);

        await redis.set(sessionKey, JSON.stringify(session), {
            "EX": 7 * 24 * 60 * 60
        });

        logger.info("Refresh token rotated", {
            userId: id,
            sessionId,
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    },

    async logout(userId: string, sessionId: string) {
        const key = `session:${userId}:${sessionId}`;

        const exists = await redis.get(key);

        if (!exists) {
            logger.warn("Logout failed - session not found", {
                userId,
                sessionId,
            });

            throw new AppError("Session not found", 404);
        }

        await redis.del(key);

        logger.info("Session terminated", {
            userId,
            sessionId,
        });
    },

    async logoutAll(userId: string) {
        const keys = await redis.keys(`session:${userId}:*`);

        if (!keys.length) {
            logger.warn("Logout all - no active sessions", { userId });
            throw new AppError("No active sessions found", 404);
        }

        await redis.del(keys);

        logger.info("All sessions terminated", {
            userId,
            count: keys.length,
        });
    },
};