import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  res.status(201).json({ message: "주문하기 " });
});

router.get("/", (req, res) => {
  res.status(200).json({ message: "주문 목록 조회" });
});

router.get("/:id", (req, res) => {
  res.status(200).json({ message: "주문 상세 상품 조회 " });
});

export default router;
