import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;
    const user = req.user;

    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image, {
        upload_preset: "social_media",
      });
      image = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      text,
      image,
      userId: user._id,
    });

    await newPost.save();
    res.status(201).json({
      message: "Post created!",
      newPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Post failed!",
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById({ _id: id });

    if (!post) {
      return res.status(404).json({
        message: "Post not found!",
      });
    }

    if (post.image) {
      const image = post.image.split("/").slice(-1)[0];
      await cloudinary.uploader.destroy(image);
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "You can delete only your post!",
      });
    }

    await Post.findByIdAndDelete({ _id: id });
    res.status(200).json({
      message: "Post deleted!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Post failed!",
      error: error.message,
    });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id } = req.body;
    user = req.user;

    const post = await Post.findById({ _id: id });

    if (!post) {
      return res.status(404).json({
        message: "Post not found!",
      });
    }

    const isLiked = post.likes.includes(user._id);

    if (isLiked) {
      await Post.findByIdAndUpdate(id, {
        $pull: { likes: user._id },
      });
    } else {
      await Post.findByIdAndUpdate(id, {
        $push: { likes: user._id },
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Post failed!",
      error: error.message,
    });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user = req.user;

    const post = await Post.findByIdAndUpdate(
      { _id: id },
      {
        $push: { comments: { text, user: user._id } },
      }
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found!",
      });
    }

    res.status(200).json({
      message: "Comment added!",
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Post failed!",
      error: error.message,
    });
  }
};
