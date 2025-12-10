import { Request, Response } from "express";
import { prisma } from "../config/db";

// ===== فارسی‌سازی و نرمال‌سازی ورودی =====
function normalize(input: string) {
  return input
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/[‌‍‎‍]/g, "")
    .replace(/\s+/g, " ");
}

type ProductRow = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  sim: number;
  variant: string | null;
};

type FuzzyRow = {
  id: number;
  name: string;
  sim: number;
};

export const search = async (req: Request, res: Response) => {
  try {
    const raw = (req.query.q as string) || "";
    const q = normalize(raw);

    if (q.length < 2) {
      return res.json({
        products: [],
        categories: [],
        brands: [],
        total: 0,
      });
    }

    // ===============================
    // 1) Fuzzy Products
    // ===============================
    const products = await prisma.$queryRawUnsafe<ProductRow[]>(
      `
      WITH fuzzy AS (
        SELECT
          p.id,
          p.name,
          p.slug,
          p."imageUrl",
          similarity(p.name::text, $1::text) AS sim,
          (
            SELECT json_build_object(
              'price', v.price,
              'discountPrice', v."discountPrice"
            )::text
            FROM "ProductVariant" v
            WHERE v."productId" = p.id
            ORDER BY COALESCE(v."discountPrice", v.price) ASC
            LIMIT 1
          ) AS variant
        FROM "Product" p
        WHERE similarity(p.name::text, $1::text) >= 0.1
        ORDER BY sim DESC
        LIMIT 12
      ),
      ilike_fallback AS (
        SELECT
          p.id,
          p.name,
          p.slug,
          p."imageUrl",
          0.0 AS sim,
          (
            SELECT json_build_object(
              'price', v.price,
              'discountPrice', v."discountPrice"
            )::text
            FROM "ProductVariant" v
            WHERE v."productId" = p.id
            ORDER BY COALESCE(v."discountPrice", v.price) ASC
            LIMIT 1
          ) AS variant
        FROM "Product" p
        WHERE p.name ILIKE '%' || $1 || '%'
        LIMIT 6
      )
      SELECT * FROM fuzzy
      UNION ALL
      SELECT * FROM ilike_fallback
      ORDER BY sim DESC
      LIMIT 12;
      `,
      q
    );

    // ===============================
    // 2) Fuzzy Categories
    // ===============================
    const categories = await prisma.$queryRawUnsafe<FuzzyRow[]>(
      `
      WITH fuzzy AS (
        SELECT 
          c.id,
          c.name,
          similarity(c.name::text, $1::text) AS sim
        FROM "Category" c
        WHERE similarity(c.name::text, $1::text) >= 0.1
        ORDER BY sim DESC
        LIMIT 6
      ),
      ilike_fallback AS (
        SELECT
          c.id,
          c.name,
          0.0 AS sim
        FROM "Category" c
        WHERE c.name ILIKE '%' || $1 || '%'
        LIMIT 4
      )
      SELECT * FROM fuzzy
      UNION ALL
      SELECT * FROM ilike_fallback
      ORDER BY sim DESC
      LIMIT 6;
      `,
      q
    );

    // ===============================
    // 3) Fuzzy Brands
    // ===============================
    const brands = await prisma.$queryRawUnsafe<FuzzyRow[]>(
      `
      WITH fuzzy AS (
        SELECT 
          b.id,
          b.name,
          similarity(b.name::text, $1::text) AS sim
        FROM "Brand" b
        WHERE similarity(b.name::text, $1::text) >= 0.1
        ORDER BY sim DESC
        LIMIT 6
      ),
      ilike_fallback AS (
        SELECT
          b.id,
          b.name,
          0.0 AS sim
        FROM "Brand" b
        WHERE b.name ILIKE '%' || $1 || '%'
        LIMIT 4
      )
      SELECT * FROM fuzzy
      UNION ALL
      SELECT * FROM ilike_fallback
      ORDER BY sim DESC
      LIMIT 6;
      `,
      q
    );

    // ===============================
    // Mapping
    // ===============================
    return res.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.imageUrl,
        variants: p.variant ? [JSON.parse(p.variant)] : [],
      })),
      categories,
      brands,
      total: products.length + categories.length + brands.length,
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return res.status(500).json({ message: "Search failed" });
  }
};
