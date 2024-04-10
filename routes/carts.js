import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  res.status(201).json({ message: "장바구니 담기 " });
});

router.get("/", (req, res) => {
  res.status(200).json({ message: "장바구니 조회" });
});

router.delete("/:id", (req, res) => {
  res.status(200).json({ message: "장바구니 빼기 " });
});

// // 장바구니에서 선택한 주문 예상 상품 목록 조회
// router.get("/", (req, res) => {
//     res.status(200).json({ message: "장바구니 " });
//   });

export default router;
