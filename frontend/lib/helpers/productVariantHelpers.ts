// /lib/helpers/productVariantHelpers.ts

import type { Product } from "@/lib/types/product";
import type { ProductVariant } from "@/lib/types/variant";

/**
 * تشخیص تعداد ویژگی‌های متمایز در بین واریانت‌ها
 */
export function countDistinctAttributes(variants: ProductVariant[]): number {
  if (!variants.length) return 0;

  // مجموعه attributeId های یونیک که حداقل یک واریانت مقدار متفاوت دارد
  const attributesWithVariation = new Set<number>();

  // برای هر attribute، چک می‌کنیم آیا مقادیر مختلفی در بین واریانت‌ها وجود دارد
  const attributeValuesMap = new Map<number, Set<string>>();

  variants.forEach((variant) => {
    variant.attributes?.forEach((attr) => {
      if (!attributeValuesMap.has(attr.attributeId)) {
        attributeValuesMap.set(attr.attributeId, new Set());
      }
      attributeValuesMap.get(attr.attributeId)!.add(attr.value);
    });
  });

  // attribute هایی که بیش از یک مقدار دارند را شمارش می‌کنیم
  attributeValuesMap.forEach((values, attributeId) => {
    if (values.size > 1) {
      attributesWithVariation.add(attributeId);
    }
  });

  return attributesWithVariation.size;
}

/**
 * تعیین اینکه آیا محصول نیاز به انتخاب دارد یا خیر
 */
export function requiresSelection(product: Product): boolean {
  const variants = product.variants ?? [];

  if (variants.length === 0) return false;
  if (variants.length === 1) return false;

  const distinctAttributeCount = countDistinctAttributes(variants);

  // اگر بیش از یک ویژگی متمایز وجود داشته باشد، نیاز به انتخاب است
  return distinctAttributeCount >= 2;
}

/**
 * محاسبه حداقل قیمت قابل خرید (با احتساب تخفیف)
 */
export function getMinimumPrice(variants: ProductVariant[]): {
  price: number;
  discountPrice: number | null;
  hasDiscount: boolean;
} {
  const availableVariants = variants.filter((v) => v.stock > 0);

  if (availableVariants.length === 0) {
    // اگر هیچ واریانت موجودی نداشت، از اولین واریانت استفاده می‌کنیم
    const fallback = variants[0];
    const price = Number(fallback?.price ?? 0);
    const discount = Number(fallback?.discountPrice ?? 0);
    return {
      price,
      discountPrice: discount > 0 && discount < price ? discount : null,
      hasDiscount: discount > 0 && discount < price,
    };
  }

  let minPrice = Infinity;
  let minDiscountPrice: number | null = null;

  availableVariants.forEach((variant) => {
    const price = Number(variant.price);
    const discount = Number(variant.discountPrice ?? 0);
    const effectivePrice = discount > 0 && discount < price ? discount : price;

    if (effectivePrice < minPrice) {
      minPrice = effectivePrice;
      minDiscountPrice = discount > 0 && discount < price ? discount : null;
    }
  });

  return {
    price: minPrice === Infinity ? 0 : minPrice,
    discountPrice: minDiscountPrice,
    hasDiscount: minDiscountPrice !== null,
  };
}

/**
 * انتخاب واریانت پیش‌فرض برای افزودن به سبد (فقط در صورتی که مجاز باشد)
 */
export function getDefaultVariantForCart(
  product: Product,
): ProductVariant | null {
  const variants = product.variants ?? [];
  const availableVariants = variants.filter((v) => v.stock > 0);

  if (availableVariants.length === 0) return null;
  if (requiresSelection(product)) return null;

  // اگر فقط یک واریانت موجود است یا تنها یک attribute متمایز دارد، اولین موجودی را برمی‌گردانیم
  return availableVariants[0];
}

/**
 * محاسبه درصد تخفیف
 */
export function calculateDiscountPercent(
  price: number,
  discountPrice: number,
): number {
  if (discountPrice <= 0 || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

/**
 * دریافت خلاصه گزینه‌های محصول به صورت دینامیک
 * مثال: "+3 طعم / +2 بسته‌بندی"
 */
export function getVariantOptionsSummary(product: Product): string | null {
  const variants = product.variants ?? [];
  if (variants.length <= 1) return null;

  const attributeValuesMap = new Map<string, Set<string>>();

  variants.forEach((variant) => {
    variant.attributes?.forEach((attr) => {
  const attrName = attr.value.attribute.name;
  const attrValue = attr.value.value;

  if (!attributeValuesMap.has(attrName)) {
    attributeValuesMap.set(attrName, new Set());
  }

  attributeValuesMap.get(attrName)!.add(attrValue);
});
  });

  const attributeLabels: Record<string, string> = {
  "تعداد در بسته": "تنوع تعدادی",
};

const summaries: string[] = [];

attributeValuesMap.forEach((values, attrName) => {
  if (values.size <= 1) return;

  const displayName = attributeLabels[attrName] ?? attrName;

  summaries.push(`+${values.size} ${displayName}`);
});

return summaries.length ? summaries.join(" / ") : null;

}
