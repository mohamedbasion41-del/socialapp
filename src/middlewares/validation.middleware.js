import Joi from "joi";
import mongoose, { now } from "mongoose";
import { gendertype } from "../DB/Models/user.model.js";

export const isvalidobjectId = (value, helper) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helper.message("invalid id");
  }
  return value; // مهم جداً
};
export const generalFields = {
  username: Joi.string().min(3).max(20),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: Joi.string().pattern(
    new RegExp(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
  ),
  confirmPassword: Joi.string().valid(Joi.ref("password")),
  code: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required(),
  id: Joi.string().custom(isvalidobjectId),
  DOB: Joi.date().less("now"),
  gender: Joi.string().valid(...Object.values(gendertype)),
  address: Joi.string(),
  phone: Joi.string().pattern(new RegExp("^01[0-2,5][0-9]{8}$")),
  fileobject: {
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
  },
};

// ✅ Validation middleware
export const validation = (schema) => {
  return (req, res, next) => {
    const data = {
      ...req.body,
      ...req.query,
      ...req.params,
    };
    if (req.file || req.files?.length) {
      data.file = req.file || req.files;
    }
const result = schema.validate(data, {
  abortEarly: false,
  allowUnknown: true,
});

    if (result.error) {
      const messages = result.error.details.map((err) => err.message);
      return res.status(400).json({ success: false, message: messages });
    }

    req.validData = result.value;
    next();
  };
};
