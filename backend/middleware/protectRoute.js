import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        message: "No token, authorization denied!",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "No user found with this id!",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Authorization failed!",
      error: error.message,
    });
  }
};