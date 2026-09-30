// src/services/product.service.ts

import { prisma } from "../config/db";
import { Product } from "@prisma/client";
import { NotFoundError, BadRequestError } from "../utils/ApiError"; // وارد کردن کلاس‌های خطا
import { Prisma } from "@prisma/client"; // وارد کردن Prisma برای دسترسی به کد خطا
import { getPagination, buildPaginationMeta } from "../utils/pagination";
import { categoryService } from "./categoryService";
import { decorateProduct } from "../utils/productHelper";

type ProductSort =
  | "latest"
  | "bestseller"
  | "cheapest"
  | "expensive"
  | "most_viewed"
  | "default";

// تبدیل ورودی‌های مختلف (string, number, boolean) به boolean

// نرمال‌سازی نوع مرتب‌سازی
const normalizeSort = (sort?: string): ProductSort => {
  const validSorts: ProductSort[] = [
    "latest",
    "bestseller",
    "cheapest",
    "expensive",
    "most_viewed",
    "default",
  ];
  return validSorts.includes(sort as ProductSort)
    ? (sort as ProductSort)
    : "default";
};
const normalizeAndValidateSlug = (value: unknown): string => {
  if (typeof value !== "string") {
    throw new BadRequestError("Slug الزامی است.");
  }

  const slug = value.trim().toLowerCase();

  if (!slug) {
    throw new BadRequestError("Slug الزامی است.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new BadRequestError(
      "Slug فقط باید شامل حروف انگلیسی، عدد و خط تیره باشد.",
    );
  }

  return slug;
};
// محاسبه قیمت موثر (برای استفاده در مرتب‌سازی)
const calculateEffectivePrice = (
  product: any,
  mode: "min" | "max" = "min",
): number => {
  if (!product.variants?.length) return mode === "min" ? Infinity : -Infinity;

  const prices = product.variants.map((v: any) =>
    v.discountPrice && Number(v.discountPrice) > 0
      ? Number(v.discountPrice)
      : Number(v.price) || 0,
  );

  return mode === "min" ? Math.min(...prices) : Math.max(...prices);
};

// تابع اصلی مرتب‌سازی (جاوااسکریپتی)
const sortProducts = (products: any[], sort: ProductSort) => {
  return [...products].sort((a, b) => {
    // 1. اولویت اصلی: موجود بودن کالا
    const aInStock = a.variants?.some((v: any) => v.stock > 0);
    const bInStock = b.variants?.some((v: any) => v.stock > 0);

    if (aInStock !== bInStock) {
      return aInStock ? -1 : 1; // موجودها بالاتر
    }

    // 2. اولویت‌های بعدی بر اساس نوع مرتب‌سازی
    switch (sort) {
      case "cheapest":
        return a.effectivePrice - b.effectivePrice;

      case "expensive":
        return b.effectivePrice - a.effectivePrice;

      case "bestseller":
        // اگر فیلد soldCount در دیتابیس دارید
        return (b.soldCount || 0) - (a.soldCount || 0);

      case "most_viewed":
        // اگر فیلد viewCount در دیتابیس دارید
        return (b.viewCount || 0) - (a.viewCount || 0);

      case "latest":
      case "default":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });
};
export const productService = {
  // ۱. getAll: بدون تغییر خاص
  getAll: async (): Promise<Product[]> => {
    return prisma.product.findMany();
  },
  async getAllActiveProducts() {
    return prisma.product.findMany({
      where: {
        isBlock: false,
      },
      include: {
        variants: {
          orderBy: {
            id: "asc",
          },
          take: 1,
        },
      },
      orderBy: {
        id: "desc",
      },
    });
  },
  async getAllProductsForAdmin() {
    return prisma.product.findMany({
      include: {
        variants: {
          orderBy: {
            id: "asc",
          },
          take: 1,
        },
      },
      orderBy: [
        {
          isBlock: "asc",
        },
        {
          id: "desc",
        },
      ],
    });
  },
  // ۲. getById: اگر null برگردد، 404 پرتاب کن
  getById: async (id: number) => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,

        attributes: {
          include: {
            value: {
              include: {
                attribute: true,
              },
            },
          },
        },

        variants: {
          include: {
            images: true,

            attributes: {
              include: {
                value: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found.`);
    }

    return decorateProduct(product);
  },

  // ۳. create: مدیریت خطای Unique Constraint
  create: async (data: any) => {
    try {
      let variants: any[] = [];

      if (typeof data.variants === "string") {
        try {
          variants = JSON.parse(data.variants);
        } catch (err) {
          throw new BadRequestError("فرمت واریانت‌ها نادرست است.");
        }
      } else if (Array.isArray(data.variants)) {
        variants = data.variants;
      } else if (data.variant) {
        variants = [data.variant];
      }

      if (!variants || variants.length === 0) {
        throw new BadRequestError(
          "واریانت محصول الزامی است و نباید خالی باشد.",
        );
      }

      // اعتبارسنجی قیمت همه واریانت‌ها
      for (const v of variants) {
        const p = Number(v.price);
        const d = v.discountPrice ? Number(v.discountPrice) : null;
        if (d !== null && d >= p) {
          throw new BadRequestError(
            "قیمت با تخفیف نباید از قیمت اصلی بیشتر یا مساوی باشد",
          );
        }
      }

      const slug = normalizeAndValidateSlug(data.slug);

      const OR: Prisma.ProductWhereInput[] = [
        {
          name: data.name.trim(),
        },
        {
          slug,
        },
      ];

      const existing = await prisma.product.findFirst({
        where: {
          OR,
        },
      });

      if (existing) {
        if (existing.name === data.name.trim()) {
          throw new BadRequestError("محصولی با این نام قبلاً وجود دارد.");
        }

        if (existing.slug === slug) {
          throw new BadRequestError("این slug قبلاً استفاده شده است.");
        }

        throw new BadRequestError("محصولی با این نام یا slug قبلاً وجود دارد.");
      }

      const isBlock =
        typeof data.isBlock === "string"
          ? data.isBlock === "true"
          : Boolean(data.isBlock);

      // ✅ کل عملیات نوشتن در دیتابیس داخل transaction
      return await prisma.$transaction(async (tx) => {
        // ✅ ساخت محصول اصلی
        const product = await tx.product.create({
          data: {
            name: data.name.trim(),
            description: data.description?.trim() || "",
            shortDescription: data.shortDescription?.trim() || "",
            metaTitle: data.metaTitle?.trim() || "",
            metaDescription: data.metaDescription?.trim() || "",
            slug,
            imageUrl: data.imageUrl ?? "",
            brandId: Number(data.brandId),
            categoryId: Number(data.categoryId),
            isBlock,
          },
        });
        if (Array.isArray(data.attributes) && data.attributes.length) {
          await tx.productAttribute.createMany({
            data: data.attributes.map((attr: any) => ({
              productId: product.id,
              valueId: Number(typeof attr === "object" ? attr.valueId : attr),
            })),
          });
        }
        // ✅ ساخت همه واریانت‌ها (نه فقط اول)
        for (const variant of variants) {
          const variantPrice = Number(variant.price);
          const variantDiscountPrice = variant.discountPrice
            ? Number(variant.discountPrice)
            : null;
          const finalDiscountPrice =
            variantDiscountPrice !== null &&
            variantDiscountPrice >= 1 &&
            variantDiscountPrice < variantPrice
              ? variantDiscountPrice
              : null;

          const variantRecord = await tx.productVariant.create({
            data: {
              productId: product.id,

              sku: variant.sku || null,
              barcode: variant.barcode || null,

              purchasePrice: variant.purchasePrice
                ? new Prisma.Decimal(variant.purchasePrice)
                : null,

              price: new Prisma.Decimal(variant.price),

              discountPrice:
                variant.discountPrice &&
                Number(variant.discountPrice) < Number(variant.price)
                  ? new Prisma.Decimal(variant.discountPrice)
                  : null,

              stock: Number(variant.stock ?? 0),

              expiryDate: variant.expiryDate
                ? new Date(variant.expiryDate)
                : null,
            },
          });
          if (Array.isArray(variant.attributes) && variant.attributes.length) {
            await tx.productVariantAttribute.createMany({
              data: variant.attributes.map((attr: any) => ({
                variantId: variantRecord.id,
                valueId: Number(typeof attr === "object" ? attr.valueId : attr),
              })),
            });
          }
          // ✅ ذخیره تصاویر این واریانت
          if (Array.isArray(variant.images) && variant.images.length > 0) {
            await tx.productImage.createMany({
              data: variant.images.map((img: any, index: number) => ({
                variantId: variantRecord.id,
                url: typeof img === "string" ? img : img.url,
                altText: typeof img === "string" ? "" : (img.altText ?? ""),
                displayOrder:
                  typeof img === "string" ? index : (img.displayOrder ?? index),
                isPrimary:
                  typeof img === "string"
                    ? index === 0
                    : (img.isPrimary ?? index === 0),
              })),
            });
          }
        }

        // بازگرداندن محصول نهایی با همه واریانت‌ها و تصاویر
        return await tx.product.findUnique({
          where: { id: product.id },
          include: {
            variants: {
              include: {
                images: {
                  orderBy: {
                    displayOrder: "asc",
                  },
                },
                attributes: {
                  include: {
                    value: {
                      include: {
                        attribute: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target =
          (error.meta?.target as string[])?.join("، ") || "فیلد منحصربه‌فرد";
        throw new BadRequestError(`مقدار تکراری در ${target}.`);
      }
      console.error("🔥 خطای غیرمنتظره در ProductService.create:", error);
      throw error;
    }
  },

  // ۴. update: مدیریت خطای پیدا نشدن و بازگرداندن رکورد به‌روز شده
  update: async (
    id: number,
    data: Partial<Product> & {
      attributes?: {
        attributeId: number;
        valueId: number;
      }[];
    },
  ): Promise<Product> => {
    try {
      // 🔹 یافتن محصول فعلی برای تصمیم در مورد اسلاگ
      const existing = await prisma.product.findUnique({
        where: { id },
        select: { name: true, slug: true, imageUrl: true },
      });

      if (!existing) {
        throw new NotFoundError(
          `Cannot update: Product with ID ${id} not found.`,
        );
      }

      // 🔹 تعیین اسلاگ جدید فقط در صورتی که نام تغییر کرده باشد
      const slug =
        data.slug !== undefined
          ? normalizeAndValidateSlug(data.slug)
          : existing.slug;
      if (slug !== existing.slug) {
        const slugOwner = await prisma.product.findFirst({
          where: {
            slug,
            NOT: {
              id,
            },
          },
          select: {
            id: true,
          },
        });

        if (slugOwner) {
          throw new BadRequestError(
            "این slug قبلاً برای محصول دیگری استفاده شده است.",
          );
        }
      }
      // 🔹 نرمال‌سازی داده‌های ورودی (از FormData)
      const normalizedData = {
        ...data,
        brandId: data.brandId ? Number(data.brandId) : undefined,
        categoryId: data.categoryId ? Number(data.categoryId) : undefined,
        shortDescription: data.shortDescription,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        isBlock:
          typeof data.isBlock === "string"
            ? data.isBlock === "true"
            : Boolean(data.isBlock),
        imageUrl:
          typeof data.imageUrl === "string" &&
          data.imageUrl.trim() !== "" &&
          !["undefined", "null"].includes(data.imageUrl.trim().toLowerCase())
            ? data.imageUrl
            : existing.imageUrl,
      };
      // 🔹 ساخت آبجکت آپدیت نهایی
      const updateData: any = {
        name: normalizedData.name,
        description: normalizedData.description,
        isBlock: normalizedData.isBlock,
        imageUrl: normalizedData.imageUrl,
        slug,
        shortDescription: normalizedData.shortDescription,
        metaTitle: normalizedData.metaTitle,
        metaDescription: normalizedData.metaDescription,
        // ✅ ارتباط‌ها با connect
        brand: normalizedData.brandId
          ? { connect: { id: normalizedData.brandId } }
          : undefined,
        category: normalizedData.categoryId
          ? { connect: { id: normalizedData.categoryId } }
          : undefined,
      };

      // 🔹 پاک کردن فیلدهای ناخواسته تا Prisma ارور نده
      delete updateData.brandId;
      delete updateData.categoryId;

      // 🔹 اجرای آپدیت
      const updated = await prisma.$transaction(async (tx) => {
        // 1. آپدیت خود محصول
        const product = await tx.product.update({
          where: { id },
          data: updateData,
        });

        // 2. آپدیت Attributeهای محصول
        if (data.attributes) {
          await tx.productAttribute.deleteMany({
            where: { productId: id },
          });

          if (data.attributes.length) {
            await tx.productAttribute.createMany({
              data: data.attributes.map((attr) => ({
                productId: id,
                valueId: attr.valueId,
              })),
            });
          }
        }

        return product;
      });

      return updated;
    } catch (error) {
      // خطای P2025 = محصول پیدا نشد
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(
          `Cannot update: Product with ID ${id} not found.`,
        );
      }

      // سایر خطاهای احتمالی
      throw error;
    }
  },
  increaseViewCount: async (id: number) => {
    try {
      const updated = await prisma.product.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
        select: { id: true, name: true, viewCount: true },
      });
      console.log(updated);
      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(`Product with ID ${id} not found.`);
      }
      throw error;
    }
  },
  // ۵. delete: مدیریت خطای پیدا نشدن و بازگرداندن رکورد حذف شده
  delete: async (id: number): Promise<Product> => {
    try {
      // از delete استفاده می‌کنیم. اگر رکورد پیدا نشود، Prisma خطای P2025 پرتاب می‌کند.
      return await prisma.product.delete({ where: { id } });
    } catch (error) {
      // مدیریت خطای پیدا نشدن رکورد برای عملیات Delete (کد P2025 در Prisma)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(
          `Cannot delete: Product with ID ${id} not found.`,
        );
      }
      throw error;
    }
  },
  block: async (id: number, isBlock: boolean) => {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, isBlock: true },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found.`);
    }

    if (product.isBlock === isBlock) {
      throw new BadRequestError(
        isBlock ? "محصول از قبل بلاک است." : "محصول از قبل فعال است.",
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isBlock },
      select: {
        id: true,
        name: true,
        isBlock: true,
      },
    });

    return updated;
  },

  async getFilteredProducts(filters: {
    categorySlug?: string;
    brand?: number | number[];
    discount?: any;
    available?: any;
    page?: any;
    limit?: any;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    isBlock?: boolean;
  }) {
    const categorySlug = filters.categorySlug;
    /* ========================
   ✅ NORMALIZE
  ======================== */
    const parseBoolean = (v: any): boolean | undefined => {
      if (Array.isArray(v)) v = v[0];

      if (v === "1" || v === 1 || v === true || v === "true" || v === "on") {
        return true;
      }

      if (v === "0" || v === 0 || v === false || v === "false") {
        return false;
      }

      return undefined;
    };

    const brandIds = filters.brand
      ? Array.isArray(filters.brand)
        ? filters.brand.map(Number).filter(Boolean)
        : [Number(filters.brand)]
      : undefined;

    const hasDiscount = parseBoolean(filters.discount);
    const inStock = parseBoolean(filters.available);

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;

    const minPrice =
      filters.minPrice !== undefined && !isNaN(Number(filters.minPrice))
        ? Number(filters.minPrice)
        : undefined;

    const maxPrice =
      filters.maxPrice !== undefined && !isNaN(Number(filters.maxPrice))
        ? Number(filters.maxPrice)
        : undefined;

    /* ======================== */
    let category: {
      id: number;
      name: string;
    } | null = null;

    let categoryIds: number[] | undefined;

    if (categorySlug) {
      category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true, name: true },
      });

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      categoryIds = await categoryService.getAllSubCategoryIds(category.id);
    }

    /* ========================
   ✅ PRODUCT WHERE
   (فقط فیلترهای سطح Product: category, brand, isBlock)
   ⚠️ توجه: فیلترهای available/discount/price دیگر اینجا اعمال
   نمی‌شوند، چون باید روی displayVariant/effectivePrice/discountPercent
   (خروجی decorateProduct) اعمال شوند، نه روی واریانت‌های خام Prisma.
  ======================== */
    const where: Prisma.ProductWhereInput = {
      isBlock: filters.isBlock !== undefined ? filters.isBlock : false,
    };

    if (categoryIds) {
      where.categoryId = {
        in: categoryIds,
      };
    }
    if (brandIds?.length) {
      where.brandId = { in: brandIds };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,

        attributes: {
          include: {
            value: {
              include: {
                attribute: true,
              },
            },
          },
        },

        variants: {
          include: {
            images: true,

            attributes: {
              include: {
                value: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // ✅ decorate: displayVariant, effectivePrice, displayPrice,
    // displayDiscountPrice, discountPercent, attributesSummary,
    // requiresSelection ساخته می‌شوند
    const prepared = products.map(decorateProduct);

    /* ========================
   ✅ FILTERS ON DECORATED PRODUCTS
   این فیلترها دقیقاً همان مقادیری را بررسی می‌کنند که در کارت
   محصول نمایش داده می‌شوند.
  ======================== */
    let filtered = prepared;

    // 1. Available filter — فقط displayVariant بررسی می‌شود
    if (inStock) {
      filtered = filtered.filter(
        (p: any) => p.displayVariant && p.displayVariant.stock > 0,
      );
    }

    // 2. Discount filter — بر اساس فیلدهای محاسبه‌شده تخفیف
    if (hasDiscount) {
      filtered = filtered.filter(
        (p: any) => p.discountPercent > 0 || p.displayDiscountPrice !== null,
      );
    }

    // 3. Price filter — بر اساس effectivePrice (همان قیمتی که در کارت
    // نمایش داده می‌شود)، نه price/discountPrice خام واریانت
    if (minPrice !== undefined) {
      filtered = filtered.filter((p: any) => p.effectivePrice >= minPrice);
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter((p: any) => p.effectivePrice <= maxPrice);
    }

    /* ========================
   ✅ SORT
   بعد از فیلتر، روی filtered اجرا می‌شود
  ======================== */
    const sort = normalizeSort(filters.sort);
    filtered = sortProducts(filtered, sort);

    /* ========================
   ✅ PAGINATION
  ======================== */
    const total = filtered.length;
    const { skip, take } = getPagination(page, limit);

    return {
      category,
      products: filtered.slice(skip, skip + take),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
  // در productService اضافه کن:
  async getLatestProducts(limit = 8) {
    const result = await this.getFilteredProducts({
      page: 1,
      limit,
      sort: "latest",
      isBlock: false,
    });

    return result.products;
  },
  async getSimilarProducts(productId: number, limit = 8) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        brandId: true,
        attributes: { select: { valueId: true } },
      },
    });

    if (!product)
      throw new NotFoundError(`Product with ID ${productId} not found.`);

    const attributeValueIds = product.attributes.map((a) => a.valueId);

    const candidates = await prisma.product.findMany({
      where: { id: { not: productId }, isBlock: false },
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            images: true,
            attributes: {
              include: { value: { include: { attribute: true } } },
            },
          },
        },
        attributes: {
          include: { value: { include: { attribute: true } } }, // ← این خط اضافه شد
        },
      },
    });

    const scored = candidates
      .map((p) => {
        let score = 0;
        if (p.categoryId === product.categoryId) score += 3;
        if (p.brandId === product.brandId) score += 2;
        const sharedAttrs = p.attributes.filter((a) =>
          attributeValueIds.includes(a.value.id),
        ).length;
        score += sharedAttrs;
        return { product: p, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => decorateProduct(item.product));

    return scored;
  },
};
