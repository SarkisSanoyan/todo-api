import { Request, Response } from "express";
import { todoService } from "../services/todo.service";

import { logger } from "../utils/logger";

export const createTodo = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    logger.warn("Create todo unauthorized");
    return res.status(401).json({ message: "Unauthorized" });
  }

  logger.info("Create todo request", { userId, body: req.body });

  const todo = await todoService.create(userId, req.body);

  logger.info("Todo created", { userId, todoId: todo._id });

  res.status(201).json(todo);
};

export const getTodos = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    logger.warn("Get todos unauthorized");
    return res.status(401).json({ message: "Unauthorized" });
  }

  logger.info("Fetching todos", { userId, query: req.query });

  const todos = await todoService.getAll(userId, req.query);

  res.json(todos);
};

export const updateTodo = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    logger.warn("Update todo unauthorized");
    return res.status(401).json({ message: "Unauthorized" });
  }

  logger.info("Update todo request", {
    userId,
    todoId: req.params.id,
  });

  const updated = await todoService.update(
    req.params.id as string,
    userId,
    req.body
  );

  logger.info("Todo updated", {
    userId,
    todoId: req.params.id,
  });

  res.status(200).json(updated);
};

export const deleteTodo = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    logger.warn("Delete todo unauthorized");
    return res.status(401).json({ message: "Unauthorized" });
  }

  logger.info("Delete todo request", {
    userId,
    todoId: req.params.id,
  });

  await todoService.delete(req.params.id as string, userId);

  logger.info("Todo deleted", {
    userId,
    todoId: req.params.id,
  });

  res.json({ message: "Deleted" });
};