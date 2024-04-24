import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import conn from "../mysql_promise.js";
import ensureAuthorization from "../auth.js";
import * as errorList from "../customError.js";

export const addCartItem = async (req, res, next) => {
  let { bookId, quantity } = req.body;

  const authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    const error = errorList.createUnauthrorizedError("토큰이 만료되었습니다.");
    next(error);
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    const error =
      errorList.createUnauthrorizedError("토큰이 없거나 잘못되었습니다.");
    next(error);
  }

  try {
    const sql = `INSERT INTO cart_items (book_id, quantity, user_id) VALUES (?, ?, ?); 
  `;
    const values = [bookId, quantity, authorization.id];
    const [results] = await conn.query(sql, values);

    if (results.affectedRows === 0) {
      const error = errorList.createCartItemError("장바구니 넣기 실패");
      next(error);
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "장바구니 넣기 성공" });
  } catch (err) {
    next(err);
  }
};

export const getCartItems = async (req, res, next) => {
  let { selected } = req.body;

  const authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    const error = errorList.createUnauthrorizedError("토큰이 만료되었습니다.");
    next(error);
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    const error =
      errorList.createUnauthrorizedError("토큰이 없거나 잘못되었습니다.");
    next(error);
  }

  try {
    let sql = `SELECT cart_items.id, book_id, title, summary, quantity, price  FROM cart_items
    LEFT JOIN books
    ON book_id = books.id
    WHERE user_id = ?`;
    const values = [authorization.id];

    if (selected.length) {
      sql += ` AND cart_items.id IN (?)`;
      values.push(selected);
    }

    const [results] = await conn.query(sql, values);

    if (results.length) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      const error = errorList.createNotFoundError("텅 비었습니다.");
      return next(error);
    }
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (req, res, next) => {
  const { id: cartItemId } = req.params;

  const authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    const error = errorList.createUnauthrorizedError("토큰이 만료되었습니다.");
    next(error);
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    const error =
      errorList.createUnauthrorizedError("토큰이 없거나 잘못되었습니다.");
    next(error);
  }

  try {
    const sql = `DELETE FROM cart_items WHERE id = ?;`;
    const values = [cartItemId];

    const [results] = await conn.query(sql, values);

    if (results.affectedRows === 0) {
      const error =
        errorList.createNotFoundError("일치하는 카트 아이템이 없습니다.");
      return next(error);
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "장바구니 아이템 삭제 완료" });
  } catch (err) {
    next(err);
  }
};
