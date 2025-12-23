import { Router } from "express";
import * as categoryController from "../controllers/categoryController";

const router = Router();

// 🔍 جستجوی دسته‌بندی‌ها
router.get("/search", categoryController.search);

// 📂 همه‌ی دسته‌ها
router.get("/", categoryController.getAll);

// 📁 گرفتن دسته‌ها همراه زیردسته‌ها
router.get("/children", categoryController.getAllWithChildren);

// ✅ فیلترهای دسته (بعــــد از children و قبل از :id)
router.get("/:id/filters", categoryController.getCategoryFilters);

// 🛒 گرفتن محصولات یک دسته با slug
router.get("/:slug/products", categoryController.getCategoryProductsBySlug);

// 🛒 گرفتن محصولات یک دسته با id
router.get("/:id/products", categoryController.getCategoryProducts);

// 📁 گرفتن دسته خاص با ID
router.get("/:id", categoryController.getById);

// ➕ ساخت دسته جدید
router.post("/", categoryController.create);

// ✏️ ویرایش دسته
router.put("/:id", categoryController.update);

// ❌ حذف دسته
router.delete("/:id", categoryController.remove);
router.get(
  "/admin/slug/:slug/products",
  categoryController.getAdminCategoryProductsBySlug
);
router.get("/admin/blocked", categoryController.getBlockedProductsForAdmin);
export default router;
