import { Router } from "express";
import * as categoryController from "../controllers/categoryController";

const router = Router();

// 🔍 جستجوی دسته‌بندی‌ها
router.get("/search", categoryController.search);

// 📂 همه‌ی دسته‌ها (غیربازگشتی)
router.get("/", categoryController.getAll);

// 📁 گرفتن دسته‌ها همراه زیردسته‌ها (غیربازگشتی تا یک سطح)
router.get("/children", categoryController.getAllWithChildren);

// 🛒 گرفتن محصولات یک دسته و زیردسته‌های آن
router.get("/:id/products", categoryController.getCategoryProducts);

// 📁 گرفتن دسته خاص با ID
router.get("/:id", categoryController.getById);

// ➕ ساخت دسته جدید
router.post("/", categoryController.create);

// ✏️ ویرایش دسته موجود
router.put("/:id", categoryController.update);

// ❌ حذف دسته
router.delete("/:id", categoryController.remove);

export default router;
