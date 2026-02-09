import mongoose, { Schema, model, Types } from "mongoose";
import { hash } from "../../utils/hashing/hashing.js";
export const gendertype = {
  male: "male",
  female: "female",
};

export const roletype = {
  admin: "admin",
  user: "user",
};

export const providerstype = {
  system: "system",
  google: "google",
};
export const defimage = "upload/defaultimage.png";
export const defaultimageoncloud =
  "https://res.cloudinary.com/datnneukf/image/upload/v1767720704/d549da03-5987-460b-948c-dd2220ce9346_odzd9q.png";
export const defaultpublicIdoncloud =
  "d549da03-5987-460b-948c-dd2220ce9346_odzd9q";
const userschema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: [3, "min length must be at least 3 characters"],
      maxlength: [20, "max length must be at most 20 characters"],
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
    },

    phone: String,
    address: String,
    DOB: Date,
    image: {
      secure_url: {
        type: String,
        default: defaultimageoncloud,
      },
      public_id: { type: String, default: defaultpublicIdoncloud },
    },

    coverimages: [String],

    gender: {
      type: String,
      enum: Object.values(gendertype),
      default: gendertype.male,
    },

    role: {
      type: String,
      enum: Object.values(roletype),
      default: roletype.user,
    },

    providers: {
      type: String,
      enum: Object.values(providerstype),
      default: providerstype.system,
    },

    confirmEmail: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    changecredentialsTime: Date,

    /* ---------------- OTP FIELDS (FIXED) ---------------- */

    // OTP sent during register email verification
    confirmEmailOTP: {
      type: String,
    },

    // OTP for forget password
    forgetPasswordOtp: {
      type: String,
    },

    // OTP for update email
    tempEmailOTP: {
      type: String,
    },

    // New email waiting for verification
    tempEmail: {
      type: String,
    },

    viewers: [
      {
        userId: { type: Types.ObjectId, ref: "user" },
        time: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);
userschema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = hash({ plaintext: this.password });
    return next();
  }
});
export const usermodel = mongoose.models.user || model("user", userschema);
