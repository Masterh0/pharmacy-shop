// app/customer/wishlist/page.tsx

"use client";

import { useWishlist } from "@/lib/hooks/useWishlist";
import { useCart } from "@/lib/hooks/useAddToCart";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { IoMdHeart, IoMdHeartEmpty, IoMdTrash } from "react-icons/io";
import { HiTrash, HiMinus, HiPlus } from "react-icons/hi";
import { FiShoppingCart } from "react-icons/fi";
import { useState } from "react";
import { toast } from "sonner";
import type { CartItem } from "@/lib/types/cart";

export default function WishlistPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const router = useRouter();

  const { wishlist, isLoading, removeFromWishlist, clearWishlist, count: wishlistCount } = useWishlist();
  const { cart, addItem, removeItem, updateItem, isAdding } = useCart();

  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const cartItems: CartItem[] = cart?.items ?? [];

  // ✅ هندلر حذف تکی از لیست علاقه‌مندی‌ها
  const handleRemoveFromWishlist = async (e: React.MouseEvent, productId: number, productName: string) => {
    e.stopPropagation(); // جلوگیری از کلیک روی کارت
    setRemovingIds((prev) => new Set(prev).add(productId));

    try {
      await removeFromWishlist(productId);
      toast.success(`${productName} حذف شد`);
    } catch (error) {
      toast.error("خطا در حذف محصول");
    } finally {
      setRemovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-[#00B4D8]"></div>
        <p className="text-gray-500 text-sm font-medium animate-pulse">در حال دریافت لیست...</p>
      </div>
    );
  }

  // ✅ Empty State
  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4 animate-fadeIn">
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <IoMdHeartEmpty size={100} className="text-gray-300 relative z-10" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            لیست علاقه‌مندی‌ها خالی است
          </h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
            شما هنوز محصولی را لایک نکرده‌اید. برای دسترسی سریع‌تر، محصولات محبوب خود را اضافه کنید.
          </p>
        </div>

        <Link
          href="/"
          className="bg-[#00B4D8] hover:bg-[#0096C7] text-white px-10 py-3 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1 font-medium text-lg flex items-center gap-2"
        >
          مشاهده فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[95%] mx-auto px-4 py-8" dir="rtl">
      
      {/* 📊 Header Modern */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-red-50 p-3.5 rounded-2xl">
            <IoMdHeart size={28} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              علاقه‌مندی‌ها
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {wishlistCount} محصول ذخیره شده
            </p>
          </div>
        </div>

        {wishlistCount > 0 && (
          <button
            onClick={() => {
              if (confirm("آیا مطمئن هستید؟")) {
                clearWishlist();
                toast.success("لیست پاک شد");
              }
            }}
            className="text-red-500 hover:text-white hover:bg-red-500 px-5 py-2.5 rounded-xl transition-all border border-red-100 hover:border-red-500 flex items-center gap-2 text-sm font-medium group"
          >
            <HiTrash size={18} className="group-hover:scale-110 transition-transform" />
            پاک کردن همه
          </button>
        )}
      </div>

      {/* 📦 Grid محصولات مدرن */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8">
        {wishlist.map((item) => {
          const p = item.product;
          
          // محاسبات
          const variants = p.variants ?? [];
          const availableVariants = variants.filter((v) => v.stock > 0);
          const displayVariant = availableVariants[0] ?? variants[0] ?? null;
          const isOutOfStock = availableVariants.length === 0;

          // سبد خرید
          const cartItem = displayVariant
            ? cartItems.find((i: CartItem) => i.variantId === displayVariant.id)
            : undefined;
          const quantityInCart = cartItem?.quantity ?? 0;

          // قیمت
          const price = Number(displayVariant?.price ?? 0);
          const discount = Number(displayVariant?.discountPrice ?? 0);
          const hasDiscount = discount > 0 && discount < price;
          const discountPercent = hasDiscount
            ? Math.round(((price - discount) / price) * 100)
            : null;

          // تصویر
          const imageSrc = !p.imageUrl
            ? "/no-image.png"
            : p.imageUrl.startsWith("http")
            ? p.imageUrl
            : `${BASE_URL}${
                p.imageUrl.startsWith("/") ? p.imageUrl : `/${p.imageUrl}`
              }`;

          const isRemoving = removingIds.has(p.id);

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!isOutOfStock) router.push(`/product/${p.slug}?id=${p.id}`);
              }}
              className={`
                group relative flex flex-col justify-between
                bg-white 
                rounded-[24px] 
                transition-all duration-300 ease-out
                border border-transparent hover:border-gray-100
                shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]
                hover:-translate-y-1
                overflow-hidden
                p-4
                h-auto
                ${isRemoving ? "opacity-40 scale-95 pointer-events-none grayscale" : ""}
                ${p.isBlock || isOutOfStock ? "opacity-80" : "cursor-pointer"}
              `}
            >
              
              {/* --- بخش بالا: تصویر و بج‌ها --- */}
              <div className="relative w-full aspect-[4/3] bg-gray-50 rounded-[18px] overflow-hidden mb-4 flex items-center justify-center">
                
                {/* دکمه حذف (مخصوص صفحه ویش‌لیست) */}
                <button
                  onClick={(e) => handleRemoveFromWishlist(e, p.id, p.name)}
                  className="absolute top-3 left-1 z-20 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-500 shadow-sm hover:bg-blue-500 hover:text-white transition-all duration-200 tooltip-trigger"
                  title="حذف از لیست"
                >
                  {isRemoving ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <IoMdTrash size={18} />
                  )}
                </button>

                {/* بج تخفیف */}
                {hasDiscount && (
                  <span className="absolute top-3 right-1 z-20 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-red-200 shadow-md">
                    {discountPercent}% تخفیف
                  </span>
                )}

                {/* وضعیت موجودی */}
                {isOutOfStock && !p.isBlock && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <span className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transform -rotate-6">
                      ناموجود
                    </span>
                  </div>
                )}
                 {p.isBlock && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transform -rotate-6">
                      توقف فروش
                    </span>
                  </div>
                )}

                {/* عکس محصول */}
                <Image
                  src={imageSrc}
                  alt={p.name}
                  width={220}
                  height={220}
                  className="object-contain w-3/4 h-3/4 transition-transform duration-500 group-hover:scale-110 drop-shadow-sm mix-blend-multiply"
                />
              </div>

              {/* --- بخش میانی: اطلاعات --- */}
              <div className="flex flex-col gap-1 px-1">
                {/* دسته‌بندی */}
                {p.category && (
                  <span className="text-xs text-gray-400 font-medium truncate">
                    {p.category.name}
                  </span>
                )}
                
                {/* نام محصول */}
                <h3 className="font-bold text-gray-800 text-[15px] leading-snug line-clamp-2 h-[42px]">
                  {p.name}
                </h3>

                {/* قیمت */}
                <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                   {/* فضای خالی برای تراز بندی */}
                   <div className="flex-1"></div>
                   
                   <div className="flex flex-col items-end">
                      {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through decoration-red-400 decoration-1 mb-0.5">
                          {price.toLocaleString("fa-IR")}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-[#00B4D8]">
                        <span className="text-lg font-black tracking-tight">
                          {(hasDiscount ? discount : price).toLocaleString("fa-IR")}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">تومان</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* --- بخش پایین: دکمه خرید --- */}
              <div className="mt-5 pt-4 border-t border-gray-50">
                {isOutOfStock || !displayVariant ? (
                   <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">
                     فعلا موجود نیست
                   </button>
                ) : quantityInCart === 0 ? (
                  <button
                    disabled={isAdding}
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem({ productId: p.id, variantId: displayVariant.id, quantity: 1 });
                    }}
                    className="w-full py-3 bg-gray-900 hover:bg-[#00B4D8] text-white rounded-xl text-sm font-bold transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg shadow-gray-200 hover:shadow-blue-200"
                  >
                     {isAdding ? (
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                       <>
                         <span>افزودن به سبد</span>
                         <FiShoppingCart size={16} />
                       </>
                     )}
                  </button>
                ) : (
                  // کنترلر تعداد (استایل قرصی شکل)
                  <div className="flex items-center justify-between bg-[#F0F9FA] border border-[#B3E5FC] rounded-xl p-1 h-[46px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!cartItem) return;
                        quantityInCart === 1
                          ? removeItem(cartItem.id)
                          : updateItem({ itemId: cartItem.id, quantity: quantityInCart - 1 });
                      }}
                      className="w-9 h-full bg-white text-red-500 hover:bg-red-50 rounded-[10px] flex items-center justify-center transition-colors shadow-sm"
                    >
                      {quantityInCart === 1 ? <HiTrash size={18} /> : <HiMinus size={16} />}
                    </button>

                    <span className="font-bold text-lg text-[#0077B6] min-w-[30px] text-center select-none">
                      {quantityInCart}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem({ productId: p.id, variantId: displayVariant.id, quantity: 1 });
                      }}
                      className="w-9 h-full bg-[#00B4D8] text-white hover:bg-[#0096C7] rounded-[10px] flex items-center justify-center transition-colors shadow-sm"
                    >
                      <HiPlus size={16} />
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
