import { StatusCodes } from "http-status-codes";

import conn from "../mysql.js";

export const getCategory = (req, res) => {
  const sql = "SELECT * FROM category";

  conn.query(sql, (err, results) => {
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
        .json({ message: "카테고리 목록이 없습니다." });
    }
  });
};
