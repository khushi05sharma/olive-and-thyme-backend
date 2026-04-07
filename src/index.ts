import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load .env file

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------- MIDDLEWARE --------------

// cors — allows frontend (localhost:5173) to call this backend
// without this the browser blocks all requests as a security rule

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// express.json() — lets Express read JSON from request body
// without this req.body is always undefined

app.use(express.json());

// ------ ROUTES ---------
// We register auth routes here — more routes added later
// import authRoutes from "./routes/auth"; // ← uncomment after Step 3
// app.use("/api/auth", authRoutes);

// ------ TEST ROUTE ---------

app.get("/", (req, res) => {
  res.json({ message: "Olive & Thyme API is running" });
});

// ─── CONNECT TO MONGODB THEN START SERVER ─────────────────────
// We connect to database FIRST, then start listening for requests
// If DB connection fails, we don't start the server at all

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in .env");
}
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
