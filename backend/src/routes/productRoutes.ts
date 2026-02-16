// src/routes/product.routes.ts
import { Router } from "express";
import * as productController from "../controllers/productController";
import upload from "../middlewares/upload";
import { verifyAccessToken } from "../middlewares/auth"; // ✅ احراز هویت
import { isAdmin } from "../middlewares/auth"; // ✅ بررسی ادمین

const router = Router();

// ✅ عمومی (بدون نیاز به لاگین)
router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.post("/:id/view", productController.increaseViewCount);

// 🔒 فقط ادمین
router.post(
  "/",
  verifyAccessToken,
  isAdmin,
  upload.single("image"),
  productController.create
);

router.put(
  "/:id",
  verifyAccessToken,
  isAdmin,
  upload.single("imageUrl"),
  productController.update
);

router.delete("/:id", verifyAccessToken, isAdmin, productController.remove);

router.patch("/:id/block", verifyAccessToken, isAdmin, productController.blockProduct);

router.get("/admin/all", verifyAccessToken, isAdmin, productController.getAllForAdmin);

export default router;
