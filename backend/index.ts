import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
// Load type definitions
import "./src/types";
import brandRoutes from "./src/routes/brandRoutes";
import productRoutes from "./src/routes/productRoutes";
import variantRoutes from "./src/routes/variantRoutes";
import categoryRoutes from "./src/routes/categoryRoutes";
import addressRoutes from "./src/routes/addressRouts";
import cartRoutes from "./src/routes/cartRoutes";
import shippingRouts from "./src/routes/shippingRouts";
import searchRoutes from "./src/routes/searchRoutes";
import { notFoundMiddleware } from "./src/middlewares/notFoundMiddleware"; // برای مدیریت مسیرهای ناموجود 404
import { errorMiddleware } from "./src/middlewares/errorMiddleware"; // میان‌افزار مرکزی مدیریت خطا

import orderRoutes from "./src/routes/orderRoutes";

import authRoutes from "./src/routes/authRoutes";

import path from "path";
const app = express();
// ✅ سرو فایل‌های استاتیک از این مسیر
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
const allowedOrigins = ["http://localhost:3000"];

/**
 * تنظیمات CORS برای سازگاری با تمام مرورگرها
 *
 * چرا این تنظیمات لازم است؟
 * - Edge و Safari سخت‌گیری بیشتری در CORS دارند
 * - نیاز به headers بیشتر و تنظیمات دقیق‌تر
 * - این تنظیمات برای سخت‌گیرترین مرورگر (Edge) بهینه شده است
 *
 * @see BROWSER_COMPATIBILITY.md برای جزئیات بیشتر
 */
app.use(
  cors({
    origin: function (origin, callback) {
      // برای Edge و مرورگرهای دیگر - بررسی دقیق origin
      if (
        !origin ||
        origin === "http://localhost:3000" ||
        origin.startsWith("http://localhost:3000")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // اجازه ارسال کوکی‌ها
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Set-Cookie", "Cookie"], // برای Edge
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(cookieParser());
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

app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/variants", variantRoutes);
app.use("/brands", brandRoutes);
app.use("/addresses", addressRoutes);
app.use("/cart", cartRoutes);
app.use("/search", searchRoutes);
app.use("/shipping", shippingRouts);
app.use("/orders", orderRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
// -----------------------------
app.listen(5000, () => console.log("Server running on port 5000"));
