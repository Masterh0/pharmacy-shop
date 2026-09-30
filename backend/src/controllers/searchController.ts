import { Request, Response } from "express";
import { prisma } from "../config/db";
import { decorateProduct } from "../utils/productHelper";

// ===============================
// Utils
// ===============================
function normalize(input: string) {
  return input
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/[‌‍‍]/g, "")
    .replace(/\s+/g, " ");
}

type FuzzyRow = {
  id: number;
  name: string;
  slug: string;
  sim: number;
};

// ===============================
// Controller
// ===============================
export const search = async (req: Request, res: Response) => {
  try {
    const raw = (req.query.q as string) || "";
    const q = normalize(raw);

    const brandParam =
      req.query.brand !== undefined ? Number(req.query.brand) : undefined;
    const minPriceParam =
      req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
    const maxPriceParam =
      req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
    const categoryParam = req.query.category as string | undefined;

    const hasFilter =
      brandParam !== undefined ||
      minPriceParam !== undefined ||
      maxPriceParam !== undefined ||
      !!categoryParam;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 12, 24);
    const offset = (page - 1) * limit;

    // اگر نه query معتبر داریم نه فیلتر → پاسخ خالی
    if (q.length < 2 && !hasFilter) {
      return res.json({ products: [], categories: [], brands: [], total: 0 });
    }

    // ============================================================
    // حالت فیلتر-فقط (query خالی ولی فیلتر فعال)
    // ============================================================
    if (q.length < 2 && hasFilter) {
      const where: {
        isBlock: boolean;
        brandId?: number;
        category?: { slug: string };
        variants: { some: { stock: { gt: number } } };
      } = {
        isBlock: false,
        variants: { some: { stock: { gt: 0 } } },
        ...(brandParam !== undefined && { brandId: brandParam }),
        ...(categoryParam && { category: { slug: categoryParam } }),
      };

      // بارگذاری همه‌ی محصولات فیلترشده برای اعمال فیلتر قیمت روی effectivePrice
      const rawProducts = await prisma.product.findMany({
        where,
        include: {
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
          attributes: {
            include: {
              value: {
                include: {
                  attribute: true,
                },
              },
            },
          },
          brand: true,
          category: true,
        },
      });

      // decorate کردن و اعمال فیلتر قیمت بعد از محاسبه‌ی effectivePrice
      let decorated = rawProducts.map((p) => decorateProduct(p));

      if (minPriceParam !== undefined) {
        decorated = decorated.filter((p) => p.effectivePrice >= minPriceParam);
      }
      if (maxPriceParam !== undefined) {
        decorated = decorated.filter((p) => p.effectivePrice <= maxPriceParam);
      }

      const total = decorated.length;

      // sort پیش‌فرض (جدیدترین)
      const sortParam = req.query.sort as string | undefined;
      if (sortParam === "price_asc") {
        decorated.sort((a, b) => a.effectivePrice - b.effectivePrice);
      } else if (sortParam === "price_desc") {
        decorated.sort((a, b) => b.effectivePrice - a.effectivePrice);
      }

      // pagination بعد از فیلتر و sort
      const paginated = decorated.slice(offset, offset + limit);

      // count برندها از روی همه‌ی نتایج فیلترشده (نه فقط صفحه‌ی جاری)
      const rawBrandMap = new Map<
        number,
        { id: number; name: string; slug: string }
      >();
      for (const p of rawProducts) {
        if (p.brand) {
          rawBrandMap.set(p.id, {
            id: p.brand.id,
            name: p.brand.name,
            slug: p.brand.slug,
          });
        }
      }

      const brandCountMap = new Map<
        number,
        { id: number; name: string; slug: string; count: number }
      >();
      for (const p of decorated) {
        const b = rawBrandMap.get(p.id);
        if (!b) continue;
        if (!brandCountMap.has(b.id)) {
          brandCountMap.set(b.id, { ...b, count: 0 });
        }
        brandCountMap.get(b.id)!.count++;
      }
      const brands = Array.from(brandCountMap.values()).sort(
        (a, b) => b.count - a.count,
      );

      return res.json({
        products: paginated,
        categories: [],
        brands,
        total,
      });
    }

    // ============================================================
    // حالت عادی — query معتبر (با یا بدون فیلتر اضافه)
    // ============================================================

    // 1) IDs با Raw Query
    const matchedRows = await prisma.$queryRawUnsafe<
      {
        id: number;
        sim: number;
      }[]
    >(
      `
  WITH combined AS (

    -- =========================================
    -- PRODUCT NAME
    -- =========================================
    SELECT
      p.id,
      similarity(p.name::text, $1::text) AS sim
    FROM "Product" p
    WHERE p."isBlock" = false
      AND similarity(p.name::text, $1::text) >= 0.25
      AND EXISTS (
        SELECT 1
        FROM "ProductVariant" v
        WHERE v."productId" = p.id
          AND v.stock > 0
      )

    UNION ALL

    SELECT
      p.id,
      1.0 AS sim
    FROM "Product" p
    WHERE p."isBlock" = false
      AND p.name ILIKE '%' || $1 || '%'
      AND EXISTS (
        SELECT 1
        FROM "ProductVariant" v
        WHERE v."productId" = p.id
          AND v.stock > 0
      )

    -- =========================================
    -- PRODUCT SLUG
    -- =========================================
    UNION ALL

    SELECT
      p.id,
      similarity(p.slug::text, $1::text) AS sim
    FROM "Product" p
    WHERE p."isBlock" = false
      AND similarity(p.slug::text, $1::text) >= 0.25
      AND EXISTS (
        SELECT 1
        FROM "ProductVariant" v
        WHERE v."productId" = p.id
          AND v.stock > 0
      )

    UNION ALL

    SELECT
      p.id,
      1.0 AS sim
    FROM "Product" p
    WHERE p."isBlock" = false
      AND p.slug ILIKE '%' || $1 || '%'
      AND EXISTS (
        SELECT 1
        FROM "ProductVariant" v
        WHERE v."productId" = p.id
          AND v.stock > 0
      )

    -- =========================================
    -- BRAND NAME
    -- =========================================
    UNION ALL

    SELECT
      p.id,
      0.95 AS sim
    FROM "Product" p
    INNER JOIN "Brand" b
      ON b.id = p."brandId"
    WHERE p."isBlock" = false
      AND b.name ILIKE '%' || $1 || '%'
      AND EXISTS (
        SELECT 1
        FROM "ProductVariant" v
        WHERE v."productId" = p.id
          AND v.stock > 0
      )

    UNION ALL

    -- BRAND SLUG
    SELECT
      p.id,
      0.95 AS sim
    FROM "Product" p
    INNER JOIN "Brand" b
      ON b.id = p."brandId"
    WHERE p."isBlock" = false
      AND b.slug ILIKE '%' || $1 || '%'
      AND EXISTS (
        SELECT 1
        FROM "ProductVariant" v
        WHERE v."productId" = p.id
          AND v.stock > 0
      )

    -- =========================================
    -- CATEGORY NAME
    -- =========================================
    UNION ALL

    SELECT
      p.id,
      0.90 AS sim
    FROM "Product" p
    INNER JOIN "Category" c
      ON c.id = p."categoryId"
    WHERE p."isBlock" = false
      AND c.name ILIKE '%' || $1 || '%'
      AND EXISTS (
        SELECT 1
        FROM "ProductVariant" v
        WHERE v."productId" = p.id
          AND v.stock > 0
      )

    UNION ALL

    -- CATEGORY SLUG
    SELECT
      p.id,
      0.90 AS sim
    FROM "Product" p
    INNER JOIN "Category" c
      ON c.id = p."categoryId"
    WHERE p."isBlock" = false
      AND c.slug ILIKE '%' || $1 || '%'
      AND EXISTS (
        SELECT 1
        FROM "ProductVariant" v
        WHERE v."productId" = p.id
          AND v.stock > 0
      )
  )

  SELECT DISTINCT ON (id)
    id,
    sim
  FROM combined
  ORDER BY id, sim DESC;
  `,
      q,
    );

    // بارگذاری کامل با Prisma
    const allMatchedIds = matchedRows.map((r) => r.id);

    const rawProducts = await prisma.product.findMany({
      where: {
        id: { in: allMatchedIds },
        ...(brandParam !== undefined && { brandId: brandParam }),
        ...(categoryParam && { category: { slug: categoryParam } }),
      },
      include: {
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
        attributes: {
          include: {
            value: {
              include: {
                attribute: true,
              },
            },
          },
        },
        brand: true,
        category: true,
      },
    });

    // decorate و فیلتر قیمت
    const simMap = new Map(matchedRows.map((r) => [r.id, r.sim]));
    let decorated = rawProducts
      .sort((a, b) => (simMap.get(b.id) ?? 0) - (simMap.get(a.id) ?? 0))
      .map((p) => decorateProduct(p));

    if (minPriceParam !== undefined) {
      decorated = decorated.filter((p) => p.effectivePrice >= minPriceParam);
    }
    if (maxPriceParam !== undefined) {
      decorated = decorated.filter((p) => p.effectivePrice <= maxPriceParam);
    }

    const total = decorated.length;

    // sort
    const sortParam = req.query.sort as string | undefined;
    if (sortParam === "price_asc") {
      decorated.sort((a, b) => a.effectivePrice - b.effectivePrice);
    } else if (sortParam === "price_desc") {
      decorated.sort((a, b) => b.effectivePrice - a.effectivePrice);
    }

    // pagination بعد از فیلتر
    const products = decorated.slice(offset, offset + limit);

    // ============================================================
    // TOTAL COUNT — برای حالت query با فیلتر برند/دسته
    // اگر فیلتر برند/دسته فعاله، total از روی decorated محاسبه شده
    // (چون query raw و where prisma باید هماهنگ باشن)
    // ============================================================

    // ============================================================
    // CATEGORIES
    // ============================================================
    const categories = await prisma.$queryRawUnsafe<FuzzyRow[]>(
      `
  WITH combined AS (
    -- جستجو در نام دسته‌بندی
    SELECT
      c.id,
      c.name,
      c.slug,
      similarity(c.name::text, $1::text) AS sim
    FROM "Category" c
    WHERE similarity(c.name::text, $1::text) >= 0.25

    UNION ALL

    -- جستجوی مستقیم داخل نام
    SELECT
      c.id,
      c.name,
      c.slug,
      1.0 AS sim
    FROM "Category" c
    WHERE c.name ILIKE '%' || $1 || '%'

    UNION ALL

    -- جستجو در slug
    SELECT
      c.id,
      c.name,
      c.slug,
      similarity(c.slug::text, $1::text) AS sim
    FROM "Category" c
    WHERE similarity(c.slug::text, $1::text) >= 0.25

    UNION ALL

    -- جستجوی مستقیم داخل slug
    SELECT
      c.id,
      c.name,
      c.slug,
      1.0 AS sim
    FROM "Category" c
    WHERE c.slug ILIKE '%' || $1 || '%'
  )

  SELECT DISTINCT ON (id)
    id,
    name,
    slug,
    sim
  FROM combined
  ORDER BY id, sim DESC
  LIMIT 6;
  `,
      q,
    );

    // ============================================================
    // BRANDS — count از روی همه‌ی نتایج match‌شده (نه فقط صفحه‌ی جاری)
    // ============================================================
    const brands = await prisma.$queryRawUnsafe<
      {
        id: number;
        name: string;
        slug: string;
        sim: number;
      }[]
    >(
      `
  WITH combined AS (
    -- جستجو در نام برند
    SELECT
      b.id,
      b.name,
      b.slug,
      similarity(b.name::text, $1::text) AS sim
    FROM "Brand" b
    WHERE similarity(b.name::text, $1::text) >= 0.25

    UNION ALL

    -- جستجوی مستقیم داخل نام برند
    SELECT
      b.id,
      b.name,
      b.slug,
      1.0 AS sim
    FROM "Brand" b
    WHERE b.name ILIKE '%' || $1 || '%'

    UNION ALL

    -- جستجو در slug برند
    SELECT
      b.id,
      b.name,
      b.slug,
      similarity(b.slug::text, $1::text) AS sim
    FROM "Brand" b
    WHERE similarity(b.slug::text, $1::text) >= 0.25

    UNION ALL

    -- جستجوی مستقیم داخل slug برند
    SELECT
      b.id,
      b.name,
      b.slug,
      1.0 AS sim
    FROM "Brand" b
    WHERE b.slug ILIKE '%' || $1 || '%'
  )

  SELECT DISTINCT ON (id)
    id,
    name,
    slug,
    sim
  FROM combined
  ORDER BY id, sim DESC
  LIMIT 6;
  `,
      q,
    );

    // ============================================================
    // RESPONSE
    // ============================================================
    return res.json({
      products,
      categories,
      brands,
      total,
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return res.status(500).json({ message: "Search failed" });
  }
};
