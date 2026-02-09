import { Router } from "express";
import { authentication } from "../../../middleware/auth.middleware.js";
import { asynchandler } from "../../../utils/errorhandling/asynchandler.js";
import { validation } from "../../../middlewares/validation.middleware.js";
import * as userservice from "./user.service.js";
import * as uservalidation from "../../Models/user/user.validation.js";
import * as authvalidation from "../../../modules/auth/auth.validation.js";
import { filevalidation, upload } from "../../../utils/fileuploading/multerupload.js";
import { uploadcloud } from "../../../utils/fileuploading/multercloud.js";

const router = Router();

router.get("/profile", authentication, asynchandler(userservice.getprofile));
router.get(
  "/profile/:profileId",
  validation(uservalidation.shareprofileschema, "params"),
  authentication,
  asynchandler(userservice.shareprofile)
);
router.patch(
  "/profile/email",
  validation(authvalidation.updateEmailSchema),
  authentication,
  asynchandler(userservice.updateemail)
);
router.patch(
  "/updatepassword",
  validation(uservalidation.updatepasswordschema),
  authentication,
  asynchandler(userservice.updatepassword)
);
router.patch(
  "/updateprofile",
  validation(uservalidation.updateprofileschema),
  authentication,
  asynchandler(userservice.updateprofile)
);
router.post(
  "/profilepicture",
  authentication,
  upload(filevalidation.images,"upload/user").single("image"),
  asynchandler(userservice.uploadimagedesk)
);
router.post(
  "/multipleimages",
  authentication,
  upload().array("images",3),
  asynchandler(userservice.uploadmultipleimages)
);
router.delete(
  "/deleteprofilepic",
  authentication,
  asynchandler(userservice.deleteprofilepic)
);
router.delete(
  "/deleteprofilepiconcloud",
  authentication,
  asynchandler(userservice.deleteprofilepiccloud)
);

router.post("/uploadcloud",authentication,uploadcloud().single("image"),asynchandler(userservice.uploadimageoncloud))
export default router;
