import Joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const registerSchema = Joi.object({
  username: generalFields.username.required(),
  email: generalFields.email.required(),
  password: generalFields.password.required(),
  confirmPassword: generalFields.confirmPassword.required(),
});

export const confirmEmailSchema = Joi.object({
  email: generalFields.email.required(),
  code: generalFields.code.required(),
});
export const forgotPasswordSchema = Joi.object({
  email: generalFields.email.required(),
});
export const resetpasswordschema = Joi.object({
  email: generalFields.email.required(),
  code: generalFields.code.required(),
  password: generalFields.password.required(),
  confirmPassword: generalFields.confirmPassword.required(),
}).required();
export const updateEmailSchema = Joi.object({
  email: generalFields.email.required(),
});

