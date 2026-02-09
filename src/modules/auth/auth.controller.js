import { Router } from "express";
import { sendEmails } from "../../utils/email/sendemail.js";
const router = Router();

import * as authservice from "./auth.service.js";
import * as authvalidation from "./auth.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { asynchandler } from "../../utils/errorhandling/asynchandler.js";

router.post(
  "/register",
  validation(authvalidation.registerSchema),
  asynchandler(authservice.register)
);

router.patch(
  "/VerifyEmail",
  validation(authvalidation.confirmEmailSchema),
  asynchandler(authservice.confirmEmail)
);
router.post(
  "/forgot_password",
  validation(authvalidation.forgotPasswordSchema),
  asynchandler(authservice.forgotPassword)
);
router.patch(
  "/reset_password",
  validation(authvalidation.resetpasswordschema),
  asynchandler(authservice.resetpassword)
);
router.post("/loginWithGmail", asynchandler(authservice.loginWithGmail));
router.post("/login", asynchandler(authservice.login));

export default router;
