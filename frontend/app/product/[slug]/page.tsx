import { notFound } from "next/navigation";
import { productApi } from "@/lib/api/products";
import ClientProductView from "./ClientProductView";
import { Product, ProductVariant } from "@/lib/types/product";

interface PageProps {
  params: {
    slug: string; // مثال: "6-vitamin-c-1000-18-tablets"
  };
}

export default async function ProductPage({ params }: PageProps) {
  // ✅ 1. استخراج id از slug
  const [idPart] = params.slug.split("-");
  const id = Number(idPart);

  if (!id || isNaN(id)) return notFound();

  // ✅ 2. دریافت محصول از API
  const product: Product = await productApi.getById(id);

  if (!product) return notFound();

  // ✅ 3. (اختیاری ولی حرفه‌ای) چک تطابق slug
  if (!params.slug.startsWith(`${product.id}-`)) {
    return notFound();
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const variants: ProductVariant[] = product.variants ?? [];

  const flavors = [
    ...new Set(variants.map((v) => v.flavor).filter(Boolean)),
  ] as string[];

  const packages = [
    ...new Set(variants.map((v) => v.packageQuantity).filter(Boolean)),
  ] as number[];

  const initialVariant = variants[0] ?? null;

  return (
    <ClientProductView
      product={product}
      variants={variants}
      flavors={flavors}
      packages={packages}
      baseUrl={BASE_URL}
      initialVariant={initialVariant}
      isOutOfStock={variants.every((v) => v.stock === 0)} // ✅ مهم
    />
  );
}
