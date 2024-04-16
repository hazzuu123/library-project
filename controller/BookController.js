import { StatusCodes } from "http-status-codes";

import conn from "../mysql.js";
// 하주영
export const getBooks = (req, res) => {
  let { categoryId, isLatest, perPage, page } = req.query;

  categoryId = +categoryId;
  perPage = +perPage;
  page = +page;
  isLatest = JSON.parse(isLatest);

  // perPage: page 당 도서 수
  // page: 현재 페이지
  // offset: perPage * (page -1)
  let offset = perPage * (page - 1);

  let sql =
    "SELECT *, (SELECT count(*) FROM likes WHERE book_id = books.id) as likes FROM books";
  let value = [];

  if (!isNaN(categoryId)) {
    sql += " WHERE category_id = ?";
    value.push(categoryId);
  }

  if (isLatest && !isNaN(categoryId)) {
    sql += " AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
  } else if (isLatest) {
    sql +=
      " WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
  }

  sql += " LIMIT ? OFFSET ?";
  value.push(perPage, offset);

  conn.query(sql, value, (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "DB 오류", err });
    }

    if (results.length) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

// 개별 도서 조회
export const getBook = (req, res) => {
  let { bookId } = req.params;
  let { userId } = req.body;

  bookId = Number(bookId);
  userId = Number(userId);

  const sql = `SELECT *, 
    (SELECT count(*) FROM likes WHERE book_id = books.id) as likes,  
    (SELECT EXISTS (SELECT * FROM likes WHERE user_id = ? AND book_id = ?)) as is_liked 
    FROM books 
    LEFT JOIN category 
    ON books.category_id = category.category_id 
    WHERE books.id = ?
  `;
  const value = [userId, bookId, bookId];
  conn.query(sql, value, (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "DB 오류", err });
    }

    if (results[0]) {
      return res.status(StatusCodes.OK).json(results[0]);
    } else {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "id가 틀렸습니다." });
    }
  });
};
