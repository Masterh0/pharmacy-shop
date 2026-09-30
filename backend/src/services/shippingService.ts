// src/services/shipping.service.ts
import { prisma } from "../config/db";
import { calcShippingFee } from "../lib/shipping";

export class ShippingService {
  static async calculateShipping(addressId: number, userId: number) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!address) throw new Error("Address not found");
    if (address.userId !== userId) throw new Error("Forbidden");

    const shippingCost = calcShippingFee(address.province, address.city);

    return {
      shippingCost,
      province: address.province,
      city: address.city,
      address,
    };
  }
}
