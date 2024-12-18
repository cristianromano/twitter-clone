import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ to: req.user._id })
      .populate("from", "username profileImg")
      .populate("to", "username profileImg");

    await Notification.updateMany({ to: req.user._id }, { read: true });

    res.status(200).json({
      message: "Notifications fetched successfully!",
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get notifications!",
      error: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const id = req.user._id;

    await Notification.deleteMany({ to: id });

    res.status(200).json({
      message: "Notification deleted!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete notification!",
      error: error.message,
    });
  }
};
