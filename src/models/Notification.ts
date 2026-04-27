import mongoose, { Document, Model } from "mongoose";

export interface INotification extends Document {
  recipientId: string; // user who receives notification
  actorId: string; // user who caused it
  actorName: string; // stored for display
  type: "like" | "comment";
  recipeId: string; // which recipe
  recipeTitle: string; // stored for display
  message: string; // "liked your recipe" or "commented on your recipe"
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    recipientId: {
      type: String,
      required: true,
      index: true,
    },
    actorId: {
      type: String,
      required: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment"],
      required: true,
    },
    recipeId: {
      type: String,
      required: true,
    },
    recipeTitle: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Notification: Model<INotification> = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);

export default Notification;
