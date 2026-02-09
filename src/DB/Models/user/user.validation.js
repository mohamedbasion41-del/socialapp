import Joi from "joi";
import {
  generalFields,
  isvalidobjectId,
} from "../../../middlewares/validation.middleware.js";

export const shareprofileschema = Joi.object({
  profileId: Joi.string().custom(isvalidobjectId).required(),
}).required();
export const updatepasswordschema = Joi.object({
  oldpassword: generalFields.password.required(),
  password: generalFields.password.not(Joi.ref("oldpassword")).required(),
  confirmpassword: generalFields.password.required()
}).required();
export const updateprofileschema = Joi.object({
  username:generalFields.username,
  phone:generalFields.phone,
  gender:generalFields.gender,
  DOB:generalFields.DOB,
  address:generalFields.address,
}).required();