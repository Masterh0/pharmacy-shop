// src/routes/product.routes.ts

import { Router } from "express";
import * as productController from "../controllers/productController";
import upload from "../middlewares/upload"; // ✅ مسیر صحیح فایل Multer middleware
import express from "express";

const router = express.Router();

// گرفتن همه محصولات
router.get("/", productController.getAll);

// گرفتن محصول بر اساس id
router.get("/:id", productController.getById);

// ایجاد محصول جدید
router.post("/", upload.single("image"), productController.create);

// ویرایش کامل محصول
router.put("/:id", upload.single("imageUrl"), productController.update);
// حذف محصول
router.delete("/:id", productController.remove);
router.post("/:id/view", productController.increaseViewCount);

export default router;
