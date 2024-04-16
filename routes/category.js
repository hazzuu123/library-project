import express from "express";

import * as category from "../controller/CategoryController.js";

const router = express.Router();

router.get("/", category.getCategory);

export default router;
