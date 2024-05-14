import { body, param, query, validationResult } from "express-validator";

import * as errorList from "./customError.js";

const validate = (req, res, next) => {
  const err = validationResult(req);
  if (err.isEmpty()) {
    return next();
  } else {
    return next(errorList.createValidateInputError(err.errors[0].msg));
  }
};

export const validateEmail = body("email")
  .notEmpty()
  .withMessage("이메일 요청값이 들어오지 않았습니다.")
  .isEmail()
  .withMessage("이메일을 이메일 형식으로 입력해주세요.")
  .escape();

export const validatePassword = body("password")
  .notEmpty()
  .withMessage("패스워드 요청값이 들어오지 않았습니다.")
  .isString()
  .withMessage("패스워드를 문자열로 입력해주세요.")
  .escape();

export const validateId = param("id")
  .notEmpty()
  .withMessage("아이디 요청값이 들어오지 않았습니다.")
  .isNumeric()
  .withMessage("아이디를 숫자로 입력해주세요.")
  .toInt();

export const validatePage = query("perPage")
  .notEmpty()
  .withMessage("perPage 요청값이 들어오지 않았습니다.")
  .isNumeric()
  .withMessage("perPage 숫자로 입력해주세요.")
  .toInt();

export const validatePerPage = query("page")
  .notEmpty()
  .withMessage("page 요청값이 들어오지 않았습니다.")
  .isNumeric()
  .withMessage("page를 숫자로 입력해주세요.")
  .toInt();

export default validate;
