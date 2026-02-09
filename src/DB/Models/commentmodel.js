import mongoose, { Schema, model, Types } from "mongoose";
import cloudinary from "../../utils/fileuploading/cloudinaryconfig.js";

const commentschema = new Schema(
  {
    text: {
      type: String,
      minlength: 2,
      maxlength: 500,
      trim: true,
      required: function () {
        return !this.images || this.images.length === 0;
      },
    },

    image: {
      secure_url: String,
      public_id: String,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },

    deletedBy: {
      type: Types.ObjectId,
      ref: "user",
    },

    likes: [
      {
        type: Types.ObjectId,
        ref: "user",
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
    customId: {
      type: String,
      required: false,
    },
    postId: {
      type: Types.ObjectId,
      ref: "post",
      required: true,
    },
    parentcomment: {
      type: Types.ObjectId,
      ref: "comment",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

commentschema.post("findOneAndDelete", async function (doc, next) {
  try {
    if (!doc) return next();

    if (doc.image?.public_id) {
      await cloudinary.uploader.destroy(doc.image.public_id);
    }

    await this.model.deleteMany({
      parentcomment: doc._id,
    });

    next();
  } catch (err) {
    next(err);
  }
});

commentschema.virtual("replies", {
  ref: "comment",
  localField: "_id",
  foreignField: "parentcomment",
  justOne: false,
});
export const commentmodel =
  mongoose.models.comment || model("comment", commentschema);
