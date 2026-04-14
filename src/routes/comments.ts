import express from "express";
import protect from "../middleware/protect";
import Comment from "../models/Comment";

const router = express.Router();

// ----- ROUTE 1: POST A COMMENT -------
// POST /api/comments/:recipeId
// protected - must be logged in to comment
// frontend sends: { text }
// backend fills in: recipeId, userId, userName from req.user

router.post("/:recipeId", protect, async (req, res) => {
  try {
    const recipeId = req.params.recipeId as string;
    const { text } = req.body;

    console.log(
      `[COMMENT] ${req.user!.email} commenting on recipe ${recipeId}`,
    );

    // Validate input
    if (!text || text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    // create comment
    const comment = await Comment.create({
      recipeId,
      userId: req.user!.id,
      userName: req.user!.name,
      text: text.trim(),
    });

    console.log(`[COMMENT] Created → ID: ${comment._id}`);

    return res.status(201).json({ comment });
  } catch (error: any) {
    console.error("[COMMENT] Error creating comment:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


// --- ROUTE 2: GET COMMENTS FOR A RECIPE ----
// GET /api/comments/:recipeId
// public — anyone can read comments, no login needed
// returns comments sorted newest first