// 2기 하주영
import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import UserRouter from "./routes/users.js";
import BookRouter from "./routes/books.js";
import LikeRouter from "./routes/likes.js";
import CartRouter from "./routes/carts.js";
import OrderRouter from "./routes/orders.js";
import CategoryRouter from "./routes/category.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/users", UserRouter);
app.use("/books", BookRouter);
app.use("/likes", LikeRouter);
app.use("/carts", CartRouter);
app.use("/orders", OrderRouter);
app.use("/category", CategoryRouter);

app.use((err, req, res, next) => {
  // console.error(err.stack);
  return res.status(err.statusCode || 500).json({ message: err.message });
});

app.listen(process.env.PORT);
