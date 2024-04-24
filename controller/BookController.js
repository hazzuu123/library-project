import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import conn from "../mysql.js";
import ensureAuthorization from "../auth.js";

export const getBooks = (req, res) => {
  let allBooksResponse = {};
  let { categoryId, isLatest, perPage, page } = req.query;

  categoryId = +categoryId;
  perPage = +perPage;
  page = +page;

  // perPage: page 당 도서 수
  // page: 현재 페이지
  // offset: perPage * (page -1)
  let offset = perPage * (page - 1);

  let sql =
    "SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM likes WHERE book_id = books.id) as likes FROM books";
  let value = [];

  if (!isNaN(categoryId)) {
    sql += " WHERE category_id = ?";
    value.push(categoryId);
  }

  if (isLatest === "true" && !isNaN(categoryId)) {
    sql += " AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
  } else if (isLatest === "true") {
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

    if (!results.length) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }

    results.map((book) => {
      book.pubDate = book.pub_date;
      delete book.pub_date;
    });

    allBooksResponse.books = results;

    sql = "SELECT found_rows() AS totalCount";
    conn.query(sql, value, (err, results) => {
      if (err) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "DB 오류", err });
      }

      let pagination = {
        page,
        totalCount: results[0].totalCount,
      };

      allBooksResponse.pagination = pagination;

      return res.status(StatusCodes.OK).json(allBooksResponse);
    });
  });
};

// 개별 도서 조회
export const getBook = (req, res) => {
  let { bookId } = req.params;
  let hasToken = true; // 토큰 포함 여부 -> is_liked를 포함할 지 말지 결정하는 변수
  const authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요." });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    // Authorization이 비었을 때,
    if (authorization.message === "jwt must be provided") {
      hasToken = false;
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "잘못된 토큰입니다." });
    }
  }

  // TODO: 토큰 가지고 있을 때와 없을 때, 리팩토링하기
  let sql;
  let values;
  if (hasToken) {
    sql = `SELECT *, 
    (SELECT count(*) FROM likes WHERE book_id = books.id) as likes,  
    (SELECT EXISTS (SELECT * FROM likes WHERE user_id = ? AND book_id = ?)) as is_liked 
    FROM books 
    LEFT JOIN category 
    ON books.category_id = category.category_id 
    WHERE books.id = ?
  `;
    values = [authorization.id, bookId, bookId];
  } else {
    sql = `SELECT *, 
    (SELECT count(*) FROM likes WHERE book_id = books.id) as likes
    FROM books 
    LEFT JOIN category 
    ON books.category_id = category.category_id 
    WHERE books.id = ?
  `;
    values = [bookId];
  }

  conn.query(sql, values, (err, results) => {
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
