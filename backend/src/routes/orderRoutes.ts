// src/routes/order.routes.ts
import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { verifyAccessToken} from "../middlewares/auth";

const router = Router();

router.post("/", verifyAccessToken, orderController.create);
router.get("/", verifyAccessToken, orderController.list);
router.get("/:id", verifyAccessToken, orderController.getById);

export default router;
