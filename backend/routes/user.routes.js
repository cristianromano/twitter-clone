import express from "express";
import {
  followUnfollowUser,
  getProfile,
  getSuggestedUsers,
  updateProfile,
  restorePassword,
  getUserPosts,
} from "../controller/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import multer from "multer";

const userRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
userRouter.get("/profile/:username", getProfile);
userRouter.post("/followUnfollowUser/:id", protectRoute, followUnfollowUser);
userRouter.get("/suggestUser", protectRoute, getSuggestedUsers);
userRouter.post(
  "/update",
  upload.single("profileImg"),
  protectRoute,
  updateProfile
);
userRouter.get("/:username", protectRoute, getUserPosts);
userRouter.patch("/restorePassword", protectRoute, restorePassword);
export default userRouter;
