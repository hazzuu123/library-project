import express from "express";
import { Result, body, validationResult } from "express-validator";

const router = express.Router();

const validate = (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json(err.array());
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
  (req, res) => {
    res.status(201).json({ message: "회원가입 완료 " });
  }
);

router.post("/login", (req, res) => {
  res.status(200).json({ message: "로그인 완료 " });
});

router.post("/email", (req, res) => {
  res.status(200).json({ message: "이메일 확인 완료 " });
});

router.put("/password", (req, res) => {
  res.status(200).json({ message: "비밀번호 변경 완료 " });
});

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "로그아웃 완료 " });
});

export default router;
