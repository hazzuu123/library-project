import { StatusCodes } from "http-status-codes";

import conn from "../mysql.js";
import * as errorList from "../customError.js";

export const getCategory = async (req, res) => {
  try {
    const sql = "SELECT * FROM category";

    const [results] = await conn.execute(sql);

    if (results.length) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      next(errorList.createNotFoundError("텅 비었습니다."));
    }
  } catch (err) {
    next(err);
  }
};
