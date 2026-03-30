import { redis } from "../config/redis";
import { todoRepository } from "../repositories/todo.repository";
import { AppError } from "../middleware/error.middleware";

const CACHE_TTL = 60;

const cacheKey = (userId: string, page: number, limit: number) =>
    `todos:${userId}:p${page}:l${limit}`;

const cacheSetKey = (userId: string) =>
    `todos:keys:${userId}`;

export const todoService = {
    async getAll(userId: string, query: any) {
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 10);

        const key = cacheKey(userId, page, limit);

        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached);

        const todos = await todoRepository
            .findAll(userId, {})
            .skip((page - 1) * limit)
            .limit(limit);

        await redis.set(key, JSON.stringify(todos), "EX", CACHE_TTL);
        await redis.sadd(cacheSetKey(userId), key);

        return todos;
    },

    async create(userId: string, data: any) {
        const todo = await todoRepository.create({ ...data, userId });

        await this.invalidate(userId);

        return todo;
    },

    async update(id: string, userId: string, data: any) {
        const todo = await todoRepository.findById(id);

        if (!todo) {
            throw new AppError("Todo not found", 404);
        }

        if (todo.userId.toString() !== userId) {
            throw new AppError("Forbidden", 403);
        }

        const updated = await todoRepository.update(id, data);

        await this.invalidate(userId);

        return updated;
    },

    async delete(id: string, userId: string) {
        const todo = await todoRepository.findById(id);

        if (!todo) {
            throw new AppError("Todo not found", 404);
        }

        if (todo.userId.toString() !== userId) {
            throw new AppError("Forbidden", 403);
        }

        await todoRepository.delete(id);

        await this.invalidate(userId);
    },

    async invalidate(userId: string) {
        const setKey = cacheSetKey(userId);

        const keys = await redis.smembers(setKey);

        if (keys.length > 0) {
            await redis.del(...keys);
        }

        await redis.del(setKey);
    },
};