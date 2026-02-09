import Joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const createpostschema = Joi.object({
  content: Joi.string().min(2).max(500).optional(),
  file: Joi.array().items(Joi.object(generalFields.fileobject)),
}).or("content", "file");
export const updatepostschema = Joi.object({
  postId: generalFields.id.required(),
  content: Joi.string().min(2).max(500).optional(),
  file: Joi.array().items(Joi.object(generalFields.fileobject)),
}).or("content", "file");
export const softdeleteschema = Joi.object({
  postId: generalFields.id.required(),
});
export const restorepostschema = Joi.object({
  postId: generalFields.id.required(),
});
export const getsinglepostschema = Joi.object({
  postId: generalFields.id.required(),
});
export const likeandunlikeschema = Joi.object({
  postId: generalFields.id.required(),
});
