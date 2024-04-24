import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import conn from "../mysql.js";
import ensureAuthorization from "../auth.js";

export const addLike = (req, res) => {
  const { bookId } = req.params;

  const authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    // 토큰이 만료된 경우
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요." });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    // 토큰이 없거나 잘못된 경우
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "잘못된 토큰입니다." });
  }

  const sql = `INSERT INTO likes (user_id, book_id) VALUES (?, ?);`;
  const values = [authorization.id, bookId];

  conn.query(sql, values, (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "DB 오류입니다.", err });
    }
    return res
      .status(StatusCodes.CREATED)
      .json({ message: "좋아요 등록 완료" });
  });
};

export const removeLike = (req, res) => {
  const { bookId } = req.params;

  const authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요." });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "잘못된 토큰입니다." });
  }

  const sql = `DELETE FROM likes WHERE user_id = ? AND book_id = ?`;
  const values = [authorization.id, bookId];

  conn.query(sql, values, (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "DB 오류입니다.", err });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "일치하는 데이터가 없습니다." });
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "좋아요 해제 완료" });
  });
};
