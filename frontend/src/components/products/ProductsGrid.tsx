"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // useState اضافه شد
import { toast } from "sonner";
// Hooks & Stores
import { useCategoryStore } from "@/lib/stores/categoryStore";
import { useAuth } from "@/lib/context/AuthContext";
import { useDeleteProduct } from "@/lib/hooks/useDeleteProduct";
import { useCart } from "@/lib/hooks/useAddToCart";
import { useBlockProduct } from "@/lib/hooks/useBlockProduct";

// Types
import type { Product } from "@/lib/types/product";
import type { CartItem } from "@/lib/types/cart";

// --- 1. کامپوننت Toggle (بدون تغییر) ---
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
        relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
        ${checked ? "bg-green-500" : "bg-orange-400"}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <span
        className={`
          absolute top-0.5
          w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm
          ${checked ? "translate-x-5" : "translate-x-1"}
        `}
      />
    </button>
  );
}

// --- 2. کامپوننت جدید: مدیریت وضعیت بلاک (برای حل مشکل تأخیر) ---
function ProductStatusToggle({ product }: { product: Product }) {
  const { mutate: blockProduct } = useBlockProduct();

  // نگهداری وضعیت فعلی برای نمایش
  const [isActive, setIsActive] = useState(!product.isBlock);

  // هماهنگی با دیتابیس (اگر محصول از جای دیگر آپدیت شد)
  useEffect(() => {
    setIsActive(!product.isBlock);
  }, [product.isBlock]);

  const handleToggle = (nextCheckedState: boolean) => {
    // 1. ذخیره وضعیت قبلی (برای روز مبادا)
    const previousState = isActive;

    // 2. تغییر فوری ظاهر (Optimistic Update)
    setIsActive(nextCheckedState);

    // 3. ارسال درخواست به سرور
    blockProduct(
      {
        id: product.id,
        isBlock: !nextCheckedState, // اگر فعال است، یعنی isBlock باید false شود
      },
      {
        // ✅ اینجا نکته اصلی است: مدیریت خطا
        onError: (error) => {
          console.error("خطا در تغییر وضعیت محصول:", error);

          // 4. بازگشت به حالت قبل (Rollback)
          setIsActive(previousState);

          // 5. اطلاع به کاربر
          toast.error("خطا در برقراری ارتباط. تغییرات اعمال نشد.");
        },
        // (اختیاری) اگر موفق بود می‌توانیم پیام موفقیت ندهیم تا مزاحم کاربر نشویم،
        // چون تغییر ظاهری قبلاً انجام شده است.
      }
    );
  };

  return (
    <div
      className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full border cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className={`text-[10px] w-8 text-center transition-colors duration-200 ${
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

// --- 3. کامپوننت اصلی ---
export default function ProductsGrid({ products }: { products: Product[] }) {
  const router = useRouter();
  const BASE_URL = "http://localhost:5000";

  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const { setSelectedCategory } = useCategoryStore();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { cart, addItem, removeItem, updateItem, isAdding } = useCart();

  const cartItems: CartItem[] = cart?.items ?? [];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 w-full lg:w-[85%] mx-auto mt-4 lg:mt-8 px-3 lg:px-0">
      {products.map((p) => {
        // --- محاسبات محصول ---
        const variants = p.variants ?? [];
        const availableVariants = variants.filter((v) => v.stock > 0);
        const displayVariant = availableVariants[0] ?? variants[0] ?? null;
        const isOutOfStock = availableVariants.length === 0;

        // آیتم سبد خرید
        const cartItem = displayVariant
          ? cartItems.find((i: CartItem) => i.variantId === displayVariant.id)
          : undefined;
        const count = cartItem?.quantity ?? 0;

        // قیمت
        const price = Number(displayVariant?.price ?? 0);
        const discount = Number(displayVariant?.discountPrice ?? 0);
        const hasDiscount = discount > 0 && discount < price;
        const discountPercent = hasDiscount
          ? Math.round(((price - discount) / price) * 100)
          : null;

        // آپشن‌ها
        const flavorCount = new Set(
          variants.map((v) => v.flavor).filter(Boolean)
        ).size;
        const packageCount = new Set(
          variants.map((v) => v.packageQuantity).filter(Boolean)
        ).size;
        const hasMultipleOptions = flavorCount > 1 || packageCount > 1;

        // تصویر
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
              if (!isOutOfStock || isAdmin) {
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
                isOutOfStock && !isAdmin
                  ? "opacity-60"
                  : "cursor-pointer lg:hover:shadow-md"
              }
            `}
          >
            {/* تخفیف */}
            {hasDiscount && (
              <div className="absolute top-2 right-2 bg-[#E63946] text-white text-[12px] lg:text-[18px] font-bold px-2 py-1 lg:w-[50px] lg:h-[50px] lg:flex lg:items-center lg:justify-center rounded-full lg:rounded-bl-[80%] z-10">
                %{discountPercent}
              </div>
            )}

            {/* تصویر */}
            <div className="w-full aspect-square flex items-center justify-center bg-white border-b border-[#E5E5E5] rounded-t-[12px] p-2 lg:p-3 relative">
              <Image
                src={imageSrc}
                alt={p.name}
                width={200}
                height={200}
                className={`object-contain transition-all duration-300 ${
                  p.isBlock ? "grayscale opacity-50" : ""
                }`}
              />
              {p.isBlock && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="bg-red-600/90 text-white px-3 py-1 rounded text-sm font-bold shadow-lg">
                    توقف فروش
                  </span>
                </div>
              )}
            </div>

            {/* اطلاعات */}
            <div className="flex flex-col justify-between flex-1 w-full mt-3">
              <div dir="ltr" className="flex flex-col items-end gap-1">
                <h3 className="font-bold text-[14px] lg:text-[16px] whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-right">
                  {p.name}
                </h3>
                {p.category && (
                  <Link
                    href={`/categories/${p.category.slug}?id=${p.category.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory({
                        id: p.category.id,
                        name: p.category.name,
                      });
                    }}
                    className="text-[12px] lg:text-[14px] text-[#6E6E6E] hover:text-[#00B4D8]"
                  >
                    {p.category.name}
                  </Link>
                )}
              </div>

              {/* قیمت و بج‌ها */}
              <div className="flex justify-end items-center gap-2 mt-2">
                {hasMultipleOptions && (
                  <div className="px-2.5 py-1 rounded-full border border-[#90E0EF] bg-[#E0F7FA] text-[#0077B6] text-[10px] lg:text-[12px] font-medium whitespace-nowrap">
                    {flavorCount > 1 && packageCount > 1
                      ? `+${flavorCount} طعم / +${packageCount} بسته`
                      : flavorCount > 1
                      ? `+${flavorCount} طعم`
                      : `+${packageCount} بسته‌بندی`}
                  </div>
                )}

                <div className="flex flex-col items-end leading-none">
                  {hasDiscount && (
                    <span className="line-through text-red-500 text-[11px] lg:text-[13px]">
                      {price.toLocaleString("fa-IR")}
                    </span>
                  )}
                  <span className="font-bold text-[16px] lg:text-[20px] whitespace-nowrap">
                    {(hasDiscount ? discount : price).toLocaleString("fa-IR")}{" "}
                    <span className="text-[12px] font-normal text-gray-500">
                      تومان
                    </span>
                  </span>
                </div>
              </div>

              {/* دکمه‌های عملیات */}
              <div className="mt-4 flex justify-center w-full min-h-[44px]">
                {/* 🔴 اگر ادمین است 🔴 */}
                {isAdmin ? (
                  <div className="flex items-center justify-between w-full gap-2 px-1">
                    {/* ویرایش */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/manager/profile/edit-product/${p.id}`);
                      }}
                      className="text-[18px] hover:scale-110 transition p-1"
                      title="ویرایش محصول"
                    >
                      ✏️
                    </button>

                    {/* ✅ کامپوننت جدید وضعیت با قابلیت تغییر فوری */}
                    <ProductStatusToggle product={p} />

                    {/* حذف */}
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
                      className="text-[18px] hover:scale-110 transition p-1 disabled:opacity-30 text-red-500"
                      title="حذف محصول"
                    >
                      🗑️
                    </button>
                  </div>
                ) : (
                  /* 🔵 اگر مشتری است 🔵 */
                  <>
                    {isOutOfStock || !displayVariant ? (
                      <button
                        disabled
                        className="w-full py-2 bg-gray-200 text-gray-500 rounded-full text-[14px] cursor-not-allowed"
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
                        className="bg-[#00B4D8] hover:bg-[#0096C7] text-white w-full py-2.5 rounded-full text-[14px] font-medium transition-colors"
                      >
                        {isAdding ? "..." : "افزودن به سبد"}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-white border border-[#00B4D8] rounded-full w-full px-1 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!cartItem) return;
                            count === 1
                              ? removeItem(cartItem.id)
                              : updateItem({
                                  itemId: cartItem.id,
                                  quantity: count - 1,
                                });
                          }}
                          className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white w-8 h-8 flex items-center justify-center rounded-full text-lg transition"
                        >
                          {count === 1 ? "🗑" : "-"}
                        </button>

                        <span className="font-bold text-[16px] text-[#00B4D8]">
                          {count}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({
                              productId: p.id,
                              variantId: displayVariant.id,
                              quantity: 1,
                            });
                          }}
                          className="bg-[#00B4D8] hover:bg-[#0096C7] text-white w-8 h-8 flex items-center justify-center rounded-full text-lg transition"
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
