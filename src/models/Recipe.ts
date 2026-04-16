import mongoose, { Document, Model } from "mongoose";

export interface IRecipe extends Document {
  title: string;
  description: string;
  image: string;
  cookingTime: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  cuisine: string;
  mealType: string;
  diet: string[];
  ingredients: string[];
  instructions: string[];
  likes: number;
  author: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

const recipeSchema = new mongoose.Schema<IRecipe>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
    },
    // URL string — no file uploads for now
    image: {
      type: String,
      default: "",
    },
    cookingTime: {
      type: Number,
      required: true,
      min: [1, "Cooking time must be at least 1 minute"],
    },
    servings: {
      type: Number,
      required: true,
      min: [1, "Must serve at least 1"],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
      trim: true,
    },
    mealType: {
      type: String,
      required: true,
    },
    diet: {
      type: [String],
      default: [],
    },
    ingredients: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "At least one ingredient is required",
      },
    },
    instructions: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "At least one instruction is required",
      },
    },

    likes: {
      type: Number,
      default: 0,
    },
    // author info stored directly — from JWT, never from user input
    // no separate lookup needed when displaying recipes
    author: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  },
);

const Recipe: Model<IRecipe> = mongoose.model<IRecipe>("Recipe", recipeSchema);
export default Recipe;
