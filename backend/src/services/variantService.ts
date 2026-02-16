import { prisma } from "../config/db";
import { CreateVariantDTO, UpdateVariantDTO } from "../../dto/variantDto";
import { Prisma } from "@prisma/client";
export const variantService = {
  async getAll() {
    return prisma.productVariant.findMany({ include: { product: true } });
  },

  async getById(id: number) {
    return prisma.productVariant.findUnique({
      where: { id },
      include: { product: true, images: { orderBy: { displayOrder: "asc" } } },
    });
  },

  async getByProductId(productId: number) {
    console.log("🧠 Service: getByProductId called with productId:", productId);

    try {
      const result = await prisma.productVariant.findMany({
        where: { productId },
        orderBy: { id: "asc" },
        include: {
          images: { orderBy: { displayOrder: "asc" } }, // 👈 اضافه شد
        },
      });

      // اگر بخوایم مطمئن شیم که نتیجه‌ای برگشته:
      console.log(
        `✅ Service: Found ${result.length} variants for product ${productId}`
      );

      return result;
    } catch (error) {
      // 🔥 این قسمت حیاتی‌ترین بخش برای یافتن ارور 500 هستش
      console.error(
        `🔥 Prisma ERROR in getByProductId for product ${productId}:`,
        error
      );
      // ارور رو re-throw می‌کنیم تا کنترلر بتونه 500 رو بفرسته.
      throw error;
    }
  },

  async create(data: CreateVariantDTO) {
    const price = Number(data.price);
    const discountPrice = data.discountPrice
      ? Number(data.discountPrice)
      : null;

    if (discountPrice && discountPrice > price) {
      throw new Error("❌ قیمت با تخفیف نباید از قیمت اصلی بیشتر باشد");
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId: data.productId,
        packageType: data.packageType,
        packageQuantity: Number(data.packageQuantity),
        price,
        discountPrice,
        stock: Number(data.stock),
        flavor: data.flavor,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });

    if (data.images && data.images.length > 0) {
      await prisma.productImage.createMany({
        data: data.images.map((url, index) => ({
          variantId: variant.id,
          url,
          displayOrder: index,
          isPrimary: index === 0,
        })),
      });
    }

    return prisma.productVariant.findUnique({
      where: { id: variant.id },
      include: { images: true },
    });
  },

  async update(
    id: number,
    data: UpdateVariantDTO,
    files?: Express.Multer.File[]
  ) {
    if (!id || isNaN(id)) throw new Error("❌ شناسه واریانت معتبر نیست");

    const updateData: Prisma.ProductVariantUpdateInput = {};

    if (data.packageType !== undefined)
      updateData.packageType = data.packageType;
    if (data.flavor !== undefined) updateData.flavor = data.flavor;

    if (data.packageQuantity !== undefined) {
      const qty = Number(data.packageQuantity);
      if (isNaN(qty)) throw new Error("❌ تعداد بسته نامعتبر است");
      updateData.packageQuantity = qty;
    }

    if (data.stock !== undefined) {
      const stk = Number(data.stock);
      if (isNaN(stk)) throw new Error("❌ موجودی نامعتبر است");
      updateData.stock = stk;
    }

    if (data.price !== undefined) {
      const prc = Number(data.price);
      if (isNaN(prc)) throw new Error("❌ قیمت نامعتبر است");
      updateData.price = prc;
    }

    if (data.discountPrice !== undefined) {
      const disc = data.discountPrice ? Number(data.discountPrice) : null;
      if (disc !== null && isNaN(disc))
        throw new Error("❌ قیمت تخفیف نامعتبر است");
      updateData.discountPrice = disc;
    }

    if (data.expiryDate !== undefined) {
      updateData.expiryDate =
        data.expiryDate && String(data.expiryDate).trim() !== ""
          ? new Date(data.expiryDate)
          : null;
    }

    if (
      updateData.price !== undefined &&
      updateData.discountPrice !== undefined &&
      updateData.discountPrice !== null
    ) {
      if (Number(updateData.discountPrice) > Number(updateData.price)) {
        throw new Error("❌ قیمت با تخفیف نباید از قیمت اصلی بیشتر باشد");
      }
    }

    return await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({
        where: { id },
        data: updateData,
      });

      // ⭐ فقط وقتی تصاویر تغییر کرده
      if (data.existingImages !== undefined || (files && files.length > 0)) {
        // 🗑️ حذف همه تصاویر قدیمی
        await tx.productImage.deleteMany({
          where: { variantId: id },
        });

        // 📸 لیست تصاویر نهایی
        const imagesToCreate: Array<{
          variantId: number;
          url: string;
          displayOrder: number;
          isPrimary: boolean;
        }> = [];

        // ✅ اضافه کردن تصاویر موجود که حذف نشدن
        if (data.existingImages && data.existingImages.length > 0) {
          data.existingImages.forEach((url: string, index: number) => {
            imagesToCreate.push({
              variantId: id,
              url,
              displayOrder: index,
              isPrimary: index === 0,
            });
          });
        }

        // ✅ اضافه کردن تصاویر جدید
        if (files && files.length > 0) {
          const startIndex = imagesToCreate.length;
          files.forEach((file, index) => {
            imagesToCreate.push({
              variantId: id,
              url: `/uploads/${file.filename}`,
              displayOrder: startIndex + index,
              isPrimary: startIndex === 0 && index === 0,
            });
          });
        }

        // 💾 ذخیره لیست نهایی تصاویر
        if (imagesToCreate.length > 0) {
          await tx.productImage.createMany({
            data: imagesToCreate,
          });
        }
      }

      return tx.productVariant.findUnique({
        where: { id },
        include: { images: { orderBy: { displayOrder: "asc" } } },
      });
    });
  },

  async delete(id: number) {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: { product: { include: { variants: true } } },
    });

    if (variant?.product?.variants && variant.product.variants.length <= 1) {
      throw new Error("❌ محصول نمی‌تواند بدون واریانت باشد");
    }

    await prisma.productVariant.delete({ where: { id } });
    return { success: true };
  },
};
