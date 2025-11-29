// src/routes/authRoutes.ts
import { Router } from "express";
import {
  register,
  verifyRegisterOtp,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  refresh,
  logout,
  me
} from "../controllers/authController";

import { verifyAccessToken, verifyRefreshToken, checkRole } from "../middlewares/auth";
import { cartIdentity } from "../middlewares/cartIdentity";

const router = Router();
// -----------------------------
// ثبت‌نام و تایید OTP
// -----------------------------
router.post("/register", register);
router.post("/register/verify-otp", verifyRegisterOtp);

// -----------------------------
// لاگین با پسورد
// -----------------------------
router.post("/login", login);

// -----------------------------
// لاگین با OTP
// -----------------------------
router.post("/login/request-otp", sendLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);

// -----------------------------
// رفرش توکن
// -----------------------------
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", verifyAccessToken, me);
// -----------------------------
// مسیر تست فقط برای ADMINS
// -----------------------------
// router.get(
//   "/admin/test",
//   verifyAccessToken,
//   checkRole(["ADMIN"]),
//   (req, res) => {
//     res.json({
//       message: `Welcome ${req.user.role}! This is an admin-only endpoint`,
//     });
//   }
// );

export default router;
