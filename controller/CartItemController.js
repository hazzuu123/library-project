import { StatusCodes } from "http-status-codes";

import conn from "../mysql.js";

export const addCartItem = (req, res) => {
  let { userId, bookId, quantity } = req.body;

  userId = Number(userId);
  bookId = Number(bookId);
  quantity = Number(quantity);

  const sql = `INSERT INTO cart_items (book_id, quantity, user_id) VALUES (?, ?, ?); 
  `;
  const values = [bookId, quantity, userId];
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
  let { userId, selected } = req.body;

  userId = Number(userId);

  const sql = `SELECT cart_items.id, book_id, title, summary, quantity, price  FROM cart_items
    LEFT JOIN books
    ON book_id = books.id
    WHERE user_id = ? AND cart_items.id IN (?)`;

  const values = [userId, selected];

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

export const removeCartIem = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM cart_items WHERE id = ?;`;
  const values = [id];

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
