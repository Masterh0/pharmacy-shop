import { Router } from "express";
import { refundOrderController } from "../controllers/refundController";
import { verifyAccessToken, checkRole } from "../middlewares/auth";

const router = Router();

router.post(
  "/orders/:orderId/refund",
  verifyAccessToken,
  checkRole(["ADMIN", "STAFF"]),
  refundOrderController
);

export default router;
