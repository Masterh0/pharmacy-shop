"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCategoryStore } from "@/lib/stores/categoryStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDeleteProduct } from "@/lib/hooks/useDeleteProduct";
import { useRouter } from "next/navigation";

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
}

interface Product {
  id: number;
  name: string;
  category: Category;
  variants?: Variant[];
  imageUrl?: string;
}

export default function ProductsGrid({ products }: { products: Product[] }) {
  const { role } = useAuthStore();
  const isManager = role === "ADMIN";

  const BASE_URL = "http://localhost:5000";
  const [cartCount, setCartCount] = useState<{ [id: number]: number }>({});
  const { setSelectedCategory } = useCategoryStore();
  const { mutate: deleteProduct, isPending } = useDeleteProduct();
  const router = useRouter();

  const handleAdd = (id: number) => {
    setCartCount((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDeleteFromCart = (id: number) => {
    setCartCount((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
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

  const handleDeleteProduct = (name: string, id: number) => {
    if (confirm(`آیا مطمئن هستی می‌خوای "${name}" رو حذف کنی؟`)) {
      deleteProduct(id);
    }
  };

  const EditButton = (id: number) => {
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

        // ✅ منطق تشخیص چند طعم بودن محصول
        const flavors = Array.from(
          new Set(p.variants?.map((v) => v.flavor).filter(Boolean))
        );
        const flavorCount = flavors.length;

        const imageSrc = !p.imageUrl
          ? "/no-image.png"
          : p.imageUrl.startsWith("http")
            ? p.imageUrl
            : `${BASE_URL}${p.imageUrl.startsWith("/") ? p.imageUrl : `/${p.imageUrl}`}`;

        const count = cartCount[p.id] || 0;

        return (
          <div
            key={p.id}
            className="relative flex flex-col justify-between items-center 
                       bg-white border border-[#CBCBCB] rounded-[16px] p-4 
                       h-[480px] min-h-[480px] shadow-sm hover:shadow-md 
                       transition-all duration-200"
          >
            {/* 🏷️ درصد تخفیف */}
            {hasDiscount && (
              <div
                className="absolute z-20 top-0 right-0 w-[50px] h-[50px] bg-[#E63946] 
                           text-white font-bold flex items-center justify-center 
                           rounded-bl-[80%] shadow-md text-[20px]"
              >
                %{discountPercent}
              </div>
            )}

            {/* 🧃 تعداد طعم‌ها */}
            {flavorCount > 1 && (
              <div
    className="absolute z-20 bottom-24 right-0 h-[30px] bg-[#E63946]/90 
               text-white font-medium flex items-center justify-center 
               px-2   shadow-md text-[12px] whitespace-nowrap"
  >
    +{flavorCount} طعم
  </div>
            )}

            {/* 📸 تصویر */}
            <div className="w-[256px] h-[256px] flex items-center justify-center p-1 relative shrink-0 border-b-2 border-black">
              <Image
                src={imageSrc}
                alt={p.name}
                width={200}
                height={200}
                className="object-contain rounded-md transition-transform duration-300 hover:scale-[1.03]"
              />
            </div>

            {/* نام و قیمت */}
            <div className="flex flex-col w-full h-full mt-4  text-right justify-between">
              <div dir="ltr" className="flex flex-col items-end gap-1">
                <h3
                  className="text-[#000000] font-bold text-[16px]  leading-[25px] max-w-[256px]"
                  style={{ wordBreak: "break-word" }}
                >
                  {p.name}
                </h3>
                {p.category?.name && (
                  <Link
                    href={`/categories/${p.category.slug}?id=${p.category.id}`}
                    onClick={() =>
                      setSelectedCategory({
                        id: p.category.id,
                        name: p.category.name,
                      })
                    }
                    className="text-[#6E6E6E] text-[14px] opacity-75 hover:text-[#0077B6] transition"
                  >
                    {p.category.name}
                  </Link>
                )}
              </div>

              {/* 💰 قیمت */}
              <div className="flex flex-col items-end mt-2 grow">
                {!hasDiscount ? (
                  <span className="text-[#000000] font-bold text-[20px]" dir="rtl">
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

              {/* ✏️🗑 دکمه‌ها */}
              <div className="mt-3 flex items-center justify-center w-full gap-3">
                {!isManager ? (
                  <>
                    {count === 0 ? (
                      <button
                        className="bg-[#00B4D8] text-white text-[16px] w-[80%] py-2 rounded-full hover:bg-[#0077B6] transition"
                        onClick={() => handleAdd(p.id)}
                      >
                        افزودن به سبد خرید
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-3 w-[80%]">
                        {/* حذف یا کم کردن */}
                        <button
                          onClick={() => {
                            if (count === 1) handleDeleteFromCart(p.id);
                            else handleRemoveOne(p.id);
                          }}
                          className="bg-[#FF6B6B] text-white w-8 h-8 rounded-full text-[18px] flex items-center justify-center hover:bg-red-600 transition"
                        >
                          {count === 1 ? "🗑" : "-"}
                        </button>

                        {/* عدد شمارنده */}
                        <span className="text-[18px] font-bold w-8 text-center">
                          {count}
                        </span>

                        {/* افزودن */}
                        <button
                          onClick={() => handleAdd(p.id)}
                          className="bg-[#00B4D8] text-white w-8 h-8 rounded-full text-[18px] flex items-center justify-center hover:bg-[#0077B6] transition"
                        >
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-center gap-3 w-full">
                    <button
                      onClick={() => EditButton(p.id)}
                      className="px-4 py-2 border border-[#0077B6] text-[#0077B6] text-[14px] rounded-full hover:bg-[#0077B6] hover:text-white transition"
                    >
                      ✏️ ویرایش
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.name, p.id)}
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
