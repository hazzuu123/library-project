import express from "express";

import * as cartItem from "../controller/CartItemController.js";
const router = express.Router();

router.post("/", cartItem.addCartItem);

router.get("/", cartItem.getCartItems);

router.delete("/:id", cartItem.removeCartIem);

export default router;
