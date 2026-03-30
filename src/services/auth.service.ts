import { redis } from "../config/redis";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../utils/token";
import { hashToken } from "../utils/hash";
import { randomUUID } from "crypto";
import { AppError } from "../middleware/error.middleware";

type TokenPayload = {
    id: string;
    role: string;
    sessionId: string;
};

export const authService = {
    /**
     * ---------------- LOGIN (NEW SESSION) ----------------
     */
    async login(
        user: { _id: string; role: string },
        meta?: { ip?: string; userAgent?: string }
    ) {
        const sessionId = randomUUID();

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
            "EX",
            7 * 24 * 60 * 60
        );

        return { accessToken, refreshToken, sessionId };
    },

    /**
     * ---------------- REFRESH ----------------
     */
    async refresh(refreshToken: string) {
        let decoded: TokenPayload;

        try {
            decoded = verifyRefreshToken(refreshToken) as TokenPayload;
        } catch {
            throw new AppError("Invalid refresh token", 401);
        }

        const { id, sessionId, role } = decoded;

        const sessionKey = `session:${id}:${sessionId}`;
        const sessionRaw = await redis.get(sessionKey);

        if (!sessionRaw) {
            throw new AppError("Session expired", 401);
        }

        const session = JSON.parse(sessionRaw);

        const incomingHash = hashToken(refreshToken);

        if (session.refreshHash !== incomingHash) {
            await redis.del(sessionKey);
            throw new AppError("Refresh token reuse detected", 401);
        }

        // rotate tokens
        const newAccessToken = generateAccessToken({
            id,
            role,
            sessionId,
        });

        const newRefreshToken = generateRefreshToken({
            id,
            role,
            sessionId,
        });

        session.refreshHash = hashToken(newRefreshToken);

        await redis.set(
            sessionKey,
            JSON.stringify(session),
            "EX",
            7 * 24 * 60 * 60
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    },

    /**
     * ---------------- LOGOUT SINGLE SESSION ----------------
     */
    async logout(userId: string, sessionId: string) {
        const key = `session:${userId}:${sessionId}`;

        const exists = await redis.get(key);

        if (!exists) {
            throw new AppError("Session not found", 404);
        }

        await redis.del(key);
    },

    /**
     * ---------------- LOGOUT ALL SESSIONS ----------------
     */
    async logoutAll(userId: string) {
        const keys = await redis.keys(`session:${userId}:*`);

        if (!keys.length) {
            throw new AppError("No active sessions found", 404);
        }

        await redis.del(keys);
    },
};