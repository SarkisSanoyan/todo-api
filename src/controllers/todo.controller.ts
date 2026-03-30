import { Request, Response } from "express";
import { todoService } from "../services/todo.service";

export const createTodo = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const todo = await todoService.create(userId, req.body);

  res.status(201).json(todo);
};

export const getTodos = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const todos = await todoService.getAll(userId, req.query);

  res.json(todos);
};

export const updateTodo = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const updated = await todoService.update(
    req.params.id as string,
    userId,
    req.body
  );

  res.status(200).json(updated);
};

export const deleteTodo = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await todoService.delete(req.params.id as string, userId);

  res.json({ message: "Deleted" });
};