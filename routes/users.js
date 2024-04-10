import express from "express";

const router = express.Router();

router.post("/join", (req, res) => {
  res.status(201).json({ message: "회원가입 완료 " });
});

router.post("/login", (req, res) => {
  res.status(200).json({ message: "로그인 완료 " });
});

router.post("/email", (req, res) => {
  res.status(200).json({ message: "이메일 확인 완료 " });
});

router.put("/password", (req, res) => {
  res.status(200).json({ message: "비밀번호 변경 완료 " });
});

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "로그아웃 완료 " });
});

export default router;
