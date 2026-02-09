import { Router } from "express";
import * as postservice from "./post.service.js";
import * as postvalidation from "./post.validation.js";
import { allowto, authentication } from "../../middleware/auth.middleware.js";
import { asynchandler } from "../../utils/errorhandling/asynchandler.js";
import { uploadcloud } from "../../utils/fileuploading/multercloud.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { commentRouter } from "../comment/comment.controller.js";
const router = Router();
router.use("/:postId/comment", commentRouter);
router.post(
  "/create",
  authentication,
  allowto(["user"]),
  uploadcloud().array("images", 5),
  validation(postvalidation.createpostschema),
  asynchandler(postservice.createpost),
);
router.get(
  "/getallposts",
  authentication,
  allowto(["user"]),
  asynchandler(postservice.getallactiveposts),
);
router.post(
  "/update/:postId",
  authentication,
  allowto(["user"]),
  uploadcloud().array("images", 5),
  validation(postvalidation.updatepostschema),
  asynchandler(postservice.updatepost),
);
router.patch(
  "/softdelete/:postId",
  authentication,
  allowto(["user", "admin"]),
  validation(postvalidation.softdeleteschema),
  asynchandler(postservice.softdelete),
);
router.patch(
  "/restorepost/:postId",
  authentication,
  allowto(["user", "admin"]),
  validation(postvalidation.restorepostschema),
  asynchandler(postservice.restorepost),
);
router.get(
  "/:postId",
  authentication,
  allowto(["user", "admin"]),
  validation(postvalidation.getsinglepostschema),
  asynchandler(postservice.getsinglepost),
);
router.get(
  "/activate/posts",
  authentication,
  allowto(["user", "admin"]),
  asynchandler(postservice.activateposts),
);
router.get(
  "/freeze/posts",
  authentication,
  allowto(["user", "admin"]),
  asynchandler(postservice.freezeposts),
);
router.patch(
  "/like_unlike/:postId",
  authentication,
  allowto(["user"]),
  validation(postvalidation.likeandunlikeschema),
  asynchandler(postservice.likeandunlike),
);


export default router;
