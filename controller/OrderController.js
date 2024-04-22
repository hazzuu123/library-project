// 하주영
import { StatusCodes } from "http-status-codes";

import conn from "../mysql_promise.js";

export const order = async (req, res) => {
  let { items, delivery, totalQuantity, totalPrice, userId, firstBookTitle } =
    req.body;

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
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "DB 오류", err });
  }

  // 주문 INSERT
  try {
    sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
    VALUES (?, ?, ?, ?, ?)`;
    values = [firstBookTitle, totalQuantity, totalPrice, userId, deliveryId];

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
    res
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
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "ordered_book INSERT 오류", err });
  }

  // 장바구니에서 DELETE
  try {
    const results = await _deleteCartItems(items);
    res.status(StatusCodes.CREATED).json({ results });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "장바구니 아이템 삭제 오류", err });
  }
};

const _deleteCartItems = async (items) => {
  const sql = `DELETE FROM cart_items WHERE id IN (?)`;
  let values = items;

  const [results] = await conn.query(sql, [values]);
  return results;
};

export const getOrders = async (req, res) => {
  const { userId } = req.body;
  try {
    const sql = `SELECT orders.id, created_at,address,receiver, contact , book_title, total_price,total_quantity
      FROM orders
      LEFT JOIN delivery
      ON orders.delivery_id = delivery.id
      WHERE user_id = ?`;
    const values = [userId];
    const [results] = await conn.execute(sql, values);

    if (results.length > 0) {
      return res.status(StatusCodes.OK).json(results);
    }

    throw { status: StatusCodes.NOT_FOUND, errMessage: "텅 비었습니다." };
  } catch (err) {
    res
      .status(err.status || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.errMessage || "DB 오류" });
  }
};

// TODO : 주문 상세 조회에 user_id값을 받기.
export const getOrderDetail = async (req, res) => {
  const { id: orderId } = req.params;
  try {
    const sql = `SELECT book_id, title, author, price, quantity
      FROM ordered_book
      LEFT JOIN books
      ON ordered_book.book_id = books.id
      WHERE order_id = ?`;
    const values = [orderId];
    const [results] = await conn.query(sql, values);

    if (results.length > 0) {
      return res.status(StatusCodes.OK).json(results);
    }

    throw { status: StatusCodes.NOT_FOUND, errMessage: "텅 비었습니다." };
  } catch (err) {
    res
      .status(err.status || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.errMessage || "DB 오류" });
  }
};
