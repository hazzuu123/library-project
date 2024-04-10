import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "전체 도서 조회 " });
});

router.get("/:id", (req, res) => {
  res.status(200).json({ message: "개별 도서 조회 " });
});

router.get("/:id", (req, res) => {
  res.status(200).json({ message: "카테고리별 도서 목록 조회 " });
});
export default router;
