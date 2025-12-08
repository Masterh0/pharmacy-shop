import { Request, Response } from "express";
import { ShippingService } from "../services/shippingService";

export class ShippingController {
  static async getShippingCost(req: Request, res: Response) {
    try {
      const addressId = Number(req.query.addressId as string);

      if (!addressId) {
        return res.status(400).json({ error: "addressId is required" });
      }

      // احراز هویت
      const userId = req.user?.id; // کاملاً تایپ شده (id + role)
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const data = await ShippingService.calculateShipping(addressId, userId);

      return res.json({
        success: true,
        shippingCost: data.shippingCost,
        province: data.province,
        city: data.city,
      });

    } catch (err: any) {
      console.error("Shipping Error:", err);

      if (err.message === "Address not found")
        return res.status(404).json({ error: "Address not found" });

      if (err.message === "Forbidden")
        return res.status(403).json({ error: "Access denied" });

      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
