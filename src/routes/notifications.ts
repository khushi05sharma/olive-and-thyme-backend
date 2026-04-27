import express from "express";
import Notification from "../models/Notification";
import protect from "../middleware/protect";

const router = express.Router();

// --------- GET MY NOTIFICATIONS -------

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user!.id })
      .sort({ createdAt: -1 }) // newest first
      .limit(50); // max 50 at a time

    // Count notifications where: read = false
    const unreadCount = notifications.filter((n) => !n.read).length;

    console.log(
      `[NOTIF] Fetched ${notifications.length} for ${req.user!.email}`,
    );
    return res.status(200).json({ notifications, unreadCount });
  } catch (error: any) {
    console.error("[NOTIF GET] Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// ------ MARK ONE AS READ -------

router.patch("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user!.id },
      { read: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.status(200).json({ notification });
  } catch (error: any) {
    console.error("[NOTIF READ] Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});
