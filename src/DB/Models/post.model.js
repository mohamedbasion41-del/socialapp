import mongoose, { Schema, model, Types } from "mongoose";

const postSchema = new Schema(
  {
    content: {
      type: String,
      minlength: 2,
      maxlength: 500,
      trim: true,
      required: function () {
        return !this.images || this.images.length === 0;
      },
    },

    images: [
      {
        secure_url: String,
        public_id: String,
      },
    ],

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
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
postSchema.virtual("comments", {
  ref: "comment",
  localField: "_id",
  foreignField: "postId",
});

export const postmodel = mongoose.models.post || model("post", postSchema);
