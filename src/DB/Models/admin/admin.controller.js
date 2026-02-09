import { Router } from "express";
import * as adminservice from "./admin.service.js";
import * as adminvalidation from "./admin.validation.js";
import {
  allowto,
  authentication,
} from "../../../middleware/auth.middleware.js";
import { asynchandler } from "../../../utils/errorhandling/asynchandler.js";
import { changeRole } from "./admin.middleware.js";
import { validation } from "../../../middlewares/validation.middleware.js";
const router = Router();
router.get(
  "/",
  authentication,
  allowto(["admin"]),
  asynchandler(adminservice.getallpostsandcomments),
);
router.patch(
  "/role",
  authentication,
  allowto(["admin"]),
  changeRole,
  validation(adminvalidation.changeRoleschema),
  asynchandler(adminservice.changerole),
);
export default router;
