import express from "express";

import * as user from "../controller/UserController.js";
import validate, {
  validateEmail,
  validatePassword,
} from "../validateInputMiddleware.js";

const router = express.Router();

router.post("/join", [validateEmail, validatePassword, validate], user.join);

router.post("/login", [validateEmail, validatePassword, validate], user.login);

router.post("/check-email", [validateEmail, validate], user.checkEmail);

router.put(
  "/reset-password",
  [validateEmail, validatePassword, validate],
  user.resetPassword
);

export default router;
