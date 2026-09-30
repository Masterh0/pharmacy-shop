"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Hooks & Stores
import { useAuth } from "@/lib/context/AuthContext";
import { useDeleteProduct } from "@/lib/hooks/useDeleteProduct";
import { useCart } from "@/lib/hooks/useAddToCart";
import { useBlockProduct } from "@/lib/hooks/useBlockProduct";

// Types
import type { Product } from "@/lib/types/product";
import type { CartItem } from "@/lib/types/cart";

import WishlistButton from "@/src/components/WishlistButton";

// --- Toggle Component ---
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
        if (!disabled) onChange(!checked);
      }}
      className={`
        relative w-9 h-5 lg:w-11 lg:h-6 rounded-full transition-colors duration-200 ease-in-out
        ${checked ? "bg-green-500" : "bg-orange-400"}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <span
        className={`
          absolute top-[2px]
          w-4 h-4 lg:w-5 lg:h-5 bg-white rounded-full transition-transform duration-200 shadow-sm
          ${checked ? "translate-x-[18px] lg:translate-x-5" : "translate-x-1"}
        `}
      />
    </button>
  );
}

// --- ProductStatusToggle Component ---
function ProductStatusToggle({ product }: { product: Product }) {
  const { mutate: blockProduct } = useBlockProduct();
  const [isActive, setIsActive] = useState(!product.isBlock);

  useEffect(() => {
    setIsActive(!product.isBlock);
  }, [product.isBlock]);

  const handleToggle = (nextCheckedState: boolean) => {
    const previousState = isActive;
    setIsActive(nextCheckedState);

    blockProduct(
      {
        id: product.id,
        isBlock: !nextCheckedState,
      },
      {
        onError: (error) => {
          console.error("خطا در تغییر وضعیت محصول:", error);
          setIsActive(previousState);
          toast.error("خطا در برقراری ارتباط. تغییرات اعمال نشد.");
        },
      },
    );
  };

  return (
    <div
      className="flex items-center gap-1 bg-gray-50 px-1.5 py-1 rounded-full border cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className={`text-[9px] lg:text-[10px] w-6 lg:w-8 text-center transition-colors duration-200 ${
          isActive
            ? "text-green-600 font-medium"
            : "text-orange-500 font-medium"
        }`}
      >
        {isActive ? "فعال" : "مسدود"}
      </span>
      <Toggle checked={isActive} onChange={handleToggle} />
    </div>
  );
}

// --- Main ProductsGrid Component ---
export default function ProductsGrid({ products }: { products: Product[] }) {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { cart, addItem, removeItem, updateItem, isAdding } = useCart();

  const cartItems: CartItem[] = cart?.items ?? [];
  const cartItemsMap = new Map(cartItems.map((item) => [item.variantId, item]));
  return (
    // تغییر در گرید: استفاده از gap-2 برای موبایل تا کارت‌ها جا شوند
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-6 w-full lg:w-[85%] mx-auto mt-4 lg:mt-8 px-2 lg:px-0">
      {products.map((p, index) => {
        const variants = p.variants ?? [];
        const availableVariants = variants.filter((v) => v.stock > 0);
        const isOutOfStock = availableVariants.length === 0;
        const needsSelection = p.requiresSelection;
        const defaultVariant = !needsSelection ? p.displayVariant : null;

        const cartItem = defaultVariant
          ? cartItemsMap.get(defaultVariant.id)
          : undefined;
        const count = cartItem?.quantity ?? 0;

        const displayPrice = Number(p.displayPrice);
        const displayDiscountPrice = p.displayDiscountPrice;
        const discountPercent = p.discountPercent;
        const hasDiscount = displayDiscountPrice != null && discountPercent > 0;
        const optionsSummary = p.attributesSummary;

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
              router.push(`/product/${p.id}-${p.slug}`);
            }}
            className={`
              relative flex flex-col min-w-0
              bg-white border border-[#CBCBCB]
              rounded-[12px] lg:rounded-[16px]
              p-2 lg:p-4
              h-auto lg:h-[480px]
              transition
              ${
                isOutOfStock && !isAdmin
                  ? "cursor-pointer opacity-60"
                  : "cursor-pointer lg:hover:shadow-md"
              }
            `}
          >
            {/* دکمه لایک */}
            <div className="absolute top-1 left-1 lg:top-2 lg:left-2 z-20  ">
              <WishlistButton productId={p.id} />
            </div>

            {/* تخفیف: طراحی بجای روبان بزرگ، تبدیل به بج کوچک و جمع‌وجور شد تا بیرون نزند */}
            {hasDiscount && (
              <div className="absolute top-2 right-2 z-20 bg-red-500 text-white px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-md text-[10px] lg:text-xs font-bold shadow-sm">
                ٪{discountPercent}
              </div>
            )}

            {/* تصویر */}
            <div className="w-full aspect-square flex items-center justify-center bg-white border-b border-[#E5E5E5] rounded-t-[12px] p-2 relative">
              <Image
                src={imageSrc}
                alt={p.name}
                priority={index < 4}
                fill
                className={`object-contain p-2 transition-all duration-300 ${
                  p.isBlock ? "grayscale opacity-50" : ""
                }`}
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {p.isBlock && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="bg-red-600/90 text-white px-2 py-1 rounded text-[10px] lg:text-sm font-bold shadow-lg">
                    توقف فروش
                  </span>
                </div>
              )}
            </div>

            {/* اطلاعات محصول */}
            {/* اطلاعات محصول */}
            <div className="flex flex-col flex-1 w-full mt-2 min-w-0">
              <div
                dir="rtl"
                className="flex flex-col items-start gap-1 w-full text-right"
              >
                <h3 className="font-bold text-[11px] sm:text-[13px] lg:text-[16px] line-clamp-2 w-full">
                  {p.name}
                </h3>

                {p.brand && (
                  <Link
                    href={`/brands/${p.brand.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9px] lg:text-[14px] text-[#6E6E6E] hover:text-[#00B4D8]"
                  >
                    {p.brand.name}
                  </Link>
                )}

                {/* انتقال ویژگی‌ها به زیر برند با قابلیت نمایش کامل */}
                {optionsSummary && (
                  <div className="mt-1 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-md border border-[#90E0EF] bg-[#E0F7FA] text-[#0077B6] text-[9px] lg:text-[11px] font-medium whitespace-normal text-right">
                    {optionsSummary}
                  </div>
                )}
              </div>

              {/* فاصله انداز برای چسبیدن قیمت و دکمه‌ها به پایین */}
              <div className="flex-1"></div>

              {/* قیمت (ویژگی‌ها از اینجا حذف شد و فقط قیمت ماند) */}
              <div className="flex justify-end items-end gap-1 mt-2 min-h-[36px]">
                <div className="flex flex-col items-end leading-none min-w-0">
                  {hasDiscount && (
                    <span className="line-through text-red-500 text-[10px] lg:text-[13px]">
                      {displayPrice.toLocaleString("fa-IR")}
                    </span>
                  )}
                  <span className="font-bold text-[13px] sm:text-[15px] lg:text-[20px] truncate">
                    {(hasDiscount
                      ? displayDiscountPrice!
                      : displayPrice
                    ).toLocaleString("fa-IR")}{" "}
                    <span className="text-[9px] lg:text-[12px] font-normal text-gray-500 shrink-0">
                      تومان
                    </span>
                  </span>
                </div>
              </div>

              {/* دکمه‌های عملیات */}
              <div className="mt-3 flex justify-center w-full h-8 sm:h-9 lg:h-11">
                {isAdmin ? (
                  <div className="flex items-center justify-between w-full gap-1 px-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/manager/profile/edit-product/${p.id}`);
                      }}
                      className="text-[14px] lg:text-[18px] p-1"
                    >
                      ✏️
                    </button>
                    <ProductStatusToggle product={p} />
                    <button
                      disabled={isDeleting}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(`آیا از حذف محصول "${p.name}" اطمینان دارید؟`)
                        ) {
                          deleteProduct(p.id);
                        }
                      }}
                      className="text-[14px] lg:text-[18px] p-1 disabled:opacity-30 text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                ) : (
                  <>
                    {needsSelection ? (
                      availableVariants.length === 0 ? (
                        <button
                          disabled
                          className="w-full h-full bg-gray-200 text-gray-500 rounded-full text-[11px] lg:text-[14px]"
                        >
                          ناموجود
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/product/${p.id}-${p.slug}`);
                          }}
                          className="bg-[#00B4D8] hover:bg-[#0096C7] text-white w-full h-full rounded-full text-[11px] lg:text-[14px] font-medium"
                        >
                          انتخاب گزینه‌ها
                        </button>
                      )
                    ) : isOutOfStock ? (
                      <button
                        disabled
                        className="w-full h-full bg-gray-200 text-gray-500 rounded-full text-[11px] lg:text-[14px]"
                      >
                        ناموجود
                      </button>
                    ) : count === 0 ? (
                      <button
                        disabled={isAdding || !defaultVariant}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            !defaultVariant ||
                            count >= defaultVariant.stock
                          ) {
                            toast.error("موجودی کافی نیست");
                            return;
                          }
                          addItem({
                            productId: p.id,
                            variantId: defaultVariant.id,
                            quantity: 1,
                            priceAtAdd: hasDiscount
                              ? displayDiscountPrice!
                              : displayPrice,
                            product: { name: p.name, brand: p.brand },
                            variant: {
                              attributes: defaultVariant.attributes ?? [],
                            },
                          });
                        }}
                        className="bg-[#00B4D8] hover:bg-[#0096C7] text-white w-full h-full rounded-full text-[11px] lg:text-[14px] font-medium"
                      >
                        {isAdding ? "..." : "افزودن به سبد"}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-white border border-[#00B4D8] rounded-full w-full px-1 py-1 h-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!cartItem) return;
                            count === 1
                              ? removeItem({ itemId: cartItem.id })
                              : updateItem({
                                  itemId: cartItem.id,
                                  quantity: count - 1,
                                });
                          }}
                          className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center rounded-full text-sm lg:text-lg"
                        >
                          {count === 1 ? "🗑" : "-"}
                        </button>

                        <span className="font-bold text-[12px] lg:text-[16px] text-[#00B4D8]">
                          {count}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              !defaultVariant ||
                              count >= defaultVariant.stock
                            ) {
                              toast.error("موجودی کافی نیست");
                              return;
                            }
                            addItem({
                              productId: p.id,
                              variantId: defaultVariant.id,
                              quantity: 1,
                              priceAtAdd: hasDiscount
                                ? displayDiscountPrice!
                                : displayPrice,
                              product: { name: p.name, brand: p.brand },
                              variant: {
                                attributes: defaultVariant.attributes ?? [],
                              },
                            });
                          }}
                          className="bg-[#00B4D8] hover:bg-[#0096C7] text-white w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center rounded-full text-sm lg:text-lg"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
