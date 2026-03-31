import jwt from "jsonwebtoken";
import { config } from "../config/env";

const ACCESS_SECRET = config.ACCESS_SECRET;
const REFRESH_SECRET = config.REFRESH_SECRET;

export const generateAccessToken = (payload: any) =>
    jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m", algorithm: "HS256" });
export const generateRefreshToken = (payload: any) =>
    jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d", algorithm: "HS256" });

export const verifyAccessToken = (token: string) =>
    jwt.verify(token, ACCESS_SECRET, { algorithms: ["HS256"] });

export const verifyRefreshToken = (token: string) =>
    jwt.verify(token, REFRESH_SECRET, { algorithms: ["HS256"] });