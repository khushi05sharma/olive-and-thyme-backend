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

    console.log("BODY:", req.body);
    console.log("TEXT:", text);

    // Validate input
    if (!text || !text.trim()) {
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

router.get("/:recipeId", async (req, res) => {
  try {
    const recipeId = req.params.recipeId as string;

    console.log(`[COMMENT] Fetching comments for recipe ${recipeId}`);

    // Find all comments for this recipe
    // sort({ createdAt: -1 }) = newest first (-1 = descending)
    const comments = await Comment.find({ recipeId }).sort({ createdAt: -1 });

    console.log(`[COMMENT] Found ${comments.length} comments`);

    return res.status(200).json({ comments });
  } catch (error: any) {
    console.error("[COMMENT GET] Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// ------- ROUTE 3: DELETE A COMMENT ---
// DELETE /api/comments/:commentId
// protected — only the comment author can delete their own comment

router.delete("/:commentId", protect, async (req, res) => {
  try {
    const commentId = req.params.commentId as string;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check this user owns this comment
    if (comment.userId !== req.user!.id) {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this comment" });
    }

    await comment.deleteOne();

    console.log(`[COMMENT] Deleted → ${commentId} by ${req.user!.email}`);

    return res.status(200).json({ message: "Comment deleted" });
  } catch (error: any) {
    console.error("[COMMENT DELETE] Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
