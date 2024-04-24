import express from "express";
import * as order from "../controller/OrderController.js";
import validate, { validateId } from "../validateInputMiddleware.js";

const router = express.Router();

router.post("/", order.order);

router.get("/", order.getOrders);

router.get("/:id", [validateId, validate], order.getOrderDetail);

export default router;
