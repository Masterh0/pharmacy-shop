"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types/product";
import { useProducts } from "@/lib/hooks/useProduct";

export default function ProductsPage() {
  const { getAll, remove } = useProducts();
  const { data: products, isLoading, isError } = getAll;
  const { mutate: removeProduct, isPending } = remove;

  // 🌀 حالت‌های بارگذاری / خطا
  if (isLoading) return <p>در حال بارگذاری...</p>;
  if (isError) return <p>❌ خطایی در دریافت لیست محصولات رخ داده است.</p>;
  if (!products || products.length === 0) return <p>محصولی یافت نشد.</p>;

  // 🚫 فیلتر فقط محصولاتی که عکس دارند
  const filteredProducts = products.filter(
    (p: Product) => p.imageUrl && p.imageUrl.trim() !== ""
  );

  if (filteredProducts.length === 0)
    return <p>هیچ محصولی با تصویر یافت نشد.</p>;

  console.log("🧩 Products from query:", filteredProducts);

  return (
    <div
      dir="rtl"
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "1.8rem",
          fontWeight: 600,
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        لیست محصولات
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {filteredProducts.map((p: Product) => {
          const variant = p.variants?.[0];
          const imgUrl = `http://localhost:5000${
            p.imageUrl.startsWith("/") ? p.imageUrl : "/" + p.imageUrl
          }`;

          return (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s ease",
              }}
            >
              <Link
                href={`/products/${p.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{ textAlign: "center", padding: "1rem" }}>
                  <Image
                    src={imgUrl}
                    alt={p.name}
                    width={300}
                    height={200}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: ".75rem",
                    }}
                  />

                  <h2
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 500,
                      marginBottom: ".5rem",
                    }}
                  >
                    {p.name}
                  </h2>

                  <p
                    style={{
                      color: "#555",
                      fontSize: ".9rem",
                      minHeight: "2.5rem",
                      marginBottom: ".75rem",
                    }}
                  >
                    {p.description || "بدون توضیح"}
                  </p>

                  {variant ? (
                    <>
                      <p
                        style={{
                          color: "#2e7d32",
                          fontWeight: 600,
                          marginBottom: ".3rem",
                        }}
                      >
                        💰 قیمت:{" "}
                        {Number(variant.price).toLocaleString("fa-IR")} تومان
                      </p>
                      <p
                        style={{
                          color: variant.stock > 0 ? "#1976d2" : "#d32f2f",
                          fontWeight: 500,
                        }}
                      >
                        موجودی:{" "}
                        {variant.stock > 0 ? variant.stock : "ناموجود"}
                      </p>
                    </>
                  ) : (
                    <p style={{ color: "#999" }}>بدون واریانت</p>
                  )}
                </div>
              </Link>

              <div
                style={{
                  display: "flex",
                  gap: ".5rem",
                  borderTop: "1px solid #eee",
                  padding: "0.75rem",
                }}
              >
                <Link
                  href={`/products/edit/${p.id}`}
                  style={{
                    flex: 1,
                    padding: ".5rem",
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    textAlign: "center",
                    borderRadius: "6px",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  ✏ ویرایش
                </Link>

                <button
                  onClick={() => removeProduct(p.id)}
                  disabled={isPending}
                  style={{
                    flex: 1,
                    padding: ".5rem",
                    backgroundColor: "#d32f2f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 500,
                    cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.7 : 1,
                  }}
                >
                  🗑 حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
