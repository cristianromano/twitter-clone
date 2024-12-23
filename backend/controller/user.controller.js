import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado!",
      });
    }

    res.status(200).json({
      message: "Perfil encontrado!",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Perfil no encontrado!",
      error: error.message,
    });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const userLogged = req.user;

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado!",
      });
    }

    if (user._id.toString() === userLogged._id.toString()) {
      return res.status(400).json({
        message: "No puedes seguirte a ti mismo!",
      });
    }

    const isFollow = user.followers.includes(userLogged._id);

    if (isFollow) {
      await User.findByIdAndUpdate(id, {
        $pull: { followers: userLogged._id },
      });
      await User.findByIdAndUpdate(userLogged._id, {
        $pull: { following: user._id },
      });
      const newNotification = new Notification({
        from: userLogged._id,
        to: user._id,
        type: "unfollow",
      });
      await newNotification.save();
      res.status(200).json({
        message: "Usuario no seguido!",
        newNotification,
      });
    } else {
      await User.findByIdAndUpdate(id, {
        $push: { followers: userLogged._id },
      });
      await User.findByIdAndUpdate(userLogged._id, {
        $push: { following: user._id },
      });
      const newNotification = new Notification({
        from: userLogged._id,
        to: user._id,
        type: "follow",
      });
      await newNotification.save();
      res.status(200).json({
        message: "Usuario seguido!",
        newNotification,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "No se pudo seguir al usuario!",
      error: error.message,
    });
  }
};

export const getSuggestedUsers = async (req, res) => {
  const userLogged = req.user;

  try {
    const users = await User.aggregate([
      { $match: { _id: { $ne: userLogged._id, $nin: userLogged.following } } },
      { $sample: { size: 5 } },
      { $project: { password: 0 } },
    ]);

    res.status(200).json({
      message: "Usuarios sugeridos!",
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "No se pudieron obtener los usuarios sugeridos!",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  const userLogged = req.user;
  try {
    let {
      fullName,
      bio,
      link,
      coverImg,
      profileImg,
      username,
      email,
      newPassword,
      currentPassword,
    } = req.body;

    console.log(req.body);
    // Validate that only allowed fields are being updated
    const allowedUpdates = [
      "fullName",
      "bio",
      "link",
      "coverImg",
      "profileImg",
      "username",
      "email",
      "newPassword",
      "currentPassword",
    ];
    let updates = Object.keys(req.body);

    let isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        message: "Actualización no permitida!",
      });
    }

    const hashedPassword = null;
    const userCompare = await User.findById(userLogged._id);

    if (currentPassword && newPassword) {
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        userCompare.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({
          message: "Contraseña actual incorrecta!",
        });
      }

      const salt = await bcrypt.genSalt(10);

      hashedPassword = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg != null) {
      if (userLogged.profileImg) {
        let publicId = userLogged.profileImg.match(/[^/]+$/)[0].split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      let image = await cloudinary.uploader.upload(profileImg);

      profileImg = image.secure_url;
    } else {
      profileImg = userLogged.profileImg;
    }

    if (coverImg != null) {
      if (userLogged.coverImg) {
        let publicId = userLogged.coverImg.match(/[^/]+$/)[0].split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      let image = await cloudinary.uploader.upload(coverImg);
      coverImg = image.secure_url;
    } else {
      coverImg = userLogged.coverImg;
    }

    const user = await User.findByIdAndUpdate(
      userLogged._id,
      {
        fullName: fullName ? fullName : userLogged.fullName,
        bio: bio ? bio : userLogged.bio,
        link: link ? link : userLogged.link,
        profileImg: profileImg,
        coverImg: coverImg,
        username: username ? username : userLogged.username,
        email: email ? email : userLogged.email,
        password: hashedPassword ? hashedPassword : userCompare.password,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Perfil actualizado!",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "No se pudo actualizar el perfil!",
      error: error.message,
    });
  }
};

export const restorePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado!",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(newPassword, user.password);

    if (isPasswordCorrect) {
      return res.status(400).json({
        message: "La nueva contraseña no puede ser igual a la anterior!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hasPassword = await bcrypt.hash(newPassword, salt);
    user.password = hasPassword;
    await user.save();

    res.status(200).json({
      message: "Contraseña restablecida!",
    });
  } catch (error) {
    res.status(500).json({
      message: "No se pudo restablecer la contraseña!",
      error: error.message,
    });
  }
};
