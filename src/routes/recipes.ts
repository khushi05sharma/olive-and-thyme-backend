import express from "express";
import Recipe from "../models/Recipe";
import protect from "../middleware/protect";

const router = express.Router();

// ----- POST /api/recipes — CREATE RECIPE ----------
// protected — must be logged in
// author comes from JWT token — user cannot fake authorship

router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      cookingTime,
      servings,
      difficulty,
      cuisine,
      mealType,
      diet,
      ingredients,
      instructions,
    } = req.body;

    console.log(`[RECIPE] Creating recipe: "${title}" by ${req.user!.email}`);

    // filter empty strings from arrays
    const cleanIngredients = (ingredients as string[]).filter((i) => i.trim());
    const cleanInstructions = (instructions as string[]).filter((i) =>
      i.trim(),
    );

    if (cleanIngredients.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one ingredient is required" });
    }

    if (cleanInstructions.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one instruction is required" });
    }

    const recipe = await Recipe.create({
      title: title.trim(),
      description: description.trim(),
      image: image?.trim() || "",
      cookingTime: Number(cookingTime),
      servings: Number(servings),
      difficulty,
      cuisine,
      mealType,
      diet: diet || [],
      ingredients: cleanIngredients,
      instructions: cleanInstructions,
      // author info from JWT
      author: {
        id: req.user!.id,
        name: req.user!.name,
      },
    });

    console.log(`[RECIPE] Created → ID: ${recipe._id}`);

    return res.status(201).json({ recipe });
  } catch (error: any) {
    console.error("[RECIPE CREATE] Error:", error.message);
    return res.status(500).json({ message: "Server error creating recipe" });
  }
});

// ---- GET /api/recipes/my — GET MY RECIPES ------
// protected — returns only recipes by logged-in user
// sorted newest first

router.get("/my", protect, async (req, res) => {
  try {
    console.log(`[RECIPE] Fetching recipes for ${req.user!.email}`);

    const recipes = await Recipe.find({ "author.id": req.user!.id }).sort({
      createdAt: -1,
    });

    console.log(`[RECIPE] Found ${recipes.length} recipes`);

    return res.status(200).json({ recipes });
  } catch (error: any) {
    console.error("[RECIPE MY] Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error fetching your recipes" });
  }
});

// ---- GET /api/recipes/:id — GET SINGLE RECIPE -----

router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    console.log(`[RECIPE] Fetch single → ${req.params.id}`);

    return res.status(200).json(recipe);
  } catch (error: any) {
    console.error("[RECIPE GET ONE] Error:", error.message);
    return res.status(500).json({ message: "Server error fetching recipe" });
  }
});

// ---- PUT /api/recipes/:id — UPDATE RECIPE ----
// Protected — only owner can edit

router.put("/:id", protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // check ownership

    if (recipe.author.id !== req.user!.id) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this recipe" });
    }

    const {
      title,
      description,
      image,
      cookingTime,
      servings,
      difficulty,
      cuisine,
      mealType,
      diet,
      ingredients,
      instructions,
    } = req.body;

    // clean arrays

    const cleanIngredients = ingredients.filter((i: string) => i.trim());
    const cleanInstructions = instructions.filter((i: string) => i.trim());

    // update fields
    recipe.title = title.trim();
    recipe.description = description.trim();
    recipe.image = image?.trim() || "";
    recipe.cookingTime = Number(cookingTime);
    recipe.servings = Number(servings);
    recipe.difficulty = difficulty;
    recipe.cuisine = cuisine;
    recipe.mealType = mealType;
    recipe.diet = diet || [];
    recipe.ingredients = cleanIngredients;
    recipe.instructions = cleanInstructions;

    await recipe.save();

    console.log(`[RECIPE] Updated → ${req.params.id}`);

    return res.status(200).json({ recipe });
  } catch (error: any) {
    console.error("[RECIPE UPDATE] Error:", error.message);
    return res.status(500).json({ message: "Server error updating recipe" });
  }
});

// ---- DELETE /api/recipes/:id — DELETE RECIPE -----
// Protected — only the recipe owner can delete

router.delete("/:id", protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // check ownership — only author can delete
    if (recipe.author.id !== req.user!.id) {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this recipe" });
    }

    await recipe.deleteOne();

    console.log(`[RECIPE] Deleted → ${req.params.id} by ${req.user!.email}`);

    return res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error: any) {
    console.error("[RECIPE DELETE] Error:", error.message);
    return res.status(500).json({ message: "Server error deleting recipe" });
  }
});

export default router;
