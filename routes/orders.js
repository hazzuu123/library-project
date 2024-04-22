import express from "express";
import * as order from "../controller/OrderController.js";
const router = express.Router();

router.post("/", order.order);

router.get("/", order.getOrders);

router.get("/:id", order.getOrderDetail);

export default router;
