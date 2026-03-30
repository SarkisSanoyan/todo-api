import jwt from "jsonwebtoken";

const ACCESS_SECRET = "ACCESS_SECRET";
const REFRESH_SECRET = "REFRESH_SECRET";

export const generateAccessToken = (payload: any) =>
    jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });

export const generateRefreshToken = (payload: any) =>
    jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) =>
    jwt.verify(token, REFRESH_SECRET);