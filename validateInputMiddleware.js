import { body, param, query, validationResult } from "express-validator";

import * as errorList from "./customError.js";

const validate = (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    console.log(err);
    return next(
      errorList.createValidateInputError("요청값을 제대로 보내주세요.")
    );
  }
  return next();
};

export const validateEmail = body("email")
  .notEmpty()
  .isString()
  .withMessage("문자열로 입력해주세요.");

export const validatePassword = body("password")
  .notEmpty()
  .isString()
  .withMessage("문자열로 입력해주세요.");

export const validateId = param("id")
  .notEmpty()
  .isNumeric()
  .withMessage("숫자로 입력해주세요.");

export const validatePage = query("perPage")
  .notEmpty()
  .isNumeric()
  .withMessage("숫자로 입력해주세요.");

export const validatePerPage = query("page")
  .notEmpty()
  .isNumeric()
  .withMessage("숫자로 입력해주세요.");

export default validate;
