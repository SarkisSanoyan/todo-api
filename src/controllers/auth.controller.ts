import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { authService } from "../services/auth.service";

/**
 * ---------------- REGISTER ----------------
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            email,
            password: hashedPassword,
            role: "user",
        });

        return res.status(201).json({
            message: "User registered successfully",
            userId: user._id,
        });
    } catch (err: any) {
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

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
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
            return res.status(401).json({ message: "No refresh token" });
        }

        const tokens = await authService.refresh(refreshToken);

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        });

        return res.json({
            accessToken: tokens.accessToken,
        });
    } catch (err: any) {
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
            return res.status(401).json({ message: "Unauthorized" });
        }

        await authService.logout(userId, sessionId);

        res.clearCookie("refreshToken");

        return res.json({
            message: "Logged out from this session",
        });
    } catch (err: any) {
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