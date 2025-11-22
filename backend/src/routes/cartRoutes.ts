// src/routes/cart.routes.ts
import express from "express";
import { CartController } from "../controllers/cartController";

const router = express.Router();
const controller = new CartController();

router.post("/add", controller.addToCart.bind(controller));
router.get("/", controller.getCart.bind(controller));
router.delete("/item/:id", controller.removeItem.bind(controller));

export default router;
