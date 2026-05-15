# 🍽️ Olive & Thyme Frontend

> REST API server for Olive & Thyme — a **full-stack MERN** recipe sharing platform.

Built with **Node.js, Express.js, TypeScript, and MongoDB** to handle authentication, recipe management, comments, notifications, and password reset emails.

## Built using React, TypeScript, Tailwind CSS, and Vite.

## 🌸 Live Demo

🔗 [View Live Project](https://olive-and-thyme-frontend.vercel.app/)  
💻 [Frontend Repository](https://github.com/khushi05sharma/olive-and-thyme-frontend)
⚙️ [Backend Repository](https://github.com/khushi05sharma/olive-and-thyme-backend)

---

## About the Project

**Olive & Thyme** is a full-stack MERN recipe sharing application.

This repository contains the backend REST API that powers the entire platform. It manages user authentication with JWT, stores user-uploaded recipes in MongoDB, handles likes and saves, supports real-time notifications, and sends password reset emails via Resend.

The backend is built with **Node.js, Express.js, TypeScript, and Mongoose**, following clean architecture with separated routes, models, and middleware.

---

## Features 🌟

✅ JWT-based authentication and protected routes  
✅ Password hashing with bcrypt  
✅ Forgot/reset password via Resend email API  
✅ Recipe CRUD operations  
✅ Like and save functionality  
✅ Real-time notifications for likes and comments  
✅ Comments with author verification and delete protection  
✅ Protected routes via custom JWT middleware  
✅ Environment-based configuration for secure deployment  
✅ TypeScript throughout — full type safety

---

## Tech Stack 🛠️

| Category      | Tools Used           |
| ------------- | -------------------- |
| 🖥️ Runtime    | Node.js              |
| 🚂 Framework  | Express.js           |
| 📘 Language   | TypeScript           |
| 🗄️ Database   | MongoDB Atlas        |
| 🔌 ODM        | Mongoose             |
| 🔐 Auth       | JSON Web Token (JWT) |
| 🔒 Security   | bcryptjs             |
| 📧 Email      | Resend API           |
| ☁️ Deployment | Render               |

---

## API Endpoints 📡

### Auth Routes — `/api/auth`

| Method | Endpoint                 | Description                |
| ------ | ------------------------ | -------------------------- |
| POST   | `/signup`                | Register new user          |
| POST   | `/login`                 | Login and receive JWT      |
| GET    | `/me`                    | Get current logged-in user |
| POST   | `/forgot-password`       | Send password reset email  |
| POST   | `/reset-password/:token` | Reset password with token  |

### User Routes — `/api/users`

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| POST   | `/like/:recipeId`  | Toggle like             |
| POST   | `/save/:recipeId`  | Toggle save             |
| GET    | `/me/interactions` | Get liked/saved recipes |

### Recipe Routes — `/api/recipes`

| Method | Endpoint | Description   |
| ------ | -------- | ------------- |
| POST   | `/`      | Create recipe |
| GET    | `/my`    | User recipes  |
| GET    | `/:id`   | Single recipe |
| DELETE | `/:id`   | Delete recipe |

### Comment Routes — `/api/comments`

| Method | Endpoint      | Description                  |
| ------ | ------------- | ---------------------------- |
| POST   | `/:recipeId`  | Add comment                  |
| GET    | `/:recipeId`  | Get comments                 |
| DELETE | `/:commentId` | Delete comment (author only) |

### Notification Routes — `/api/notifications`

| Method | Endpoint    | Description                    |
| ------ | ----------- | ------------------------------ |
| GET    | `/`         | Get all notifications for user |
| PATCH  | `/:id/read` | Mark one notification as read  |
| PATCH  | `/read-all` | Mark all notifications as read |
| DELETE | `/:id`      | Delete a notification          |

---

---

## Environment Variables ⚙️

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=https://your-frontend.vercel.app
RESEND_API_KEY=your_resend_api_key
```

---

## Installation ⚙️

```bash
# 1. Clone the repository
git clone https://github.com/khushi05sharma/olive-and-thyme-backend.git

# 2. Navigate into the project folder
cd olive-and-thyme-backend

# 3. Install dependencies
npm install

# 4. Create .env file and add your environment variables

# 5. Start development server
npm run dev
```

---

## Deployment 🚀

Backend deployed on Render  
Database hosted on MongoDB Atlas  
Frontend deployed on Vercel  

---

## Security Highlights 🔒

Passwords hashed using bcrypt  
JWT-based authentication  
Protected routes using custom middleware  
Environment variables stored securely  
Authorization checks for recipe/comment ownership  

---

## Developer 👩‍💻

**Khushi Sharma**

MERN Stack Developer passionate about building secure, scalable, and well-structured backend systems.
