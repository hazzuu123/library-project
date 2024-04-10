import express from "express";
import { Result, body, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

import * as user from "../controller/UserController.js";

const router = express.Router();

const validate = (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json(err.array());
  }
  return next();
};

router.post(
  "/join",
  [
    body("email").notEmpty().isString().withMessage("문자열로 입력해주세요."),
    body("password")
      .notEmpty()
      .isString()
      .withMessage("문자열로 입력해주세요."),
    validate,
  ],
  user.join
);

router.post("/login", user.login);

router.post("/email", user.checkEmail);

router.put("/password", user.resetPassword);

router.post("/logout", user.logout);

export default router;
