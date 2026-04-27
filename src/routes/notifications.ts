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

// --------- MARK ALL AS READ -------------------

router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user!.id, read: false },
      { read: true },
    );

    console.log(`[NOTIF] Marked all read for ${req.user!.email}`);

    return res
      .status(200)
      .json({ message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("[NOTIF READ ALL] Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// ----- DELETE ONE ----------------

router.delete("/:id", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user!.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    console.log(`[NOTIF] Deleted ${req.params.id}`);

    return res.status(200).json({ message: "Notification deleted" });
  } catch (error: any) {
    console.error("[NOTIF DELETE] Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
