import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createPost,
  deletePost,
  likeUnlikePost,
  commentOnPost,
  gettAllPosts,
} from "../controller/post.controller.js";
const postRouter = express.Router();

postRouter.get("/", protectRoute, gettAllPosts);
postRouter.post("/create", protectRoute, createPost);
postRouter.patch("/like/:id", protectRoute, likeUnlikePost);
postRouter.patch("/comment/:id", protectRoute, commentOnPost);
postRouter.delete("/:id", protectRoute, deletePost);

export default postRouter;