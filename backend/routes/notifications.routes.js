import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getNotifications,
  deleteNotification,
} from "../controller/notification.controller.js";
const notificationRouter = express.Router();

notificationRouter.get("/:id", protectRoute, getNotifications);
notificationRouter.delete("/", protectRoute, deleteNotification);

export default notificationRouter;
