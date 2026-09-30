// src/routes/product.routes.ts
import { Router } from "express";
import * as productController from "../controllers/productController";
import upload from "../middlewares/upload";
import { verifyAccessToken } from "../middlewares/auth"; // ✅ احراز هویت
import { isAdmin } from "../middlewares/auth"; // ✅ بررسی ادمین

const router = Router();

// ✅ عمومی (بدون نیاز به لاگین)
router.get("/", productController.getAll);

router.get(
  "/admin/all",
  verifyAccessToken,
  isAdmin,
  productController.getAllForAdmin,
);
// 🔒 فقط ادمین
router.post(
  "/",
  verifyAccessToken,
  isAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "variantImages_0", maxCount: 10 },
    { name: "variantImages_1", maxCount: 10 },
    { name: "variantImages_2", maxCount: 10 },
    { name: "variantImages_3", maxCount: 10 },
    { name: "variantImages_4", maxCount: 10 },
  ]),
  productController.create,
);
router.put(
  "/:id",
  verifyAccessToken,
  isAdmin,
  upload.single("image"),
  productController.update,
);

router.patch(
  "/:id/block",
  verifyAccessToken,
  isAdmin,
  productController.blockProduct,
);
router.get("/filter", productController.getFilteredProducts);
router.get("/:id/similar", productController.getSimilarProducts);

router.delete("/:id", verifyAccessToken, isAdmin, productController.remove);

router.post("/:id/view", productController.increaseViewCount);

router.get("/:id", productController.getById);

export default router;
