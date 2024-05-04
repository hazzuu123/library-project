// 하주영
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import conn from "../mysql.js";
import ensureAuthorization from "../auth.js";
import * as errorList from "../customError.js";

export const order = async (req, res, next) => {
  let { items, delivery, totalQuantity, totalPrice, firstBookTitle } = req.body;

  const authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    const error = errorList.createUnauthrorizedError("토큰이 만료되었습니다.");
    next(error);
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    const error =
      errorList.createUnauthrorizedError("토큰이 없거나 잘못되었습니다.");
    next(error);
  }

  let deliveryId;
  let orderId;
  let sql;
  let values;

  // 배송지 INSERT
  try {
    sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;
    values = [delivery.address, delivery.receiver, delivery.contact];

    const [results] = await conn.execute(sql, values);
    deliveryId = results.insertId;
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "DB 오류", err });
  }

  // 주문 INSERT
  try {
    sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
    VALUES (?, ?, ?, ?, ?)`;
    values = [
      firstBookTitle,
      totalQuantity,
      totalPrice,
      authorization.id,
      deliveryId,
    ];

    const [results] = await conn.execute(sql, values);

    orderId = results.insertId;
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "DB 오류", err });
  }

  // 장바구니에서 선택한 책의 book_id, quantity SELECT
  let orderItems;

  try {
    sql = `SELECT book_id, quantity FROM cart_items WHERE id IN (?)`;
    values = items;

    const [results] = await conn.query(sql, [values]);

    orderItems = results;
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "DB 오류", err });
  }

  // 주문한 책 INSERT
  try {
    sql = `INSERT INTO ordered_book (order_id, book_id, quantity)
    VALUES ?`;
    values = [];
    orderItems.forEach((item) => {
      values.push([orderId, item.book_id, item.quantity]);
    });

    const [results] = await conn.query(sql, [values]); // execute 사용하면 에러발생
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "ordered_book INSERT 오류", err });
  }

  // 장바구니에서 DELETE
  try {
    const results = await _deleteCartItems(items);
    return res.status(StatusCodes.CREATED).json({ results });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "장바구니 아이템 삭제 오류", err });
  }
};

export const getOrders = async (req, res, next) => {
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
    const sql = `SELECT orders.id, created_at,address,receiver, contact , book_title, total_price,total_quantity
      FROM orders
      LEFT JOIN delivery
      ON orders.delivery_id = delivery.id
      WHERE user_id = ?`;
    const values = [authorization.id];
    const [results] = await conn.execute(sql, values);

    if (results.length > 0) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      const error = errorList.createNotFoundError("텅 비었습니다.");
      next(error);
    }
  } catch (err) {
    next(err);
  }
};

export const getOrderDetail = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;

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

    const sql = `SELECT book_id, title, author, price, quantity
      FROM ordered_book
      LEFT JOIN books
      ON ordered_book.book_id = books.id
      WHERE order_id = ?`;
    const values = [orderId];
    const [results] = await conn.query(sql, values);

    results.map((book) => {
      book.bookId = book.book_id;
      delete book.book_id;
    });

    if (results.length > 0) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      const error = errorList.createNotFoundError("텅 비었습니다.");
      next(error);
    }
  } catch (err) {
    next(err);
  }
};

const _deleteCartItems = async (items) => {
  const sql = `DELETE FROM cart_items WHERE id IN (?)`;
  let values = items;

  const [results] = await conn.query(sql, [values]);
  return results;
};
