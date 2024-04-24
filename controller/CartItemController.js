import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import conn from "../mysql.js";
import ensureAuthorization from "../auth.js";

export const addCartItem = (req, res) => {
  let { bookId, quantity } = req.body;

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

  const sql = `INSERT INTO cart_items (book_id, quantity, user_id) VALUES (?, ?, ?); 
  `;
  const values = [bookId, quantity, authorization.id];
  conn.query(sql, values, (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "DB 오류", err });
    }

    return res.status(StatusCodes.CREATED).json(results);
  });
};

export const getCartItems = (req, res) => {
  let { selected } = req.body;

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

  let sql = `SELECT cart_items.id, book_id, title, summary, quantity, price  FROM cart_items
    LEFT JOIN books
    ON book_id = books.id
    WHERE user_id = ?`;
  const values = [authorization.id];

  if (selected.length) {
    sql += ` AND cart_items.id IN (?)`;
    values.push(selected);
  }

  conn.query(sql, values, (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "DB 오류", err });
    }

    if (results.length) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "userId에 해당하는 데이터가 텅 비었습니다." });
    }
  });
};

export const removeCartItem = (req, res) => {
  const { id: cartItemId } = req.params;

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

  const sql = `DELETE FROM cart_items WHERE id = ?;`;
  const values = [cartItemId];

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
      .json({ message: "장바구니 아이템 삭제 완료" });
  });
};
