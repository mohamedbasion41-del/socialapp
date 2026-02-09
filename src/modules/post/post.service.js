import { nanoid } from "nanoid";
import * as dbservice from "../../DB/dbservice.js";
import cloudinary from "../../utils/fileuploading/cloudinaryconfig.js";
import { postmodel } from "../../DB/Models/post.model.js";
import { roletype } from "../../DB/Models/user.model.js";
import { commentmodel } from "../../DB/Models/commentmodel.js";
import { populate } from "dotenv";

export const createpost = async (req, res, next) => {
  const { content } = req.body;
  const allImages = [];
  const customId = nanoid(5);

  if (req.files?.length) {
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `posts/${req.user._id}/post/${customId}`,
        },
      );

      allImages.push({ secure_url, public_id });
    }
  }

  const post = await dbservice.create({
    model: postmodel,
    data: {
      content,
      images: allImages,
      createdBy: req.user._id,
      customId,
    },
  });

  return res.status(201).json({
    success: true,
    data: { post },
  });
};
export const updatepost = async (req, res, next) => {
  const { content } = req.body;
  const { postId } = req.params;

  const post = await dbservice.findOne({
    model: postmodel,
    filter: { _id: postId, createdBy: req.user._id },
  });

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found",
    });
  }

  // 🧹 Delete old images if new ones uploaded
  if (req.files?.length) {
    if (post.images?.length) {
      for (const img of post.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    const newImages = [];

    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `posts/${req.user._id}/post/${post.customId}`,
        },
      );

      newImages.push({ secure_url, public_id });
    }

    post.images = newImages;
  }

  if (content) {
    post.content = content;
  }

  await post.save();

  return res.status(200).json({
    success: true,
    data: { post },
  });
};
export const softdelete = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbservice.findById({
    model: postmodel,
    id: postId,
  });

  if (!post) {
    return next(new Error("post not found", { cause: 404 }));
  }

  if (
    post.createdBy.toString() === req.user._id.toString() ||
    req.user.role === roletype.admin
  ) {
    post.isDeleted = true;
    post.deletedBy = req.user._id;
    await post.save();

    return res.status(200).json({
      success: true,
      data: { post },
    });
  } else {
    return next(new Error("unauthorized"));
  }
};
export const restorepost = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbservice.findOneAndUpdate({
    model: postmodel,
    filter: {
      _id: postId,
      isDeleted: true,
      deletedBy: req.user._id,
    },
    data: {
      isDeleted: false,
      $unset: { deletedBy: 1 },
    },
    options: { new: true },
  });

  if (!post) {
    return next(new Error("post not found", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    data: { post },
  });
};
export const getsinglepost = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbservice.findOne({
    model: postmodel,
    filter: {
      _id: postId,
      isDeleted: false,
    },
    populate: [
      { path: "createdBy", select: "username image -_id" },
      {
        path: "comments",
        select: "text image -_id",
        match: { parentcomment: { $exists: false } },
        populate: [
          { path: "createdBy", select: "username image -_id" },
          { path: "replies", select: "username image -_id" },
        ],
      },
    ],
  });

  if (!post) {
    return next(new Error("post not found", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    data: { post },
  });
};

export const activateposts = async (req, res, next) => {
  let posts;
  if (req.user.role === roletype.admin) {
    posts = await dbservice.find({
      model: postmodel,
      filter: { isDeleted: false },

      populate: [{ path: "createdBy", select: "username image -_id" }],
    });
  } else {
    posts = await dbservice.find({
      model: postmodel,
      filter: { isDeleted: false, createdBy: req.user._id },
      populate: [{ path: "createdBy", select: "username image -_id" }],
    });
  }
  return res.status(200).json({
    success: true,
    data: { posts },
  });
};
export const freezeposts = async (req, res, next) => {
  let posts;
  if (req.user.role === roletype.admin) {
    posts = await dbservice.find({
      model: postmodel,
      filter: { isDeleted: true },

      populate: [{ path: "createdBy", select: "username image -_id" }],
    });
  } else {
    posts = await dbservice.find({
      model: postmodel,
      filter: { isDeleted: true, createdBy: req.user._id },
      populate: [{ path: "createdBy", select: "username image -_id" }],
    });
  }
  return res.status(200).json({
    success: true,
    data: { posts },
  });
};
export const likeandunlike = async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const post = await dbservice.findOne({
    model: postmodel,
    filter: { _id: postId, isDeleted: false },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));
  const isuserliked = post.likes.find(
    (user) => user.toString() === userId.toString(),
  );
  if (!isuserliked) {
    post.likes.push(userId);
  } else {
    post.likes = post.likes.filter(
      (user) => user.toString() !== userId.toString(),
    );
  }
  await post.save();
  return res.status(200).json({ success: true, data: { post } });
};
export const getallactiveposts = async (req, res, next) => {
  try {
    const cursor = postmodel.find({ isDeleted: false }).cursor();
    const results = [];

    for (
      let post = await cursor.next();
      post != null;
      post = await cursor.next()
    ) {
      const comments = await dbservice.find({
        model: commentmodel,
        filter: { postId: post._id, isDeleted: false },
        select: "text image -_id",
      });

      results.push({ post, comments });
    }

    return res.status(200).json({
      success: true,
      data: { results },
    });
  } catch (error) {
    next(error);
  }
};
