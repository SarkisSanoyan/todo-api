import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { authService } from "../services/auth.service";

import { logger } from "../utils/logger";

/**
 * ---------------- REGISTER ----------------
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        logger.info("Register attempt", { email });

        if (!email || !password) {
            logger.warn("Register failed - missing fields", { email });
            return res.status(400).json({ message: "Email and password required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            logger.warn("Register failed - user exists", { email });
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            email,
            password: hashedPassword,
            role: "user",
        });

        logger.info("User registered", { userId: user._id });

        return res.status(201).json({
            message: "User registered successfully",
            userId: user._id,
        });
    } catch (err: any) {
        logger.error("Register error", { error: err.message });
        return res.status(500).json({
            message: err.message || "Server error",
        });
    }
};

/**
 * ---------------- LOGIN ----------------
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        logger.info("Login attempt", { email, ip: req.ip });

        if (!email || !password) {
            logger.warn("Login failed - missing fields", { email });
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            logger.warn("Login failed - user not found", { email });
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            logger.warn("Login failed - wrong password", { email });
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const { accessToken, refreshToken, sessionId } =
            await authService.login(
                {
                    _id: user._id.toString(),
                    role: user.role,
                },
                {
                    ip: req.ip,
                    userAgent: req.headers["user-agent"] as string,
                }
            );

        logger.info("User logged in", {
            userId: user._id,
            sessionId,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        });

        return res.json({
            accessToken,
            sessionId,
        });
    } catch (err: any) {
        logger.error("Login error", { error: err.message });
        return res.status(500).json({
            message: err.message || "Server error",
        });
    }
};

/**
 * ---------------- REFRESH ----------------
 */
export const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            logger.warn("Refresh failed - no token", { ip: req.ip });
            return res.status(401).json({ message: "No refresh token" });
        }

        const tokens = await authService.refresh(refreshToken);

        logger.info("Token refreshed", { ip: req.ip });

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        });

        return res.json({
            accessToken: tokens.accessToken,
        });
    } catch (err: any) {
        logger.warn("Refresh failed", { error: err.message });
        return res.status(401).json({
            message: err.message || "Invalid refresh token",
        });
    }
};

/**
 * ---------------- LOGOUT (single session) ----------------
 */
export const logout = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        const sessionId = req.user?.sessionId;

        if (!userId || !sessionId) {
            logger.warn("Logout failed - unauthorized");
            return res.status(401).json({ message: "Unauthorized" });
        }

        await authService.logout(userId, sessionId);

        logger.info("User logged out", { userId, sessionId });

        res.clearCookie("refreshToken");

        return res.json({
            message: "Logged out from this session",
        });
    } catch (err: any) {
        logger.error("Logout error", { error: err.message });
        return res.status(500).json({
            message: err.message || "Server error",
        });
    }
};

/**
 * ---------------- LOGOUT ALL SESSIONS ----------------
 */
export const logoutAll = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await authService.logoutAll(userId);

        res.clearCookie("refreshToken");

        return res.json({
            message: "Logged out from all sessions",
        });
    } catch (err: any) {
        return res.status(500).json({
            message: err.message || "Server error",
        });
    }
};