// src/routes/variant.routes.ts
import { Router } from "express";
import * as variantController from "../controllers/variantController";
import upload from "../middlewares/upload";
import { verifyAccessToken } from "../middlewares/auth";
import { isAdmin } from "../middlewares/auth";

const router = Router();

// ✅ عمومی
router.get("/", variantController.getAll);
router.get("/:id", variantController.getById);
router.get("/product/:id", variantController.getByProductId);

// 🔒 فقط ادمین (با آپلود چند عکس)
router.post(
  "/",
  verifyAccessToken,
  isAdmin,
  upload.array("images", 10), // ✅ حداکثر 10 عکس
  variantController.create
);

router.put(
  "/:id",
  verifyAccessToken,
  isAdmin,
  upload.array("images", 10),
  variantController.update
);

router.delete("/:id", verifyAccessToken, isAdmin, variantController.remove);

export default router;
