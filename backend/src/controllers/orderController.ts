// src/controllers/orderController.ts
import { Request, Response } from "express";
import { orderService } from "../services/orderService";

export const orderController = {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { addressId, shippingCost } = req.body;

      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      if (!addressId) return res.status(400).json({ message: "آدرس الزامی است" });

      const order = await orderService.createOrder({
        userId,
        addressId,
        shippingCost: Number(shippingCost || 0)
      });

      res.status(201).json({ success: true, order });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({
        message: err.message || "خطای سرور در ایجاد سفارش"
      });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const orders = await orderService.getUserOrders(userId);
      res.json({ orders });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const orderId = Number(req.params.id);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const order = await orderService.getOrderById(orderId, userId);
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },
};
