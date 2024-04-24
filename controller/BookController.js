import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import conn from "../mysql_promise.js";
import ensureAuthorization from "../auth.js";
import * as errorList from "../customError.js";

export const getBooks = async (req, res, next) => {
  try {
    let allBooksResponse = {};
    let { categoryId, isLatest, perPage, page } = req.query;

    categoryId = +categoryId;
    perPage = +perPage;
    page = +page;

    let offset = perPage * (page - 1);

    let sql =
      "SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM likes WHERE book_id = books.id) as likes FROM books";
    let value = [];

    if (!isNaN(categoryId)) {
      sql += " WHERE category_id = ?";
      value.push(categoryId);
    }

    if (isLatest === "true" && !isNaN(categoryId)) {
      sql +=
        " AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
    } else if (isLatest === "true") {
      sql +=
        " WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
    }

    sql += " LIMIT ? OFFSET ?";
    value.push(perPage, offset);

    let [results] = await conn.query(sql, value);

    if (!results.length) {
      const error = errorList.createNotFoundError("찾는 도서가 없습니다.");
      return next(error);
    }

    results.map((book) => {
      book.pubDate = book.pub_date;
      delete book.pub_date;
    });

    allBooksResponse.books = results;

    sql = "SELECT found_rows() AS totalCount";

    [results] = await conn.query(sql, value);

    const pagination = {
      page,
      totalCount: results[0].totalCount,
    };

    allBooksResponse.pagination = pagination;

    return res.status(StatusCodes.OK).json(allBooksResponse);
  } catch (err) {
    next(err);
  }
};

export const getBook = async (req, res, next) => {
  try {
    let { id: bookId } = req.params;
    let hasToken = true; // 토큰 포함 여부 -> is_liked를 포함할 지 말지 결정하는 변수

    const authorization = ensureAuthorization(req, res);

    if (authorization.message === "jwt must be provided") {
      hasToken = false;
    } else if (authorization instanceof Error) {
      throw authorization;
    }

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

    const [results] = await conn.query(sql, values);

    if (results[0]) {
      return res.status(StatusCodes.OK).json(results[0]);
    } else {
      const error =
        errorList.createNotFoundError("해당 아이디의 데이터가 없습니다.");
      next(error);
    }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      err = errorList.createUnauthrorizedError("토큰이 만료되었습니다.");
      next(err);
    } else if (err instanceof jwt.JsonWebTokenError) {
      err = errorList.createUnauthrorizedError("토큰이 없거나 잘못되었습니다.");
      next(err);
    }

    err = errorList.createNotFoundError("찾는 도서가 없습니다.");
    next(err);
  }
};
