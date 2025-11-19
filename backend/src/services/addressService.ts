import { prisma } from "../config/db";
import  normalizePhone  from "../controllers/authController";

export class AddressService {
  async createAddress(userId: number, data: any) {
    // نرمال‌سازی شماره
    const phone = normalizePhone(data.phone);

    // اگر آدرس جدید باید پیش‌فرض باشد، آدرس‌های قبلی را false کن
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        ...data,
        phone,
        userId,
      },
    });
  }

  async getAddresses(userId: number) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAddressById(userId: number, id: number) {
    const address = await prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) throw new Error("آدرس یافت نشد");
    return address;
  }

  async updateAddress(userId: number, id: number, data: any) {
    const phone = data.phone ? normalizePhone(data.phone) : undefined;

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id },
      data: {
        ...data,
        ...(phone && { phone }),
      },
    });
  }

  async deleteAddress(userId: number, id: number) {
    return prisma.address.delete({
      where: { id },
    });
  }

  async setDefaultAddress(userId: number, id: number) {
    const address = await prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw new Error("آدرس یافت نشد");

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
