import { notFound } from "next/navigation";
import { productApi } from "@/lib/api/products";
import ClientProductView from "./ClientProductView";

export default async function ProductPage({ params, searchParams }) {
  const id = Number(searchParams.id);
  const product = await productApi.getById(id);
  if (!product) return notFound();

  const BASE_URL = "http://localhost:5000";
  const variants = product.variants || [];

  const flavors = [...new Set(variants.map(v => v.flavor).filter(Boolean))];
  const packages = [...new Set(variants.map(v => v.packageQuantity).filter(Boolean))];
  const initialVariant = variants[0];

  return (
    <ClientProductView
      product={product}
      variants={variants}
      flavors={flavors}
      packages={packages}
      baseUrl={BASE_URL}
      initialVariant={initialVariant}
    />
  );
}
