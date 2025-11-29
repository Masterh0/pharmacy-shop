import { prisma } from "../config/db";
import normalizePhone from "../controllers/authController";
import { CreateAddressDto, UpdateAddressDto } from "../dto/address.dto";

export class AddressService {
  async createAddress(userId: number, data: CreateAddressDto) {
    const phone = normalizePhone(data.phone);

    // اگر آدرس جدید پیش‌فرض باشد، همه‌ی آدرس‌های قبلی را غیرپیش‌فرض کن
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

  async updateAddress(userId: number, id: number, data: UpdateAddressDto) {
    const phone = data.phone ? normalizePhone(data.phone) : undefined;

    // فقط روی آدرس خود کاربر
    const address = await prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) throw new Error("آدرس یافت نشد");

    // اگر آدرس جدید قرار است پیش‌فرض شود:
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id, userId },
      data: {
        ...data,
        ...(phone && { phone }),
      },
    });
  }

  async deleteAddress(userId: number, id: number) {
    // فقط آدرس کاربر خودش پاک شود
    return prisma.address.delete({
      where: { id, userId },
    });
  }

  async setDefaultAddress(userId: number, id: number) {
    const address = await prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) throw new Error("آدرس یافت نشد");

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return prisma.address.update({
      where: { id, userId },
      data: { isDefault: true },
    });
  }
}
