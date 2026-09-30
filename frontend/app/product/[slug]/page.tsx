import { notFound } from "next/navigation";
import { productApi } from "@/lib/api/products";
import ClientProductView from "./ClientProductView";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: PageProps) {
  // استخراج id از slug
  const [idPart] = params.slug.split("-");
  const id = Number(idPart);

  if (!id || isNaN(id)) {
    return notFound();
  }

  // دریافت محصول
  const product = await productApi.getById(id);

  if (!product) {
    return notFound();
  }

  // جلوگیری از slug اشتباه
  if (!params.slug.startsWith(`${product.id}-`)) {
    return notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  return (
    <ClientProductView
      product={product}
      baseUrl={baseUrl}
    />
  );
}