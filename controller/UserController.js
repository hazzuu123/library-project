import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import conn from "../mysql.js";

dotenv.config();

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
  const { email, password } = req.body;

  const sql = `SELECT * FROM  users WHERE email = ?`;
  const values = [email];
  conn.query(sql, values, (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "DB 오류입니다." });
    }
    const loginUser = results[0];
    if (!loginUser || loginUser.password !== password) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "아이디 혹은 비밀번호가 틀렸습니다." });
    }
    // 성공 시 로직
    const token = jwt.sign(
      { id: loginUser.id, email: loginUser.email },
      process.env.PRIVATE_KEY,
      { expiresIn: "5m", issuer: "juyeong" }
    );

    res.cookie("token", token, { httpOnly: true });

    return res.status(StatusCodes.OK).json({ message: "로그인 완료" });
  });
};

export const checkEmail = (req, res) => {
  const { email } = req.body;

  const sql = `SELECT * FROM  users WHERE email = ?`;
  const values = [email];
  conn.query(sql, values, (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "DB 오류입니다." });
    }

    const user = results[0];

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "아이디가 틀렸습니다." });
    }
    return res.status(200).json({ email: user.email });
  });
};

export const resetPassword = (req, res) => {
  const { email, password } = req.body;

  const sql = `UPDATE users SET password = ? WHERE email = ?`;
  const values = [password, email];
  conn.query(sql, values, (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "DB 오류입니다." });
    }

    if (results.affectedRows === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "이메일이 없습니다." });
    }
    res.status(StatusCodes.OK).json({ message: "비밀번호 변경 완료" });
  });
};

export const logout = (req, res) => {
  res.status(200).json({ message: "로그아웃 완료 " });
};
