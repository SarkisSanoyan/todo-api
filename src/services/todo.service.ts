import { redis } from "../config/redis";
import { todoRepository } from "../repositories/todo.repository";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";

const CACHE_TTL = 60;

// Cache key format: todos:{userId}:p{page}:l{limit}
const cacheKey = (userId: string, page: number, limit: number) =>
    `todos:${userId}:p${page}:l${limit}`;

// Set key format for tracking all cache keys per user: todos:keys:{userId}
const cacheSetKey = (userId: string) =>
    `todos:keys:${userId}`;

export const todoService = {
    async getAll(userId: string, query: any) {
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 10);

        const key = cacheKey(userId, page, limit);

        const cached = await redis.get(key);

        if (cached) {
            logger.debug("Todos cache hit", { userId, page, limit });
            return JSON.parse(cached as string);
        }

        logger.debug("Todos cache miss", { userId, page, limit });

        const todos = await todoRepository
            .findAll(userId, {})
            .skip((page - 1) * limit)
            .limit(limit);

        await redis.set(key, JSON.stringify(todos), {
            EX: CACHE_TTL,
        });

        await redis.sAdd(cacheSetKey(userId), key);

        return todos;
    },

    async create(userId: string, data: any) {
        const todo = await todoRepository.create({ ...data, userId });

        logger.info("Todo created", {
            userId,
            todoId: todo._id,
        });

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

        logger.info("Todo updated", { userId, todoId: id });

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

        logger.info("Todo deleted", { userId, todoId: id });

        await this.invalidate(userId);
    },

    async invalidate(userId: string) {
        const setKey = cacheSetKey(userId);

        const keys = (await redis.sMembers(setKey)) as string[];

        if (keys && keys.length > 0) {
            await redis.del(keys);
        }

        await redis.del(setKey);

        logger.debug("Cache invalidated", {
            userId,
            keysRemoved: keys?.length ?? 0,
        });
    },
};