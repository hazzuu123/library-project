import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import conn from "../mysql_promise.js";
import * as errorList from "../customError.js";

dotenv.config();

export const join = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const salt = crypto.randomBytes(64).toString("base64");
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 10000, 10, "sha512")
      .toString("base64");

    const sql = `INSERT INTO users (email, password, salt) VALUES (?, ?, ?)`;
    const values = [email, hashedPassword, salt];

    const [results] = await conn.query(sql, values);

    if (results.affectedRows) {
      return res.status(StatusCodes.CREATED).json({ message: "회원가입 완료" });
    } else {
      const error = errorList.createDatabaseError("DB 오류입니다.");
      return next(err);
    }
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      err = errorList.createDuplicatedAccountError("이미 존재하는 계정입니다.");
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const sql = `SELECT * FROM  users WHERE email = ?`;
    const values = [email];
    const [results] = await conn.query(sql, values);

    const loginUser = results[0];

    if (!loginUser) {
      const error =
        errorList.createUnauthrorizedError("아이디와 비밀번호가 틀립니다.");
      return next(error);
    }

    // salt값 꺼내서 비밀번호 암호화 해보고 ⇒ DB 비밀번호랑 비교
    const hashedPassword = crypto
      .pbkdf2Sync(password, loginUser.salt, 10000, 10, "sha512")
      .toString("base64");

    if (loginUser.password !== hashedPassword) {
      const error =
        errorList.createUnauthrorizedError("아이디와 비밀번호가 틀립니다.");
      return next(error);
    }

    // 성공 시 로직
    const token = jwt.sign(
      { id: loginUser.id, email: loginUser.email },
      process.env.PRIVATE_KEY,
      { expiresIn: "1h", issuer: "juyeong" }
    );

    res.cookie("token", token, { httpOnly: true });

    return res.status(StatusCodes.OK).json({ message: "로그인 완료" });
  } catch (err) {
    console.log(1);
    next(err);
  }
};

export const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const sql = `SELECT * FROM  users WHERE email = ?`;
    const values = [email];
    const [results] = await conn.query(sql, values);

    const user = results[0];

    if (!user) {
      const error =
        errorList.createUnauthrorizedError("존재하지 않는 이메일입니다.");
      return next(error);
    }

    return res.status(200).json({ email: user.email });
  } catch (err) {
    return next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 비밀번호 암호화
    const salt = crypto.randomBytes(64).toString("base64");
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 10000, 10, "sha512")
      .toString("base64");

    const sql = `UPDATE users SET password = ?, salt = ? WHERE email = ?`;
    const values = [hashedPassword, salt, email];
    const [results] = await conn.query(sql, values);

    if (results.affectedRows === 0) {
      const error =
        errorList.createUnauthrorizedError("존재하지 않는 이메일입니다.");
      return next(error);
    }

    return res.status(StatusCodes.OK).json({ message: "비밀번호 변경 완료" });
  } catch (err) {
    return next(err);
  }
};
