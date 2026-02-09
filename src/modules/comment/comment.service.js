import mongoose from "mongoose";
import * as dbservice from "../../DB/dbservice.js";
import { commentmodel } from "../../DB/Models/commentmodel.js";
import { postmodel } from "../../DB/Models/post.model.js";
import { roletype } from "../../DB/Models/user.model.js";
import cloudinary from "../../utils/fileuploading/cloudinaryconfig.js";
export const createcomment = async (req, res, next) => {
  const { postId } = req.params;
  const { text } = req.body;
  const post = await dbservice.findById({
    model: postmodel,
    id: postId,
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));
  let image;
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `posts/${post.customId}/comments` },
    );
    image = { secure_url, public_id };
  }
  const comment = await dbservice.create({
    model: commentmodel,
    data: {
      text,
      createdBy: req.user._id,
      postId: post.id,
      image,
    },
  });
  return res.status(201).json({ success: true, data: { comment } });
};
export const updatecomment = async (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;
  const comment = await dbservice.findById({
    model: commentmodel,
    id: commentId,
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));
  const post = await dbservice.findOne({
    model: postmodel,
    filter: { _id: comment.postId, isDeleted: false },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));
  if (comment.createdBy.toString() !== req.user._id.toString())
    return next(new Error("unauthorized", { cause: 401 }));
  if (req.file) {
    if (comment.image && comment.image.public_id) {
      await cloudinary.uploader.destroy(comment.image.public_id);
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `posts/${post.customId}/comments` },
    );
    comment.image = { secure_url, public_id };
  }
  comment.text = text ? text : comment.text;
  await comment.save();
  return res.status(200).json({ success: true, data: { comment } });
};
export const softDeletecomment = async (req, res, next) => {
  const { commentId } = req.params;
  const comment = await dbservice.findById({
    model: commentmodel,
    id: commentId,
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));
  const post = await dbservice.findOne({
    model: postmodel,
    filter: { _id: comment.postId, isDeleted: false },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));
  const commentowner = comment.createdBy.toString() == req.user._id.toString();
  const postowner = post.createdBy.toString() == req.user._id.toString();
  const admin = req.user.role === roletype.admin;
  if (!(commentowner || postowner || admin))
    return next(new Error("unauthorized", { cause: 401 }));
  comment.isDeleted = true;
  comment.deletedBy = req.user._id;
  await comment.save();
  return res.status(200).json({ success: true, data: { comment } });
};
// comment.service.js
export const getSingleComment = async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await dbservice.findOne({
    model: commentmodel,
    filter: {
      _id: commentId,
      isDeleted: false,
    },
    populate: [
      {
        path: "createdBy",
        select: "username image",
      },
      {
        path: "postId",
        select: "content images customId",
      },
    ],
  });

  if (!comment) {
    return next(new Error("comment not found", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    data: comment,
  });
};
export const likeandunlikecomment = async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  const comment = await dbservice.findOne({
    model: commentmodel,
    filter: { _id: commentId, isDeleted: false },
  });
  if (!comment) return next(new Error("comment not found", { cause: 404 }));
  const isuserliked = comment.likes.find(
    (user) => user.toString() === userId.toString(),
  );
  if (!isuserliked) {
    comment.likes.push(userId);
  } else {
    comment.likes = comment.likes.filter(
      (user) => user.toString() !== userId.toString(),
    );
  }
  await comment.save();
  return res.status(200).json({ success: true, data: { comment } });
};
export const addreply = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    const comment = await dbservice.findOne({
      model: commentmodel,
      filter: { _id: commentId, isDeleted: false },
    });
    if (!comment) return next(new Error("comment not found", { cause: 404 }));

    const post = await dbservice.findOne({
      model: postmodel,
      filter: { _id: postId, isDeleted: false },
    });
    if (!post) return next(new Error("post not found", { cause: 404 }));

    let image;
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: `posts/${post.customId}/comments/${comment._id}` },
      );
      image = { secure_url, public_id };
    }

    const reply = await dbservice.create({
      model: commentmodel,
      data: {
        ...req.body,
        text,
        image,
        createdBy: req.user._id,
        postId: post._id,
        parentcomment: comment._id,
      },
    });

    return res.status(201).json({ success: true, data: { reply } });
  } catch (error) {
    next(error);
  }
};
export const getallcomments = async (req, res, next) => {
  const { postId } = req.params;

  const comments = await commentmodel
    .find({
      postId,
      isDeleted: false,
      parentcomment: { $exists: false }, // parent comments only
    })
    .populate({
      path: "replies",
      match: { isDeleted: false },
      options: { sort: { createdAt: 1 } }, // optional
    })
    .populate("createdBy", "username")
    .lean();

  return res.status(200).json({
    success: true,
    data: { comments },
  });
};
export const harddeletecomment = async (req, res, next) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new Error("invalid comment id", { cause: 400 }));
  }

  const comment = await commentmodel.findOneAndDelete(
    { _id: commentId },
    { throwOnNotFound: false }, // 🔥 THIS LINE FIXES EVERYTHING
  );

  if (!comment) {
    return next(new Error("comment not found", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    message: "comment deleted successfully",
  });
};
