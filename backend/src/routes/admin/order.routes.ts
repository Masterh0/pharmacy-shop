// src/routes/admin/order.routes.ts
import { Router } from "express";
import { adminOrderController } from "../../controllers/adminOrderController";
import { verifyAccessToken, isAdmin } from "../../middlewares/auth";

const router = Router();

// همه درخواست‌ها نیاز به احراز هویت و دسترسی ادمین دارند
router.use(verifyAccessToken, isAdmin);

router.get("/", adminOrderController.getAllOrders);
router.get("/statistics", adminOrderController.getStatistics);
router.get("/:id", adminOrderController.getOrderDetails);
router.patch("/:id/status", adminOrderController.updateOrderStatus);

export default router;
