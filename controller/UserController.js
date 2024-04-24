import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import conn from "../mysql.js";

dotenv.config();

export const join = (req, res) => {
  const { email, password } = req.body;

  // 비밀번호 암호화
  const salt = crypto.randomBytes(64).toString("base64");
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  // 회원가입 시 암호화된 비밀번호, salt 값을 같이 저장
  // 로그인 시, 이메일&이메일(날 것) ⇒ salt값 꺼내서 비밀번호 암호화 해보고 ⇒ DB 비밀번호랑 비교

  const sql = `INSERT INTO users (email, password, salt) VALUES (?, ?, ?)`;
  const values = [email, hashedPassword, salt];
  conn.query(sql, values, (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "이미 존재하는 계정입니다." });
    }
    if (results.affectedRows) {
      return res.status(StatusCodes.CREATED).json({ message: "회원가입 완료" });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
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

    // salt값 꺼내서 비밀번호 암호화 해보고 ⇒ DB 비밀번호랑 비교
    const hashedPassword = crypto
      .pbkdf2Sync(password, loginUser.salt, 10000, 10, "sha512")
      .toString("base64");

    if (!loginUser || loginUser.password !== hashedPassword) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "아이디 혹은 비밀번호가 틀렸습니다." });
    }
    // 성공 시 로직
    const token = jwt.sign(
      { id: loginUser.id, email: loginUser.email },
      process.env.PRIVATE_KEY,
      { expiresIn: "10m", issuer: "juyeong" }
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

  // 비밀번호 암호화
  const salt = crypto.randomBytes(64).toString("base64");
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  const sql = `UPDATE users SET password = ?, salt = ? WHERE email = ?`;
  const values = [hashedPassword, salt, email];
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
