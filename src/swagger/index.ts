export const swaggerDocument = {
    openapi: "3.0.0",

    info: {
        title: "Todo API with Auth",
        version: "1.0.0",
        description: "JWT auth + refresh token rotation + Redis session management + MongoDB with Express.js / TypeScript",
    },

    servers: [
        {
            url: "http://localhost:8080/api/v1",
            description: "Local server"
        },
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },

        schemas: {
            User: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    email: { type: "string" },
                },
            },

            Todo: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    completed: { type: "boolean" },
                },
            },

            TodoCreate: {
                type: "object",
                required: ["title"],
                properties: {
                    title: { type: "string", example: "Buy milk" },
                    completed: { type: "boolean", default: false },
                },
            },

            AuthResponse: {
                type: "object",
                properties: {
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" },
                },
            },

            Error: {
                type: "object",
                properties: {
                    message: { type: "string" },
                    statusCode: { type: "number" },
                },
            },
        },
    },

    security: [
        {
            bearerAuth: [],
        },
    ],

    paths: {
        // ================= AUTH =================

        "/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Register user",
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string" },
                                    password: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "User created" },
                    400: { description: "Validation error" },
                },
            },
        },

        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Login user",
                security: [],
                responses: {
                    200: {
                        description: "Tokens returned",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/AuthResponse",
                                },
                            },
                        },
                    },
                    401: { description: "Invalid credentials" },
                },
            },
        },

        "/auth/logout": {
            post: {
                tags: ["Auth"],
                summary: "Logout user",
                responses: {
                    200: { description: "Logged out" },
                },
            },
        },

        "/auth/refresh": {
            post: {
                tags: ["Auth"],
                summary: "Refresh token",
                security: [],
                responses: {
                    200: {
                        description: "New tokens",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/AuthResponse",
                                },
                            },
                        },
                    },
                },
            },
        },

        // ================= TODOS =================

        "/todos": {
            post: {
                tags: ["Todos"],
                summary: "Create todo",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/TodoCreate",
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Created",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Todo",
                                },
                            },
                        },
                    },
                },
            },

            get: {
                tags: ["Todos"],
                summary: "Get all todos",
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Todo",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

        "/todos/{id}": {
            put: {
                tags: ["Todos"],
                summary: "Update todo",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    completed: { type: "boolean" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Updated" },
                    404: { description: "Not found" },
                },
            },

            delete: {
                tags: ["Todos"],
                summary: "Delete todo",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    200: { description: "Deleted" },
                    404: { description: "Not found" },
                },
            },
        },
    },
};