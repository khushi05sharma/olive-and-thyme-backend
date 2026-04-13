import express from "express";
import User from "../models/User";
import protect from "../middleware/protect";

const router = express.Router();

// purpose: Like OR Unlike a recipe (toggle behavior)

router.post("/like/:recipeId", protect, async (req, res) => {
  try {
    const recipeId = req.params.recipeId as string;
    // get logged-in user ID from JWT (added by protect middleware)
    const userId = req.user!.id;
    console.log(`[LIKE] ${req.user!.email} → ${recipeId}`);

    // get user's current liked recipes from DB
    const user = await User.findById(userId).select("likedRecipes");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if this recipe is already liked
    // includes() checks if recipeId exists in array
    const alreadyLiked = user.likedRecipes.includes(recipeId);

    const updateUser = await User.findByIdAndUpdate(
      userId,
      alreadyLiked
        ? // if already liked -> remove it (unlike)
          { $pull: { likedRecipes: recipeId } }
        : // if not liked -> add it (no duplicates)
          { $addToSet: { likedRecipes: recipeId } },
      { new: true },
    ).select("likedRecipes");

    return res.status(200).json({
      liked: !alreadyLiked, // return new like status
      likedRecipes: updateUser!.likedRecipes, // return updated list of liked recipes
    });
  } catch (error: any) {
    console.error("[LIKE] Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});
