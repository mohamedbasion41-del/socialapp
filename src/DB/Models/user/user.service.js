import * as dbservice from "../../dbservice.js";
import {
  defaultimageoncloud,
  defaultpublicIdoncloud,
  usermodel,
} from "../user.model.js";
import { emailEmitter } from "../../../utils/email/emailevent.js";
import {comparehash} from "../../../utils/hashing/hashing.js"
import Joi from "joi";
import bcrypt from "bcrypt";
import { asynchandler } from "../../../utils/errorhandling/asynchandler.js";
import path from "path";
import fs from "fs";
import { defimage } from "../user.model.js";
import cloudinary from "../../../utils/fileuploading/cloudinaryconfig.js";
/* -------------------------------------------------------------
   GET PROFILE
------------------------------------------------------------- */

export const getprofile = async (req, res, next) => {
  try {
    const user = await usermodel
      .findOne({ _id: req.user._id })
      .populate({
        path: "viewers.userId",
        model: usermodel,
        select: "username email -_id",
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cleanedViewers = (user.viewers || []).map((v) => ({
      username: v.userId?.username || "",
      email: v.userId?.email || "",
    }));

    const cleanedUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      gender: user.gender,
      role: user.role,
      providers: user.providers,
      confirmEmail: user.confirmEmail,
      isDeleted: user.isDeleted,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      user: cleanedUser,
      viewers: cleanedViewers,
    });
  } catch (err) {
    next(err);
  }
};


export const shareprofile = async (req, res, next) => {
  try {
    const { profileId } = req.params;

    let user;

    if (profileId === req.user._id.toString()) {
      user = req.user;
    } else {
      user = await usermodel
        .findOneAndUpdate(
          { _id: profileId, isDeleted: false },
          {
            $push: {
              viewers: {
                userId: req.user._id,
                time: Date.now(),
              },
            },
          },
          { new: true }
        )
        .select("username email image");
    }

    if (!user) {
      return next(new Error("user not found", { cause: 404 }));
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateemail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const isEmailExist = await usermodel.findOne({ email });
    if (isEmailExist) return next(new Error("email already exist"));

    await usermodel.findByIdAndUpdate(req.user._id, { tempEmail: email });

    emailEmitter.emit("updateEmail", email, req.user.username, req.user._id);

    return res.status(200).json({
      success: true,
      message: "OTP sent to new email",
    });
  } catch (err) {
    next(err);
  }
};
export const updatepassword = asynchandler(async (req, res) => {
  const { oldpassword, password, confirmpassword } = req.body;

  if (password !== confirmpassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  if (!req.user?._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const user = await usermodel.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const match = await bcrypt.compare(oldpassword, user.password);
  if (!match) {
    return res
      .status(400)
      .json({ success: false, message: "Old password is incorrect" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.changedcredentialsTime = Date.now(); // لو بتستخدمها
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});
export const updateprofile = async (req, res, next) => {
  const user = await dbservice.findOneAndUpdate({
    model: usermodel,
    filter: { _id: req.user._id },
    data: req.body,
    options: { new: true, runvalidators: true },
  });
  return res.status(200).json({ success: true, results: { user } });
};
export const uploadimagedesk = async (req, res, next) => {
  const user = await dbservice.findByIdAndUpdate({
    model: usermodel,
    id: req.user._id,
    data: { image: req.file.path },
    options: { new: true },
  });
  return res.status(200).json({ success: true, data: { user } });
};
export const uploadmultipleimages = async (req, res, next) => {
  const user = await dbservice.findByIdAndUpdate({
    model: usermodel,
    id: req.user._id,
    data: { coverimages: req.files.map((obj) => obj.path) },
    options: { new: true },
  });
  return res.status(200).json({ success: true, data: { user } });
};
export const deleteprofilepic = async (req, res, next) => {
  const user = await dbservice.findById({
    model: usermodel,
    id: { _id: req.user._id },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // لو الصورة already default
  if (user.image === defimage) {
    return res.status(200).json({
      success: true,
      message: "Profile image already default",
      image: user.image,
    });
  }

  const imagepath = path.resolve(".", user.image);

  // أهم سطرين 👇
  if (fs.existsSync(imagepath)) {
    fs.unlinkSync(imagepath);
  }

  user.image = defimage;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile image deleted successfully",
    image: user.image,
  });
};
export const uploadimageoncloud = async (req, res, next) => {
  const user = await dbservice.findById({
    model: usermodel,
    id: { _id: req.user._id },
  });

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `user/${user._id}/profilepic`,
    }
  );

  user.image = { secure_url, public_id };
  await user.save();

  res.status(200).json({ success: true, data: { user } });
};
export const deleteprofilepiccloud = async (req, res, next) => {
  const user = await dbservice.findById({
    model: usermodel,
    id: { _id: req.user._id },
  });

  // لو الصورة already default
  if (user.image.public_id === defaultpublicIdoncloud) {
    return res.status(200).json({
      success: true,
      message: "Profile image already default",
      data: { user },
    });
  }

  const results = await cloudinary.uploader.destroy(user.image.public_id);

  if (results.result === "ok") {
    user.image = {
      secure_url: defaultimageoncloud,
      public_id: defaultpublicIdoncloud,
    };
  }

  await user.save();

  // ✅ التصحيح هنا
  res.status(200).json({ success: true, data: { user } });
};
