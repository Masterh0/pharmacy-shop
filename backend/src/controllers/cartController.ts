// src/controllers/cart.controller.ts
import { Request, Response } from "express";
import { CartService } from "../services/cartService";
import "../types";

const cartService = new CartService();

export class CartController {
  async addToCart(req: Request, res: Response) {
    try {
      const { userId, sessionId } = req.cartIdentity!;
      const { productId, variantId, quantity } = req.body;

      const item = await cartService.addItem({
        userId,
        sessionId,
        productId,
        variantId,
        quantity: Number(quantity),
      });

      res.status(200).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getCart(req: Request, res: Response) {
    try {
      const { userId, sessionId } = req.cartIdentity!;
      const cart = await cartService.getCart(userId, sessionId);
      res.status(200).json(cart);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async removeItem(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await cartService.removeItem(id);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  async updateItemQuantity(req: Request, res: Response) {
    try {
      const itemId = Number(req.params.id);
      const { quantity } = req.body;

      if (!quantity || isNaN(quantity)) {
        return res.status(400).json({ error: "quantity is required" });
      }

      const result = await cartService.updateItemQuantity(
        itemId,
        Number(quantity),
      );
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
