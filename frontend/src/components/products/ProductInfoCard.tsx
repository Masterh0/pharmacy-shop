"use client";

import { useState } from "react";
import Image from "next/image";
import ProductEditModal from "./ProductEditModal";
import type { Product } from "@/lib/types/product";

export default function ProductInfoCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  const imgUrl = product.imageUrl
    ? `${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`
    : "/no-image.png";

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "1rem",
        marginBottom: "2rem",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <Image
          src={imgUrl}
          alt={product.name}
          width={200}
          height={150}
          style={{ objectFit: "cover", borderRadius: "8px" }}
        />
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>{product.name}</h2>
          <p style={{ color: "#555" }}>{product.description || "بدون توضیح"}</p>
          <p>برند: {product.brand?.name}</p>
          <p>دسته: {product.category?.name}</p>
          <p>وضعیت: {product.isBlock ? "⛔️ غیرفعال" : "✅ فعال"}</p>
        </div>
      </div>

      <button
        onClick={() => setOpen(true)}
        style={{
          marginTop: "1rem",
          backgroundColor: "#1976d2",
          color: "#fff",
          padding: ".5rem 1rem",
          borderRadius: "6px",
          border: "none",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        ✏ ویرایش اطلاعات محصول
      </button>

      {/* Modal برای ویرایش */}
      <ProductEditModal open={open} onClose={() => setOpen(false)} product={product} />
    </div>
  );
}
