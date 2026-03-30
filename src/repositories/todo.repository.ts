import { Todo } from "../models/todo.model";

export const todoRepository = {
    create: (data: any) => Todo.create(data),

    findAll: (userId: string, query: any) =>
        Todo.find({ userId, ...query }),

    findById: (id: string) => Todo.findById(id),

    update: (id: string, data: any) =>
        Todo.findByIdAndUpdate(id, data, { new: true }),

    delete: (id: string) =>
        Todo.findByIdAndDelete(id),
};