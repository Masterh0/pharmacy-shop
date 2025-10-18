// src/routes/product.routes.ts

import { Router } from "express";
import * as productController from "../controllers/productController";
import upload from "../middlewares/upload"; // ✅ مسیر صحیح فایل Multer middleware

const router = Router();

// گرفتن همه محصولات
router.get("/", productController.getAll);

// گرفتن محصول بر اساس id
router.get("/:id", productController.getById);

// ایجاد محصول جدید
router.post("/", upload.single("image"), productController.create);

// ویرایش کامل محصول
router.put("/:id", productController.update);
// حذف محصول
router.delete("/:id", productController.remove);

export default router;
