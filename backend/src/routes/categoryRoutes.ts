import { Router } from "express";
import * as categoryController from "../controllers/categoryController";
import { verifyAccessToken, isAdmin } from "../middlewares/auth";

const router = Router();

// ✅ عمومی
router.get("/search", categoryController.search);
router.get("/", categoryController.getAll);
router.get("/children", categoryController.getAllWithChildren);
router.get("/:id/filters", categoryController.getCategoryFilters);
router.get("/:slug/products", categoryController.getCategoryProductsBySlug);
router.get("/:id/products", categoryController.getCategoryProducts);
router.get("/:id", categoryController.getById);

// 🔒 فقط ادمین
router.post("/", verifyAccessToken, isAdmin, categoryController.create);
router.put("/:id", verifyAccessToken, isAdmin, categoryController.update);
router.delete("/:id", verifyAccessToken, isAdmin, categoryController.remove);

router.get(
  "/admin/slug/:slug/products",
  verifyAccessToken,
  isAdmin,
  categoryController.getAdminCategoryProductsBySlug,
);
router.get(
  "/admin/blocked",
  verifyAccessToken,
  isAdmin,
  categoryController.getBlockedProductsForAdmin,
);

export default router;
