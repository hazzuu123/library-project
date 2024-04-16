import express from "express";
import * as book from "../controller/BookController.js";
const router = express.Router();

router.get("/", book.getBooks);

router.get("/:bookId", book.getBook);

export default router;
