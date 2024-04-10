import express from "express";
import { Result, body, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

import conn from "../mysql.js";
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
  (req, res) => {
    const { email, password } = req.body;

    const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
    const values = [email, password];
    conn.query(sql, values, (err, results) => {
      if (err) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "이미 존재하는 계정입니다." });
      }
      return res.status(StatusCodes.CREATED).json({ message: "회원가입 완료" });
    });
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
