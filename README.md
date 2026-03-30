# 🚀 Todo API

A **secure and scalable REST API** built with Node.js, Express, and TypeScript, featuring **JWT authentication with refresh token rotation**, rate limiting, and a clean layered architecture.

---

## ✨ Features

- 🔐 **JWT Authentication**
  - Access + Refresh tokens
  - Secure refresh token rotation

- 🛡️ **Protected Routes** (middleware-based authentication)

- ⚡ **Rate Limiting**
  - API abuse protection per route

- 🧱 **Scalable Architecture**
  - Controllers / Services / Middleware / Routes separation

- ❌ **Centralized Error Handling**
  - Custom error middleware

- 📄 **Swagger API Documentation**

- 🔄 **Full CRUD for Todos**

- 🔒 **Secure Logout**
  - Token invalidation support

---

## 🧠 Why This Project Stands Out

This is not just a simple CRUD API.

It demonstrates **real-world backend engineering patterns** used in production systems:

- Secure token-based authentication with Redis-backed session control
- Clean separation of concerns (Controller → Service → Repository)
- Protection against API abuse (rate limiting)
- Maintainable and scalable codebase structure

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- TypeScript
- JWT (Authentication)
- MongoDB / Mongoose
- Swagger (API Documentation)
- Redis (session management + caching)

---

## 📦 Installation

```bash
git clone https://github.com/SarkisSanoyan/todo-api.git
cd todo-api
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
PORT=8080
MONGO_URI=your_database_url
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

## ▶️ Run the Project

```bash
npm run dev
```

---

## 🔑 API Overview

### Auth Routes

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/refresh`
* `POST /auth/logout`

### Todo Routes (Protected)

* `GET /todos`
* `POST /todos`
* `PUT /todos/:id`
* `DELETE /todos/:id`

👉 Full documentation available at `/api/v1/docs`

---

## 🔐 Authentication Flow

1. User logs in → receives:

   * Access Token (short-lived)
   * Refresh Token (stored securely)

2. When access token expires:

   * Client sends refresh token to `/auth/refresh`

3. Server:

   * Validates token
   * Issues new tokens
   * **Invalidates old refresh token (rotation)**

4. Logout:

   * Refresh token is revoked

---

## 🧱 Project Structure

This project follows a **clean layered architecture** to ensure scalability, maintainability, and separation of concerns.

```bash
src/
├── controllers/ # Handle incoming HTTP requests and responses
├── services/ # Business logic layer
├── repositories/ # Database queries and data access layer
├── routes/ # API route definitions
├── middlewares/ # Auth, error handling, rate limiting, etc.
├── utils/ # Helper functions and utilities
├── config/ # Configuration (DB, Redis, env setup)
└── app.ts # Application entry point
```

---

### 🧠 Architecture Flow

Request → Routes → Middlewares → Controllers → Services → Repositories → Database

---

### 💡 Design Principles

- Separation of concerns
- Scalable service-based architecture
- Reusable and testable business logic
- Clean and maintainable code structure

---

## 👨‍💻 Author

Built by a Fullstack Developer focused on **scalable and secure web applications**.

💼 Available for freelance & backend development work.

---

## ⭐ If you like this project

Give it a star ⭐ and feel free to use it as a starter for your own apps!
