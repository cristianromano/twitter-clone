import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createPost,
  deletePost,
  likeUnlikePost,
  commentOnPost,
  gettAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
} from "../controller/post.controller.js";
const postRouter = express.Router();

postRouter.get("/", protectRoute, gettAllPosts);
postRouter.post("/create", protectRoute, createPost);
postRouter.patch("/like/:id", protectRoute, likeUnlikePost);
postRouter.patch("/comment/:id", protectRoute, commentOnPost);
postRouter.delete("/:id", protectRoute, deletePost);
postRouter.get("/following", protectRoute, getFollowingPosts);
postRouter.get("/likes/:id", protectRoute, getLikedPosts);

postRouter.get("/user/:username", protectRoute, getUserPosts);
export default postRouter;
