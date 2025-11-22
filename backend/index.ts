import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import brandRoutes from "./src/routes/brandRoutes";
import productRoutes from "./src/routes/productRoutes";
import variantRoutes from "./src/routes/variantRoutes";
import categoryRoutes from "./src/routes/categoryRoutes";
import addressRoutes from "./src/routes/addressRouts";
import cartRoutes from "./src/routes/cartRoutes"
import { notFoundMiddleware } from "./src/middlewares/notFoundMiddleware"; // برای مدیریت مسیرهای ناموجود 404
import { errorMiddleware } from "./src/middlewares/errorMiddleware"; // میان‌افزار مرکزی مدیریت خطا
import authRoutes from "./src/routes/authRoutes";

import path from "path";
const app = express();

// ✅ سرو فایل‌های استاتیک از این مسیر
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true); // اجازه به همه‌ی originها
    },
    credentials: true,
  })
);
app.use(express.json());
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
app.use("/cart",cartRoutes)
app.use(notFoundMiddleware);
app.use(errorMiddleware);
// -----------------------------
app.listen(5000, () => console.log("Server running on port 5000"));
