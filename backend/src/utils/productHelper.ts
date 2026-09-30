// lib/helpers/productHelper.ts

import { Prisma } from "@prisma/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    variants: {
      include: {
        images: true;
        attributes: {
          include: {
            value: {
              include: {
                attribute: true;
              };
            };
          };
        };
      };
    };
    attributes: {
      include: {
        value: {
          include: {
            attribute: true;
          };
        };
      };
    };
  };
}>;

type VariantWithRelations = ProductWithRelations["variants"][number];

type VariantAttributeWithRelations = VariantWithRelations["attributes"][number];
/**
 * تشخیص اینکه آیا محصول نیاز به انتخاب گزینه دارد
 * (بر اساس تنوع Attribute های واقعی در واریانت‌ها)
 */
export function requiresSelection(product: ProductWithRelations): boolean {
  const variants = product.variants ?? [];

  if (variants.length === 0) return false;
  if (variants.length === 1) return false;

  // نقشه: attributeId -> Set(value)
  const attributeValuesMap = new Map<number, Set<string>>();

  variants.forEach((variant) => {
    variant.attributes?.forEach(
      (variantAttr: VariantAttributeWithRelations) => {
        const attributeId = variantAttr.value?.attribute?.id;
        const attributeValue = variantAttr.value?.value;

        if (!attributeId || !attributeValue) return;

        if (!attributeValuesMap.has(attributeId)) {
          attributeValuesMap.set(attributeId, new Set());
        }
        attributeValuesMap.get(attributeId)!.add(attributeValue);
      },
    );
  });

  // اگر حداقل یک Attribute با بیش از یک مقدار یونیک باشد
  for (const values of attributeValuesMap.values()) {
    if (values.size > 1) {
      return true;
    }
  }

  return false;
}

/**
 * انتخاب واریانت برای نمایش (بر اساس موجودی و کمترین قیمت واقعی)
 */
function getDiscountPercent(variant: VariantWithRelations): number {
  const price = Number(variant.price);
  const discountPrice = Number(variant.discountPrice ?? 0);

  if (discountPrice <= 0 || discountPrice >= price) {
    return 0;
  }

  return ((price - discountPrice) / price) * 100;
}
export function getDisplayVariant(
  variants: VariantWithRelations[],
): VariantWithRelations | null {
  if (!variants.length) return null;

  // اول فقط موجودها
  const availableVariants = variants.filter((v) => v.stock > 0);

  // اگر موجود نبود، همه را بررسی کن
  const source = availableVariants.length > 0 ? availableVariants : variants;

  return [...source].sort((a, b) => {
    const discountA = getDiscountPercent(a);
    const discountB = getDiscountPercent(b);

    // اولویت اول: بیشترین درصد تخفیف
    if (discountB !== discountA) {
      return discountB - discountA;
    }

    // اولویت دوم: ارزان‌ترین قیمت موثر
    return getEffectivePrice(a) - getEffectivePrice(b);
  })[0];
}

/**
 * محاسبه قیمت واقعی یک واریانت (با احتساب تخفیف)
 */
export function getEffectivePrice(variant: VariantWithRelations): number {
  const price = Number(variant.price);
  const discountPrice = Number(variant.discountPrice ?? 0);

  if (discountPrice > 0 && discountPrice < price) {
    return discountPrice;
  }

  return price;
}

/**
 * محاسبه درصد تخفیف فقط از displayVariant
 */
export function calculateDiscountPercent(
  displayVariant: VariantWithRelations | null,
): number {
  if (!displayVariant) return 0;

  const price = Number(displayVariant.price);
  const discountPrice = Number(displayVariant.discountPrice ?? 0);

  if (discountPrice <= 0 || discountPrice >= price) return 0;

  return Math.round(((price - discountPrice) / price) * 100);
}

/**
 * تولید خلاصه Attribute های واریانت‌ها
 * مثال: "+3 طعم / +2 وزن"
 */
export function getAttributesSummary(
  product: ProductWithRelations,
): string | null {
  const variants = product.variants ?? [];

  if (variants.length <= 1) return null;

  // نقشه: attributeName -> Set(value)
  const attributeMap = new Map<string, Set<string>>();

  variants.forEach((variant) => {
    variant.attributes?.forEach(
      (variantAttr: VariantAttributeWithRelations) => {
        const attrName = variantAttr.value?.attribute?.name ?? "ویژگی";
        const attrValue = variantAttr.value?.value;

        if (!attrValue) return;

        if (!attributeMap.has(attrName)) {
          attributeMap.set(attrName, new Set());
        }

        attributeMap.get(attrName)!.add(attrValue);
      },
    );
  });

  const summaries: string[] = [];

  attributeMap.forEach((values, attrName) => {
    if (values.size > 1) {
      summaries.push(`+${values.size} ${attrName}`);
    }
  });

  if (summaries.length === 0) return null;

  return summaries.join(" / ");
}

/**
 * تزئین محصول با فیلدهای محاسبه‌شده
 * این تابع باید در بک‌اند اجرا شود
 */
export function decorateProduct(product: ProductWithRelations) {
  const displayVariant = getDisplayVariant(product.variants ?? []);
  const discountPercent = calculateDiscountPercent(displayVariant);
  const attributesSummary = getAttributesSummary(product);
  const needsSelection = requiresSelection(product);

  const displayPrice = displayVariant ? Number(displayVariant.price) : 0;
  const displayDiscountPrice =
    displayVariant && Number(displayVariant.discountPrice ?? 0) > 0
      ? Number(displayVariant.discountPrice)
      : null;
  const effectivePrice = displayVariant ? getEffectivePrice(displayVariant) : 0;
  const productSpecifications = getProductSpecifications(product);

  const variantSpecifications = getVariantSpecifications(displayVariant);
  return {
    ...product,
    displayVariant,
    displayPrice,
    displayDiscountPrice,
    effectivePrice,
    discountPercent,
    attributesSummary,
    requiresSelection: needsSelection,
    productSpecifications,
    variantSpecifications,
  };
}

/**
 * دریافت واریانت پیش‌فرض برای افزودن مستقیم به سبد
 * (فقط زمانی که نیاز به انتخاب نباشد)
 */
export function getDefaultVariantForCart(
  product: ProductWithRelations,
): VariantWithRelations | null {
  const variants = product.variants ?? [];

  if (variants.length === 0) return null;

  if (requiresSelection(product)) return null;

  const availableVariants = variants.filter((v) => (v.stock ?? 0) > 0);

  if (availableVariants.length === 0) return null;

  return availableVariants[0];
}
export function getProductSpecifications(product: ProductWithRelations) {
  return (product.attributes ?? [])
    .map((item) => ({
      title: item.value?.attribute?.name ?? "",
      value: item.value?.value ?? "",
    }))
    .filter(
      (item) => item.title.trim().length > 0 && item.value.trim().length > 0,
    );
}
export function getVariantSpecifications(variant: VariantWithRelations | null) {
  if (!variant) return [];

  return (variant.attributes ?? [])
    .map((item) => ({
      title: item.value?.attribute?.name ?? "",
      value: item.value?.value ?? "",
    }))
    .filter(
      (item) => item.title.trim().length > 0 && item.value.trim().length > 0,
    );
}
