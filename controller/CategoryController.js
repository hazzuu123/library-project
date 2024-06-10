import { StatusCodes } from "http-status-codes";

import conn from "../mysql.js";
import * as errorList from "../customError.js";

export const getCategory = async (req, res) => {
  try {
    const sql = "SELECT * FROM category";

    const [results] = await conn.execute(sql);

    results.map((category) => {
      category.id = category.category_id;
      category.name = category.category_name;
      delete category.category_id;
      delete category.category_name;
    });

    if (results.length) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      next(errorList.createNotFoundError("텅 비었습니다."));
    }
  } catch (err) {
    next(err);
  }
};
