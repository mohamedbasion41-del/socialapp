import Joi from "joi";
import { isValidObjectId } from "mongoose";
import { roletype } from "../user.model.js";
export const changeRoleschema = Joi.object({
  userId: Joi.custom(isValidObjectId).required(),
  role: Joi.string()
    .valid(...Object.values(roletype))
    .required(),
}).required();
