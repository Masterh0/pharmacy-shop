"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCategoryStore } from "@/lib/stores/categoryStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDeleteProduct } from "@/lib/hooks/useDeleteProduct";

type Category = {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
};

interface Variant {
  id: number;
  price: number | string;
  discountPrice?: number | string;
  flavor?: string | null;
  packageQuantity: number;
}

interface Product {
  id: number;
  name: string;
  category: Category;
  variants?: Variant[];
  imageUrl?: string;
  slug: string;
}

export default function ProductsGrid({ products }: { products: Product[] }) {
  const router = useRouter();
  const { role } = useAuthStore();
  const { setSelectedCategory } = useCategoryStore();
  const { mutate: deleteProduct, isPending } = useDeleteProduct();

  const BASE_URL = "http://localhost:5000";
  const isManager = role === "ADMIN";

  const [cartCount, setCartCount] = useState<{ [id: number]: number }>({});

  const handleAdd = (id: number) => {
    setCartCount((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemoveOne = (id: number) => {
    setCartCount((prev) => {
      const c = (prev[id] || 0) - 1;
      if (c <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: c };
    });
  };

  const handleDeleteFromCart = (id: number) => {
    setCartCount((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleDeleteProduct = (name: string, id: number) => {
    if (confirm(`آیا مطمئن هستی می‌خوای "${name}" رو حذف کنی؟`)) {
      deleteProduct(id);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/manager/profile/edit-product/${id}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-[85%] mx-auto mt-8">
      {products.map((p) => {
        const variant = p.variants?.[0];
        const price = Number(variant?.price ?? 0);
        const discount = Number(variant?.discountPrice ?? 0);
        const hasDiscount = discount > 0 && discount < price;
        const discountPercent = hasDiscount
          ? Math.round(((price - discount) / price) * 100)
          : null;

        const flavors = Array.from(
          new Set(p.variants?.map((v) => v.flavor).filter(Boolean))
        );
        const packageQuantities = Array.from(
          new Set(p.variants?.map((v) => v.packageQuantity).filter(Boolean))
        );
        const flavorCount = flavors.length;
        const packageCount = packageQuantities.length;

        const imageSrc = !p.imageUrl
          ? "/no-image.png"
          : p.imageUrl.startsWith("http")
          ? p.imageUrl
          : `${BASE_URL}${
              p.imageUrl.startsWith("/") ? p.imageUrl : `/${p.imageUrl}`
            }`;
        const count = cartCount[p.id] || 0;

        return (
          <div
            key={p.id}
            onClick={() => router.push(`/product/${p.slug}?id=${p.id}`)}
            className="relative flex flex-col justify-between items-center 
                       bg-white border border-[#CBCBCB] rounded-[16px] p-4 
                       h-[480px] shadow-sm hover:shadow-md transition-all 
                       duration-200 cursor-pointer"
          >
            {hasDiscount && (
              <div
                className="absolute top-0 right-0 w-[50px] h-[50px] bg-[#E63946] 
                           text-white font-bold flex items-center justify-center 
                           rounded-bl-[80%] shadow-md text-[20px]"
              >
                %{discountPercent}
              </div>
            )}

            {/* تصویر محصول */}
            <div className="w-[256px] h-[256px] flex items-center justify-center p-1 border-b-2 border-black">
              <Image
                src={imageSrc}
                alt={p.name}
                width={200}
                height={200}
                className="object-contain rounded-md transition-transform duration-300 hover:scale-[1.03]"
              />
            </div>

            {/* اطلاعات محصول */}
            <div className="flex flex-col w-full mt-4 text-right justify-between">
              <div dir="ltr" className="flex flex-col items-end gap-1">
                <h3
                  className="text-[#000000] font-bold text-[16px] leading-[25px] max-w-[256px]"
                  style={{
                    wordBreak: "break-word",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 1,
                    overflow: "hidden",
                  }}
                >
                  {p.name}
                </h3>
                {p.category?.name && (
                  <Link
                    href={`/categories/${p.category.slug}?id=${p.category.id}`}
                    onClick={(e) => {
                      e.stopPropagation(); // جلوگیری از ناوبری کارت
                      setSelectedCategory({
                        id: p.category.id,
                        name: p.category.name,
                      });
                    }}
                    className="text-[#6E6E6E] text-[14px] opacity-75 hover:text-[#0077B6] transition"
                  >
                    {p.category.name}
                  </Link>
                )}
              </div>

              {/* قیمت و برچسب‌ها */}
              <div
                className={`flex items-center mt-2 gap-2 w-full ${
                  flavorCount > 1 || packageCount > 1
                    ? "justify-between"
                    : "justify-end"
                }`}
              >
                {flavorCount > 1 && (
                  <div className="bg-[#00B4D8]/90 text-white font-medium px-2 py-[2px] rounded-md shadow-md text-[12px] whitespace-nowrap">
                    +{flavorCount} طعم
                  </div>
                )}
                {packageCount > 1 && (
                  <div className="bg-[#00B4D8]/90 text-white font-medium px-2 py-[2px] rounded-md shadow-md text-[12px] whitespace-nowrap">
                    +{packageCount} نوع بسته
                  </div>
                )}

                {!hasDiscount ? (
                  <span
                    className="text-[#000000] font-bold text-[20px]"
                    dir="rtl"
                  >
                    {price ? `${price.toLocaleString("fa-IR")} تومان` : "—"}
                  </span>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-red-500 line-through text-[16px]">
                      {price.toLocaleString("fa-IR")} تومان
                    </span>
                    <span className="text-[#000000] font-bold text-[20px]">
                      {discount.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                )}
              </div>

              {/* دکمه‌ها */}
              <div className="mt-3 flex items-center justify-center w-full gap-3">
                {!isManager ? (
                  count === 0 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // جلوگیری از رفتن به صفحه محصول
                        handleAdd(p.id);
                      }}
                      className="bg-[#00B4D8] text-white w-[80%] py-2 rounded-full text-[16px] hover:bg-[#0077B6] transition"
                    >
                      افزودن به سبد خرید
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-3 w-[80%]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (count === 1) handleDeleteFromCart(p.id);
                          else handleRemoveOne(p.id);
                        }}
                        className="bg-[#FF6B6B] text-white w-8 h-8 rounded-full text-[18px] flex items-center justify-center hover:bg-red-600 transition"
                      >
                        {count === 1 ? "🗑" : "-"}
                      </button>

                      <span className="text-[18px] font-bold w-8 text-center">
                        {count}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(p.id);
                        }}
                        className="bg-[#00B4D8] text-white w-8 h-8 rounded-full text-[18px] flex items-center justify-center hover:bg-[#0077B6] transition"
                      >
                        +
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex justify-center gap-3 w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(p.id);
                      }}
                      className="px-4 py-2 border border-[#0077B6] text-[#0077B6] text-[14px] rounded-full hover:bg-[#0077B6] hover:text-white transition"
                    >
                      ✏️ ویرایش
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(p.name, p.id);
                      }}
                      disabled={isPending}
                      className="px-4 py-2 border border-red-500 text-red-500 text-[14px] rounded-full hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                    >
                      {isPending ? "در حال حذف..." : "🗑 حذف"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
