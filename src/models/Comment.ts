import mongoose, { Document, model } from "mongoose";

export interface IComment extends Document {
  recipeId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

// ------ SCHEMA -------

const commentSchema = new mongoose.Schema<IComment>(
  {
    recipeId: {
      type: String,
      required: [true, "Recipe ID is required"],
      index: true, // for faster queries by recipeId
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxLength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  },
);

const Comment = model<IComment>("Comment", commentSchema);
export default Comment;
