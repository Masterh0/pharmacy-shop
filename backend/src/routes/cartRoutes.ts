// src/routes/cart.routes.ts
import express from "express";
import { CartController } from "../controllers/cartController";
import { cartIdentity } from "../middlewares/cartIdentity";
const router = express.Router();
router.use(cartIdentity);
const controller = new CartController();

router.post("/add", controller.addToCart.bind(controller));
router.get("/", controller.getCart.bind(controller));
router.delete("/item/:id", controller.removeItem.bind(controller));
router.put(
  "/item/:id/quantity",
  controller.updateItemQuantity.bind(controller)
);
export default router;
