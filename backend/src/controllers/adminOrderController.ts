// src/controllers/adminOrderController.ts
import { Request, Response } from "express";
import { adminOrderService } from "../services/adminOrderService";
import { OrderStatus } from "@prisma/client";

export const adminOrderController = {
  async getAllOrders(req: Request, res: Response) {
    try {
      const { status, userId, startDate, endDate, page, limit } = req.query;

      const result = await adminOrderService.getAllOrders({
        status: status as OrderStatus,
        userId: userId ? Number(userId) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      // ✅ ساختار response مطابق با Frontend
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async getOrderDetails(req: Request, res: Response) {
    try {
      const orderId = Number(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "شناسه سفارش نامعتبر است" });
      }

      const order = await adminOrderService.getOrderDetails(orderId);
      res.json(order);
    } catch (err: any) {
      const statusCode = err.message === "سفارش یافت نشد" ? 404 : 500;
      res.status(statusCode).json({ message: err.message });
    }
  },

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const orderId = Number(req.params.id);
      const { status, adminNote } = req.body;

      if (isNaN(orderId)) {
        return res.status(400).json({ message: "شناسه سفارش نامعتبر است" });
      }

      if (!Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({ message: "وضعیت نامعتبر است" });
      }

      const order = await adminOrderService.updateOrderStatus(
        orderId,
        status,
        adminNote
      );

      res.json({ success: true, order });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async getStatistics(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const stats = await adminOrderService.getOrderStatistics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },
};
