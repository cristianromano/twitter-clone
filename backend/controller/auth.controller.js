import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email))
      return res.status(400).json({
        message: "email invalido!",
      });

    if (password.length < 6)
      return res.status(400).json({
        message: "debe tener minimo 6 caracteres la contraseña!",
      });

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Se requiere completar todos los campos!",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        message: "El nombre de usuario ya está en uso!",
      });
    }

    const exisitingEmail = await User.findOne({ email });
    if (exisitingEmail) {
      return res.status(400).json({
        message: "El email ya está en uso!",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      generateToken(user._id, res);
      await user.save();

      res.status(201).json({
        message: "User created successfully!",
        user,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "User creation failed!",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Se requiere completar todos los campos!",
      });
    }

    const userExist = await User.findOne({ email });

    if (!userExist) {
      return res.status(400).json({
        message: "Usuario no encontrado!",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      userExist.password || ""
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Contraseña incorrecta!",
      });
    }

    const token = generateToken(userExist._id, res);

    res.status(200).json({
      message: "Login successful!",
      user: userExist,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed!",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "Logout successful!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Logout failed!",
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({
      message: "Me successful!",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Me failed!",
      error: error.message,
    });
  }
};
