import { Request, Response } from "express";
import { refundService } from "../services/refundService";

export const refundOrderController = async (
  req: Request,
  res: Response
) => {
  try {
    const orderId = Number(req.params.orderId);
    const { amount, reason, restock } = req.body;

    if (!orderId || !amount || !reason) {
      return res.status(400).json({
        error: "orderId, amount و reason الزامی هستند",
      });
    }

    const result = await refundService.refundOrder({
      orderId,
      amount: Number(amount),
      reason,
      restock: Boolean(restock),
    });

    return res.json({
      message: "ریفاند با موفقیت انجام شد",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      error: err.message || "خطا در ریفاند سفارش",
    });
  }
};
