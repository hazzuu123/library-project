import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import conn from "../mysql_promise.js";
import ensureAuthorization from "../auth.js";
import * as errorList from "../customError.js";

export const addLike = async (req, res, next) => {
  try {
    const { id: bookId } = req.params;

    const authorization = ensureAuthorization(req, res);
    if (authorization instanceof jwt.TokenExpiredError) {
      const error =
        errorList.createUnauthrorizedError("토큰이 만료되었습니다.");
      next(error);
    } else if (authorization instanceof jwt.JsonWebTokenError) {
      const error =
        errorList.createUnauthrorizedError("토큰이 없거나 잘못되었습니다.");
      next(error);
    }
    const sql = `INSERT INTO likes (user_id, book_id) VALUES (?, ?);`;
    const values = [authorization.id, bookId];

    const [results] = await conn.query(sql, values);

    res.status(StatusCodes.CREATED).json({ message: "좋아요 등록 완료" });
  } catch (err) {
    err = errorList.createFailLike("좋아요 등록 실패");

    return next(err);
  }
};

export const removeLike = async (req, res, next) => {
  try {
    const { id: bookId } = req.params;

    const authorization = ensureAuthorization(req, res);
    if (authorization instanceof jwt.TokenExpiredError) {
      const error =
        errorList.createUnauthrorizedError("토큰이 만료되었습니다.");
      next(error);
    } else if (authorization instanceof jwt.JsonWebTokenError) {
      const error =
        errorList.createUnauthrorizedError("토큰이 없거나 잘못되었습니다.");
      next(error);
    }

    const sql = `DELETE FROM likes WHERE user_id = ? AND book_id = ?`;
    const values = [authorization.id, bookId];

    const [results] = await conn.query(sql, values);

    if (results.affectedRows === 0) {
      const error = errorList.createFailLike("좋아요 해제 실패");
      return next(error);
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "좋아요 해제 완료" });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      err = errorList.createUnauthrorizedError(
        "로그인 세션이 만료되었습니다. 다시 로그인 하세요."
      );
    } else if (err instanceof jwt.JsonWebTokenError) {
      err = errorList.createUnauthrorizedError("토큰이 없거나 잘못되었습니다.");
    } else {
      err = errorList.createFailLike("좋아요 해제 실패");
    }
    return next(err);
  }
};
