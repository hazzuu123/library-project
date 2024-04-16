// 하주영
import { StatusCodes } from "http-status-codes";

import conn from "../mysql.js";

export const addLike = (req, res) => {
  const { bookId } = req.params;
  const { userId } = req.body;

  const sql = `INSERT INTO likes (user_id, book_id) VALUES (?, ?);`;
  const values = [userId, bookId];

  conn.query(sql, values, (err, results) => {
    if (err) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "DB 오류입니다.", err });
    }
    return res
      .status(StatusCodes.CREATED)
      .json({ message: "좋아요 등록 완료" });
  });
};

export const removeLike = (req, res) => {
  const { bookId } = req.params;
  const { userId } = req.body;

  const sql = `DELETE FROM likes WHERE user_id = ? AND book_id = ?`;
  const values = [userId, bookId];

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
      .json({ message: "좋아요 해제 완료" });
  });
};
