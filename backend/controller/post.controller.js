import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
  try {
    let { text, image } = req.body;
    let user = req.user;

    if (image) {
      let uploadedResponse = await cloudinary.uploader.upload(image, {
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
      // Extraer el identificador público sin la extensión
      const publicId = post.image.split("/").slice(-1)[0].split(".")[0];

      // Intentar destruir la imagen
      await cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting image:", error);
        } else {
          console.log("Image deleted:", result);
        }
      });
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
    const { id } = req.params;
    const user = req.user;

    const post = await Post.findById({ _id: id });

    if (!post) {
      return res.status(404).json({
        message: "Post not found!",
      });
    }

    const isLiked = post.likes.includes(user._id);

    if (isLiked) {
      await Post.updateOne(
        { _id: id },
        {
          $pull: { likes: user._id },
        }
      );
      await User.updateOne(
        { _id: user._id },
        {
          $pull: { LikedPosts: id },
        }
      );
      const updatedLikes = post.likes.filter(
        (like) => like.toString() !== user._id.toString()
      );
      res.status(200).json({
        message: "Post unliked!",
        updatedLikes,
      });
    } else {
      await Post.updateOne(
        { _id: id },
        {
          $push: { likes: user._id },
        }
      );
      await User.updateOne(
        { _id: user._id },
        {
          $push: { LikedPosts: id },
        }
      );

      const notification = new Notification({
        from: user._id,
        to: post.userId,
        type: "like",
      });

      await notification.save();

      const updatedLikes = [...post.likes, user._id];
      res.status(200).json({
        message: "Post liked!",
        updatedLikes,
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

export const gettAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json({
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Posts not found!",
      error: error.message,
    });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const user = req.user;
    const posts = await Post.find({ userId: { $in: user.following } })
      .sort({ createdAt: -1 })
      .populate({ path: "userId", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    res.status(200).json({
      message: "Posts found!",
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Posts not found!",
      error: error.message,
    });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log(user.LikedPosts);
    const likedPosts = await Post.find({
      _id: { $in: user.LikedPosts },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json({
      data: likedPosts,
    });
  } catch (error) {
    console.log("Error in getLikedPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log(user);
    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json({
      data: posts,
    });
  } catch (error) {
    console.log("Error in getUserPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
