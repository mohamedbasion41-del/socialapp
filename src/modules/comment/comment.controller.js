import { Router } from "express";
import * as commentservice from "./comment.service.js";
import * as commentvalidation from "./comment.validation.js";
import { allowto, authentication } from "../../middleware/auth.middleware.js";
import { asynchandler } from "../../utils/errorhandling/asynchandler.js";
import { uploadcloud } from "../../utils/fileuploading/multercloud.js";
import { validation } from "../../middlewares/validation.middleware.js";
export const commentRouter= Router({ mergeParams: true });
commentRouter.post(
  "/",
  authentication,
  allowto(["user"]),
  uploadcloud().single("image"),
  validation(commentvalidation.createcommentschema),
  asynchandler(commentservice.createcomment),
);
commentRouter.patch(
  "/:commentId",
  authentication,
  allowto(["user"]),
  uploadcloud().single("image"),
  validation(commentvalidation.updatecommentschema),
  asynchandler(commentservice.updatecomment),
);
commentRouter.patch(
  "/softDeletecomment/:commentId",
  authentication,
  allowto(["user","admin"]),
  validation(commentvalidation.softDeletecommentschema),
  asynchandler(commentservice.softDeletecomment),
);
commentRouter.get(
  "/:commentId",
  authentication,
  allowto(["user", "admin"]),
  validation(commentvalidation.getSingleCommentSchema),
  asynchandler(commentservice.getSingleComment)
);
commentRouter.patch(
  "/like_unlikecomment/:commentId",
  authentication,
  allowto(["user"]),
  validation(commentvalidation.likeandunlikecommentschema),
  asynchandler(commentservice.likeandunlikecomment),
);
commentRouter.post(
  "/:commentId",
  authentication,
  allowto(["user"]),uploadcloud().single("image"),
  validation(commentvalidation.addreplyschema),
  asynchandler(commentservice.addreply),
);
commentRouter.get("/",authentication,allowto(["user","admin"]),asynchandler(commentservice.getallcomments))
commentRouter.delete(
  "/:commentId",
  authentication,
  allowto(["user","admin"]),
  validation(commentvalidation.harddeletecommentschema),
  asynchandler(commentservice.harddeletecomment),
);
