// src/routes/shipping.routes.ts
import express from "express";
import { ShippingController } from "../controllers/shippingController";
import { verifyAccessToken  } from "../middlewares/auth";

const router = express.Router();

router.use(verifyAccessToken );

const controller = ShippingController;

// GET /shipping/cost?addressId=123
router.get("/cost", controller.getShippingCost);

export default router;
