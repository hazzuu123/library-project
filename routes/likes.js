import express from "express";

const router = express.Router();

router.post("/:id", (req, res) => {
  res.status(200).json({ message: "좋아요 등록 " });
});

router.delete("/:id", (req, res) => {
  res.status(200).json({ message: "좋아요 해제" });
});

export default router;
