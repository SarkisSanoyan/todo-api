import { Router } from "express";
import {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
} from "../controllers/todo.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { createRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// auth
router.use(authMiddleware);

// per-route tuning
router.post("/", createRateLimiter(20, 60), createTodo);
router.get("/", createRateLimiter(10, 60), getTodos);
router.put("/:id", createRateLimiter(20, 60), updateTodo);
router.delete("/:id", createRateLimiter(10, 60), deleteTodo);

export default router;