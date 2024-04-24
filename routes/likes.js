import express from "express";

import * as like from "./../controller/LikeController.js";
import validate, { validateId } from "../validateInputMiddleware.js";

const router = express.Router();

router.post("/:id", [validateId, validate], like.addLike);

router.delete("/:id", [validateId, validate], like.removeLike);

export default router;
