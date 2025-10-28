import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import brandRoutes from "./src/routes/brandRoutes";
import productRoutes from "./src/routes/productRoutes";
import variantRoutes from "./src/routes/variantRoutes";
import categoryRoutes from "./src/routes/categoryRoutes";
import { notFoundMiddleware } from "./src/middlewares/notFoundMiddleware"; // برای مدیریت مسیرهای ناموجود 404
import { errorMiddleware } from "./src/middlewares/errorMiddleware"; // میان‌افزار مرکزی مدیریت خطا
import {
  register,
  verifyRegisterOtp,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  refresh,
} from "./src/controllers/authController";

import {
  verifyRefreshToken,
  verifyAccessToken,
  checkRole,
} from "./src/middlewares/auth";
import path from "path";
const app = express();
const prisma = new PrismaClient();
const uploadsPath = path.join(__dirname, "../uploads");

// ✅ سرو فایل‌های استاتیک از این مسیر
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.use(express.json());

// -----------------------------
// مسیر تست
// -----------------------------
app.get("/", async (req: Request, res: Response) => {
  res.json({ message: "Backend is running!" });
});

// -----------------------------
// ثبت‌نام و تایید OTP
// -----------------------------
app.post("/register", register); // ثبت‌نام اولیه (با OTP)
app.post("/register/verify-otp", verifyRegisterOtp); // تایید OTP ثبت‌نام

// -----------------------------
// لاگین با پسورد
// -----------------------------
app.post("/login", login);

// -----------------------------
// لاگین با OTP
// -----------------------------
app.post("/login/request-otp", sendLoginOtp);
app.post("/login/verify-otp", verifyLoginOtp);

// -----------------------------
// رفرش توکن
// -----------------------------
app.post("/refresh", refresh); // Middleware هم میتونه برای اعتبارسنجی اضافه بشه

// -----------------------------
// مسیرهای مدیریتی
// -----------------------------
app.get(
  "/admin/test",
  verifyAccessToken,
  checkRole(["ADMIN"]),
  async (req: Request, res: Response) => {
    res.json({
      message: `Welcome ${req.user.role}! This is an admin-only endpoint`,
    });
  }
);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/variants", variantRoutes);
app.use("/brands", brandRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
// -----------------------------
app.listen(5000, () => console.log("Server running on port 5000"));
