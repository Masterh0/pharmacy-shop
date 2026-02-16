// src/controllers/orderController.ts
import { Request, Response } from "express";
import { orderService } from "../services/orderService";
import {UserRole} from "../types/express.user"
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: UserRole;
  };
}
export const orderController = {
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { addressId, shippingCost } = req.body;

      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      if (!addressId)
        return res.status(400).json({ message: "آدرس الزامی است" });

      const order = await orderService.createOrder({
        userId,
        addressId: Number(addressId),
        shippingCost: Number(shippingCost || 0),
      });

      res.status(201).json({ success: true, order });
    } catch (err: any) {
      console.error("❌ Create Order Error:", err);
      res.status(500).json({
        message: err.message || "خطای سرور در ایجاد سفارش",
      });
    }
  },

  async list(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const orders = await orderService.getUserOrders(userId);
      res.json({ orders });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const orderId = Number(req.params.id);

      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const order = await orderService.getOrderById(orderId, userId);
      res.json(order);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  },

  async cancel(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const orderId = Number(req.params.id);

      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const result = await orderService.cancelOrder(orderId, userId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
};
