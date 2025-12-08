// src/services/shipping.service.ts
import { prisma } from "../config/db";

export class ShippingService {
  static async calculateShipping(addressId: number, userId: number) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new Error("Address not found");
    }

    // جلوگیری از دسترسی به آدرس دیگران
    if (address.userId !== userId) {
      throw new Error("Forbidden");
    }

    // قانون محاسبه هزینه ارسال
    let shippingCost = 45000;

    if (address.province && address.province.includes("تهران")) {
      shippingCost = 100000;
    }

    return {
      shippingCost,
      province: address.province,
      city: address.city,
      address,
    };
  }
}
