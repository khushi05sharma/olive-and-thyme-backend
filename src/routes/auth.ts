import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Router is like a mini Express app — handles just auth routes
// In index.ts we tell Express: "all /api/auth requests go here"
const router = express.Router();

// ----- ENV VALIDATION ------
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_SECRET = process.env.JWT_SECRET; // store validated value

// ─── HELPER: create JWT token ─────────────────────────────────
// We use this in both signup and login so we write it once

const createToken = (userId: string): string => {
  return jwt.sign(
    { id: userId }, // payload — what's inside the token
    JWT_SECRET, // secret key — signs the token
    { expiresIn: "7d" }, // token expires in 7 days
  );
};

// ─── ROUTE 1: SIGNUP ──────────────────────────────────────────
// POST /api/auth/signup
// Frontend sends: { name, email, password }
// We return: { token, user }

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    //create new user
    // User.create() calls our schema which triggers pre-save hook
    const user = await User.create({ name, email, password });
    // create JWT token with user's id
    const token = createToken(user._id.toString());
    // send response back to frontend
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    return res.status(500).json({ message: "Server error during signup" });
  }
});
