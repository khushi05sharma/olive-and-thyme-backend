import dotenv from "dotenv";
// Load .env file

dotenv.config();

console.log("ENV CHECK START ----------------");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "FOUND" : "MISSING");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "FOUND" : "MISSING");
console.log("GMAIL_USER:", process.env.GMAIL_USER ? "FOUND" : "MISSING");
console.log("GMAIL_PASS:", process.env.GMAIL_PASS ? "FOUND" : "MISSING");
console.log("ENV CHECK END ----------------");

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import commentRoutes from "./routes/comments";
import recipeRoutes from "./routes/recipes";
import notificationRoutes from "./routes/notifications";

// ─── ENV VALIDATION ───────────────────────────────────────────
// Check all required env vars exist BEFORE starting anything
// If missing — crash immediately with clear message

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in .env");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env file");
}

const app = express();
const PORT = process.env.PORT || 5000;

// ------------- MIDDLEWARE --------------

// cors — allows frontend (localhost:5173) to call this backend
// without this the browser blocks all requests as a security rule

app.use(
  cors({
    origin: ["http://localhost:5173", 
      process.env.FRONTEND_URL || ""],
    credentials: true,
  }),
);

// express.json() — lets Express read JSON from request body
// without this req.body is always undefined

app.use(express.json());

// ------- REQUEST LOGGER ---------
// This runs on EVERY request before it reaches any route
// Prints method, url, timestamp in terminal so you can see everything

app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next(); // MUST call next() — passes request to the actual route handler
});

// ------ ROUTES ---------
// We register auth routes here
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/comments", commentRoutes);

app.use("/api/recipes", recipeRoutes);

app.use("/api/notifications", notificationRoutes);

// ------ TEST ROUTE ---------

app.get("/", (req, res) => {
  res.json({ message: "Olive & Thyme API is running" });
});

// ─── 404 HANDLER ─────────────────────────────────────────────
// If no route matched — send clear 404 instead of hanging forever
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Route not found" });
});

// ─── CONNECT TO MONGODB THEN START SERVER ─────────────────────
// We connect to database FIRST, then start listening for requests
// If DB connection fails, we don't start the server at all

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });
