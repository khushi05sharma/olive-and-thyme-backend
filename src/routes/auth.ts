import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import crypto from "crypto";
import { resend } from "../config/mail";
import dotenv from "dotenv";

dotenv.config();

// router is like a mini Express app — handles just auth routes
// in index.ts we tell Express: "all /api/auth requests go here"
const router = express.Router();

// ----- ENV VALIDATION ------
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_SECRET = process.env.JWT_SECRET; // store validated value

// ---HELPER: create JWT token --------------
// We use this in both signup and login so we write it once

const createToken = (userId: string): string => {
  return jwt.sign(
    { id: userId }, // payload — what's inside the token
    JWT_SECRET, // secret key — signs the token
    { expiresIn: "7d" }, // token expires in 7 days
  );
};

// ---- ROUTE 1: SIGNUP ------
// Frontend sends: { name, email, password }
// We return: { token, user }

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(`[SIGNUP] Attempt → email: ${email}, name: ${name}`);
    //basic validation
    if (!name || !email || !password) {
      console.log(`[SIGNUP] Failed → missing fields`);
      return res.status(400).json({ message: "All fields are required" });
    }

    //check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`[SIGNUP] Failed → email already exists: ${email}`);
      return res.status(400).json({ message: "User already exists" });
    }
    //create new user
    // User.create() calls our schema which triggers pre-save hook
    const user = await User.create({ name, email, password });
    // create JWT token with user's id
    const token = createToken(user._id.toString());

    console.log(`[SIGNUP] Success → user created`);
    console.log(`  Name:  ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  ID:    ${user._id}`);
    console.log(`  Token: ${token.substring(0, 20)}...`);

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
// Frontend sends: { email, password }
// We return: { token, user }

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN] Attempt → email: ${email}`);
    //basic validation
    if (!email || !password) {
      console.log(`[LOGIN] Failed → missing fields`);
      return res
        .status(400)
        .json({ message: "please provide email and password" });
    }
    // find user by email
    // .select("+password") overrides select:false we set in schema
    // We NEED password here to compare it — only in this route
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log(`[LOGIN] Failed → no user found for: ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    //compare typed password with stored hash
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    //create token and send response
    const token = createToken(user._id.toString());

    console.log(`[LOGIN] Success → user logged in`);
    console.log(`  Name:  ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  ID:    ${user._id}`);

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

    console.log(`[ME] Success → returning user: ${user.email}`);

    return res
      .status(200)
      .json({ id: user._id, name: user.name, email: user.email });
  } catch (error: any) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

// ----- FORGOT PASSWORD ----------

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // find user by email
    const user = await User.findOne({ email });

    // IMPORTANT — always return success even if email not found
    // this prevents hackers from knowing which emails are registered
    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent",
      });
    }

    // Generate a random secure token — 32 bytes = 64 hex characters
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token expires in 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await User.updateOne({ _id: user._id }, { resetToken, resetTokenExpiry });

    // Build reset URL — frontend page that reads the token from URL
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    // Send email
    await resend.emails.send({
      from: "<onboarding@resend.dev>",
      to: email,
      subject: "Reset Your Password — Olive & Thyme",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
          <h2 style="color: #FF8A00;">Olive & Thyme </h2>
          <h3>Reset Your Password</h3>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to create a new one.</p>
          <a href="${resetUrl}"
             style="display:inline-block; margin: 16px 0; padding: 12px 24px;
                    background: #FF8A00; color: white; border-radius: 8px;
                    text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 13px;">
            This link expires in <strong>1 hour</strong>.<br/>
            If you didn't request this, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;"/>
          <p style="color: #aaa; font-size: 12px;">Olive & Thyme · Recipe Sharing Platform</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "If this email exists, a reset link has been sent",
    });
  } catch (error: any) {
    console.error("[FORGOT] Error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // find user with this token
    // also check token hasn't expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    }).select("+resetToken +resetTokenExpiry +password");

    if (!user) {
      console.log(`[RESET] Invalid or expired token`);
      return res.status(400).json({
        message:
          "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Update password
    user.password = password;

    // Clear the reset token
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save(); // pre-save hook hashes the password

    console.log(`[RESET] Password updated for: ${user.email}`);

    return res.status(200).json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error: any) {
    console.error("[RESET] Error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

export default router;
