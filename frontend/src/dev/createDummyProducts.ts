import { productApi } from "@/lib/api/products";

/**
 * ✅ ساخت ۳۰ محصول تستی تصادفی برای تست Pagination
 */
export async function createDummyProducts() {
  const IMAGE_URL = "uploads/image-1761592993826-133971432.jpg";

  // تو اینجا عدد ۳۰ رو می‌تونی تغییر بدی اگر خواستی بیشتر تست کنی
  const productCount = 61;

  for (let i = 31; i <= productCount; i++) {
    const productData = {
      name: `محصول تستی شماره ${i}`,
      sku: `SKU-${1000 + i}`,
      description: `این توضیحات محصول تستی شماره ${i} است.`,
      brandId: 2,          // یکی از برندهای موجود در دیتابیس‌ت
      categoryId: 1,       // یکی از دسته‌بندی‌های معتبر
      isBlock: false,
      imageUrl: IMAGE_URL,
      variants: [
        {
          packageQuantity: Math.floor(Math.random() * 3 + 1) * 10, // مثلاً 10، 20، 30
          packageType: "بسته",
          price: Math.floor(Math.random() * 500000 + 100000),
          discountPrice: Math.floor(Math.random() * 400000 + 90000),
          stock: Math.floor(Math.random() * 50 + 1),
          flavor: ["وانیل", "شکلات", "توت فرنگی", "قهوه"][
            Math.floor(Math.random() * 4)
          ],
          expiryDate: "2026-12-31",
        },
      ],
    };

    try {
      await productApi.create(productData);
      console.log(`✅ محصول ${i} ثبت شد`);
    } catch (err) {
      console.error(`❌ خطا در ساخت محصول شماره ${i}`, err);
    }
  }

  console.log("🎯 ساخت ۳۰ محصول تصادفی تمام شد!");
}
