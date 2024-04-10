import { StatusCodes } from "http-status-codes";

import conn from "../mysql.js";

export const join = (req, res) => {
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
};

export const login = (req, res) => {
  res.status(200).json({ message: "로그인 완료 " });
};

export const checkEmail = (req, res) => {
  res.status(200).json({ message: "이메일 확인 완료" });
};

export const resetPassword = (req, res) => {
  res.status(200).json({ message: "비밀번호 변경 완료 " });
};

export const logout = (req, res) => {
  res.status(200).json({ message: "로그아웃 완료 " });
};
