import express from "express";
import * as book from "../controller/BookController.js";
import validate, {
  validateId,
  validatePage,
  validatePerPage,
} from "../validateInputMiddleware.js";

const router = express.Router();

router.get("/", [validatePage, validatePerPage, validate], book.getBooks);

router.get("/:id", [validateId, validate], book.getBook);

export default router;
