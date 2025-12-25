import { Request, Response } from "express";
import { prisma } from "../config/db";

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
    .replace(/[‌‍‎‍]/g, "")
    .replace(/\s+/g, " ");
}

type ProductRow = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  sim: number;
  hasStock: boolean;
  variant: string | null;
};

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

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 12, 24);
    const offset = (page - 1) * limit;

    if (q.length < 2) {
      return res.json({
        products: [],
        categories: [],
        brands: [],
        total: 0,
      });
    }

    // ============================================================
    // 1) PRODUCTS — موجودی واقعی + cheapest AVAILABLE variant
    // ============================================================
    const products = await prisma.$queryRawUnsafe<ProductRow[]>(
      `
      WITH combined AS (
        SELECT
          p.id,
          p.name,
          p.slug,
          p."imageUrl",
          similarity(p.name::text, $1::text) AS sim,

          BOOL_OR(v.stock > 0) AS "hasStock",

          (
            SELECT json_build_object(
              'id', v2.id,
              'price', v2.price,
              'discountPrice', v2."discountPrice",
              'stock', v2.stock,
              'flavor', v2.flavor,
              'packageQuantity', v2."packageQuantity"
            )::text
            FROM "ProductVariant" v2
            WHERE v2."productId" = p.id
            ORDER BY
              CASE WHEN v2.stock > 0 THEN 0 ELSE 1 END,
              COALESCE(v2."discountPrice", v2.price) ASC
            LIMIT 1
          ) AS variant
        FROM "Product" p
        JOIN "ProductVariant" v ON v."productId" = p.id
        WHERE similarity(p.name::text, $1::text) >= 0.1
        GROUP BY p.id

        UNION ALL

        SELECT
          p.id,
          p.name,
          p.slug,
          p."imageUrl",
          0.0 AS sim,

          BOOL_OR(v.stock > 0) AS "hasStock",

          (
            SELECT json_build_object(
              'id', v2.id,
              'price', v2.price,
              'discountPrice', v2."discountPrice",
              'stock', v2.stock,
              'flavor', v2.flavor,
              'packageQuantity', v2."packageQuantity"
            )::text
            FROM "ProductVariant" v2
            WHERE v2."productId" = p.id
            ORDER BY
              CASE WHEN v2.stock > 0 THEN 0 ELSE 1 END,
              COALESCE(v2."discountPrice", v2.price) ASC
            LIMIT 1
          ) AS variant
        FROM "Product" p
        JOIN "ProductVariant" v ON v."productId" = p.id
        WHERE p.name ILIKE '%' || $1 || '%'
        GROUP BY p.id
      )
      SELECT DISTINCT ON (id)
        id,
        name,
        slug,
        "imageUrl",
        sim,
        "hasStock",
        variant
      FROM combined
      WHERE "hasStock" = true
      ORDER BY id, sim DESC
      OFFSET $2
      LIMIT $3;
      `,
      q,
      offset,
      limit
    );

    // ============================================================
    // TOTAL COUNT — فقط محصولات موجود
    // ============================================================
    const totalRow = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `
      SELECT COUNT(DISTINCT p.id)::bigint AS count
      FROM "Product" p
      WHERE EXISTS (
        SELECT 1
        FROM "ProductVariant" v
        WHERE v."productId" = p.id
          AND v.stock > 0
      )
      AND (
        similarity(p.name::text, $1::text) >= 0.1
        OR p.name ILIKE '%' || $1 || '%'
      );
      `,
      q
    );

    const total = Number(totalRow[0]?.count ?? 0);

    // ============================================================
    // 2) CATEGORIES (DEDUP BY slug)
    // ============================================================
    const categories = await prisma.$queryRawUnsafe<FuzzyRow[]>(
      `
      WITH combined AS (
        SELECT
          c.id,
          c.name,
          c.slug,
          similarity(c.name::text, $1::text) AS sim
        FROM "Category" c
        WHERE similarity(c.name::text, $1::text) >= 0.1

        UNION ALL

        SELECT
          c.id,
          c.name,
          c.slug,
          0.0 AS sim
        FROM "Category" c
        WHERE c.name ILIKE '%' || $1 || '%'
      )
      SELECT DISTINCT ON (slug)
        id, name, slug
      FROM combined
      ORDER BY slug, sim DESC
      LIMIT 6;
      `,
      q
    );

    // ============================================================
    // 3) BRANDS (DEDUP BY slug)
    // ============================================================
    const brands = await prisma.$queryRawUnsafe<FuzzyRow[]>(
      `
      WITH combined AS (
        SELECT
          b.id,
          b.name,
          b.slug,
          similarity(b.name::text, $1::text) AS sim
        FROM "Brand" b
        WHERE similarity(b.name::text, $1::text) >= 0.1

        UNION ALL

        SELECT
          b.id,
          b.name,
          b.slug,
          0.0 AS sim
        FROM "Brand" b
        WHERE b.name ILIKE '%' || $1 || '%'
      )
      SELECT DISTINCT ON (slug)
        id, name, slug
      FROM combined
      ORDER BY slug, sim DESC
      LIMIT 6;
      `,
      q
    );

    // ============================================================
    // RESPONSE
    // ============================================================
    return res.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.imageUrl,
        hasStock: p.hasStock,
        variants: p.variant ? [JSON.parse(p.variant)] : [],
      })),
      categories,
      brands,
      total,
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return res.status(500).json({ message: "Search failed" });
  }
};
