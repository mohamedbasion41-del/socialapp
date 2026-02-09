import Joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const createcommentschema = Joi.object({
  text: Joi.string().min(2).max(500),
  postId: generalFields.id.required(),
}).or("text", "file");
export const updatecommentschema = Joi.object({
  text: Joi.string().min(2).max(500),
  commentId: generalFields.id.required(),
}).or("text", "file");
export const softDeletecommentschema = Joi.object({
  commentId: generalFields.id.required(),
});
export const getSingleCommentSchema = Joi.object({
  commentId: generalFields.id.required(),
});
export const likeandunlikecommentschema = Joi.object({
  commentId: generalFields.id.required(),
});
export const addreplyschema = Joi.object({
  text: Joi.string().min(2).max(500),
  postId: generalFields.id.required(),
  file: Joi.object(generalFields.fileobj),
  commentId: generalFields.id.required(),
}).or("text", "file");
export const harddeletecommentschema = Joi.object({
  commentId: generalFields.id.required(),
});