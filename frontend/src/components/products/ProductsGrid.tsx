"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCategoryStore } from "@/lib/stores/categoryStore";
import { useAuth } from "@/lib/hooks/useAuth"; // ✅ NEW
import { useDeleteProduct } from "@/lib/hooks/useDeleteProduct";
import { useCart } from "@/lib/hooks/useAddToCart";
import { useQuery } from "@tanstack/react-query";
import { AUTH_KEY } from "@/lib/constants/auth";
import type { Product } from "@/lib/types/product";
import type { CartItem } from "@/lib/types/cart";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockProduct } from "@/lib/hooks/useBlockProduct";
export default function ProductsGrid({ products }: { products: Product[] }) {
  const router = useRouter();
  const qc = useQueryClient();
  console.log("AUTH CACHE:", qc.getQueryData(["auth"]));
  const { data: user } = useQuery<User | null>({
    queryKey: AUTH_KEY,
  });

  const isManager = user?.role === "ADMIN";
  const { setSelectedCategory } = useCategoryStore();
  const { mutate: deleteProduct, isPending } = useDeleteProduct();

  const { cart, addItem, removeItem, updateItem, isAdding } = useCart();
  const cartItems: CartItem[] = cart?.items ?? [];

  const BASE_URL = "http://localhost:5000";
  const { mutate: blockProduct, isPending: isBlocking } = useBlockProduct();
  function Toggle({
    checked,
    disabled,
    onChange,
  }: {
    checked: boolean;
    disabled?: boolean;
    onChange: (next: boolean) => void;
  }) {
    return (
      <button
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
        className={`
        relative w-11 h-6 rounded-full transition-colors
        ${checked ? "bg-green-500" : "bg-orange-400"}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      >
        <span
          className={`
          absolute top-0.5
          w-5 h-5 bg-white rounded-full transition-transform
          ${checked ? "translate-x-5" : "translate-x-1"}
        `}
        />
      </button>
    );
  }
  return (
    <div
      className="
        grid grid-cols-2 lg:grid-cols-3
        gap-4 lg:gap-8
        w-full lg:w-[85%]
        mx-auto
        mt-4 lg:mt-8
        px-3 lg:px-0
      "
    >
      {products.map((p) => {
        const variants = p.variants ?? [];
        const availableVariants = variants.filter((v) => v.stock > 0);
        const displayVariant = availableVariants[0] ?? variants[0] ?? null;

        const isOutOfStock = availableVariants.length === 0;
        const category = p.category;

        const cartItem = displayVariant
          ? cartItems.find((i: CartItem) => i.variantId === displayVariant.id)
          : undefined;

        const count = cartItem?.quantity ?? 0;

        const price = Number(displayVariant?.price ?? 0);
        const discount = Number(displayVariant?.discountPrice ?? 0);
        const hasDiscount = discount > 0 && discount < price;
        const discountPercent = hasDiscount
          ? Math.round(((price - discount) / price) * 100)
          : null;
        const flavorCount = new Set(
          variants.map((v) => v.flavor).filter(Boolean)
        ).size;

        const packageCount = new Set(
          variants.map((v) => v.packageQuantity).filter(Boolean)
        ).size;

        const hasMultipleOptions = flavorCount > 1 || packageCount > 1;
        const imageSrc = !p.imageUrl
          ? "/no-image.png"
          : p.imageUrl.startsWith("http")
          ? p.imageUrl
          : `${BASE_URL}${
              p.imageUrl.startsWith("/") ? p.imageUrl : `/${p.imageUrl}`
            }`;

        return (
          <div
            key={p.id}
            onClick={() => {
              if (!isOutOfStock) {
                router.push(`/product/${p.slug}?id=${p.id}`);
              }
            }}
            className={`
              relative flex flex-col
              bg-white border border-[#CBCBCB]
              rounded-[14px] lg:rounded-[16px]
              p-3 lg:p-4
              h-auto lg:h-[480px]
              transition
              ${
                isOutOfStock
                  ? "opacity-50"
                  : "cursor-pointer lg:hover:shadow-md"
              }
            `}
          >
            {/* Discount */}
            {hasDiscount && (
              <div
                className="
                  absolute top-2 right-2
                  bg-[#E63946] text-white
                  text-[12px] lg:text-[18px] font-bold
                  px-2 py-1 lg:w-[50px] lg:h-[50px]
                  lg:flex lg:items-center lg:justify-center
                  rounded-full lg:rounded-bl-[80%]
                  z-10
                "
              >
                %{discountPercent}
              </div>
            )}

            {/* Image */}
            <div
              className="
                w-full aspect-square
                flex items-center justify-center
                bg-white
                border-b border-[#E5E5E5]
                rounded-t-[12px]
                p-2 lg:p-3
              "
            >
              <Image
                src={imageSrc}
                alt={p.name}
                width={200}
                height={200}
                className="object-contain"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between flex-1 w-full mt-3">
              <div dir="ltr" className="flex flex-col items-end gap-1">
                <h3
                  className="
    font-bold
    text-[14px] lg:text-[16px]
    whitespace-nowrap
    overflow-hidden
    text-ellipsis
    max-w-full
    text-right
  "
                >
                  {p.name}
                </h3>

                {category && (
                  <Link
                    href={`/categories/${category.slug}?id=${category.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory({
                        id: category.id,
                        name: category.name,
                      });
                    }}
                    className="text-[12px] lg:text-[14px] text-[#6E6E6E]"
                  >
                    {category.name}
                  </Link>
                )}
              </div>

              {/* Price */}
              <div className="flex justify-end items-center gap-2 mt-2">
                {/* Price */}

                {/* Multiple options badge */}
                {hasMultipleOptions && (
                  <div
                    className="
        px-2.5 py-1
        rounded-full
        border border-[#90E0EF]
        bg-[#E0F7FA]
        text-[#0077B6]
        text-[12px] lg:text-[13px]
        font-medium
        whitespace-nowrap
      "
                  >
                    {flavorCount > 1 && packageCount > 1
                      ? `+${flavorCount} طعم / +${packageCount} بسته‌بندی`
                      : flavorCount > 1
                      ? `+${flavorCount} نوع طعم`
                      : `+${packageCount} نوع بسته‌بندی`}
                  </div>
                )}
                <div className="flex flex-col items-end leading-none">
                  {hasDiscount && (
                    <span className="line-through text-red-500 text-[13px] lg:text-[14px]">
                      {price.toLocaleString("fa-IR")} تومان
                    </span>
                  )}

                  <span className="font-bold text-[16px] lg:text-[20px] whitespace-nowrap">
                    {(hasDiscount ? discount : price).toLocaleString("fa-IR")}{" "}
                    تومان
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex justify-center">
                {!isManager ? (
                  isOutOfStock || !displayVariant ? (
                    <button
                      disabled
                      className="w-full py-2 bg-gray-300 rounded-full text-[14px]"
                    >
                      ناموجود
                    </button>
                  ) : count === 0 ? (
                    <button
                      disabled={isAdding}
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem({
                          productId: p.id,
                          variantId: displayVariant.id,
                          quantity: 1,
                        });
                      }}
                      className="
                        bg-[#00B4D8] text-white
                        w-full py-2.5
                        rounded-full
                        text-[14px] font-medium
                      "
                    >
                      افزودن به سبد خرید
                    </button>
                  ) : (
                    <div className="flex gap-4 items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!cartItem) return;

                          if (count === 1) {
                            removeItem(cartItem.id);
                          } else {
                            updateItem({
                              itemId: cartItem.id,
                              quantity: count - 1,
                            });
                          }
                        }}
                        className="
                          bg-[#FF6B6B] text-white
                          w-10 h-10
                          rounded-full text-lg
                        "
                      >
                        {count === 1 ? "🗑" : "-"}
                      </button>

                      <span className="font-bold text-[16px]">{count}</span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem({
                            productId: p.id,
                            variantId: displayVariant.id,
                            quantity: 1,
                          });
                        }}
                        className="
                          bg-[#00B4D8] text-white
                          w-10 h-10
                          rounded-full text-lg
                        "
                      >
                        +
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex gap-2">
                    {/* Edit */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/manager/profile/edit-product/${p.id}`);
                      }}
                      className="
      px-3 py-1.5
      rounded-full
      text-[13px]
      border border-[#0077B6]
      text-[#0077B6]
      transition-all
      hover:bg-[#0077B6]
      hover:text-white
      hover:shadow
      active:scale-95
    "
                    >
                      ✏️ ویرایش
                    </button>
                    <Toggle
                      checked={!p.isBlock} // ✅ فعال = سبز
                      disabled={isBlocking}
                      onChange={(isActive) => {
                        blockProduct({
                          id: p.id,
                          isBlock: !isActive,
                        });
                      }}
                    />

                    <span className="text-[12px]">
                      {p.isBlock ? "مسدود" : "فعال"}
                    </span>

                    {/* Delete */}
                    <button
                      disabled={isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`حذف "${p.name}"؟`)) deleteProduct(p.id);
                      }}
                      className="
      px-3 py-1.5
      rounded-full
      text-[13px]
      border border-red-500
      text-red-500
      transition-all
      hover:bg-red-500
      hover:text-white
      hover:shadow
      active:scale-95
      disabled:opacity-50
      disabled:cursor-not-allowed
    "
                    >
                      🗑 حذف
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
