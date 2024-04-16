import express from "express";

import * as like from "./../controller/LikeController.js";
const router = express.Router();

router.post("/:bookId", like.addLike);

router.delete("/:bookId", like.removeLike);

export default router;
