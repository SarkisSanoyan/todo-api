import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { createRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

const registerLimiter = createRateLimiter(5, 60);
const loginLimiter = createRateLimiter(5, 60);
const refreshLimiter = createRateLimiter(10, 60);
const logoutLimiter = createRateLimiter(20, 60);

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshLimiter, refresh);
router.post("/logout", authMiddleware, logoutLimiter, logout);

export default router;