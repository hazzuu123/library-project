import { StatusCodes } from "http-status-codes";

export const createDuplicatedAccountError = (message = "중복 계정") => {
  const error = new Error(message);
  error.statusCode = StatusCodes.CONFLICT;
  return error;
};

export const createUnauthrorizedError = (message = "인증 실패") => {
  const error = new Error(message);
  error.statusCode = StatusCodes.UNAUTHORIZED;
  return error;
};

export const createDatabaseError = (message = "DB 오류") => {
  const error = new Error(message);
  error.statusCode = StatusCodes.BAD_REQUEST;
  return error;
};

export const createValidateInputError = (message = "입력 유효성 검사 실패") => {
  const error = new Error(message);
  error.statusCode = StatusCodes.BAD_REQUEST;
  return error;
};

export const createFailLike = (message = "좋아요 관련 API 실패") => {
  const error = new Error(message);
  error.statusCode = StatusCodes.BAD_REQUEST;
  return error;
};

export const createNotFoundError = (message = "빈 데이터") => {
  const error = new Error(message);
  error.statusCode = StatusCodes.NOT_FOUND;
  return error;
};

export const createCartItemError = (message = "장바구니 관련 API 실패") => {
  const error = new Error(message);
  error.statusCode = StatusCodes.BAD_REQUEST;
  return error;
};
