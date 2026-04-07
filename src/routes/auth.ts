import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

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

// ---- ROUTE 1: SIGNUP ------
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

// ----- ROUTE 2: LOGIN -------
// POST /api/auth/login
// Frontend sends: { email, password }
// We return: { token, user }

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "please provide email and password" });
    }
    // find user by email
    // .select("+password") overrides select:false we set in schema
    // We NEED password here to compare it — only in this route
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    //compare typed password with stored hash
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    //create token and send response
    const token = createToken(user._id.toString());

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login" });
  }
});

// ---- ROUTE 3: GET CURRENT USER -----

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    //verify the token
    // jwt.verify checks signature and expiry
    // If expired or tampered — it throws an error
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // find user in database using id from token
    // .select("-password") means return everything EXCEPT password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

export default router;
