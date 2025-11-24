"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { categoryApi } from "@/lib/api/category";
import api from "@/lib/axios";
import InnerImageZoom from "react-inner-image-zoom";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCart } from "@/lib/hooks/useAddToCart";
import { getOrCreateSessionId } from "@/lib/utils/session";
import { toast } from "sonner"; // یا هر سیستم نوتیف تو داری
export default function ClientProductView({
  product,
  variants,
  flavors,
  packages,
  baseUrl,
  initialVariant,
}) {
  const [selectedFlavor, setSelectedFlavor] = useState(
    initialVariant?.flavor || ""
  );
  const [selectedPackage, setSelectedPackage] = useState(
    initialVariant?.packageQuantity || ""
  );
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [count, setCount] = useState(1);

  function updateVariant(flavor, pkg) {
    const found = variants.find(
      (v) =>
        (!flavor || v.flavor === flavor) && (!pkg || v.packageQuantity === pkg)
    );
    if (found) setSelectedVariant(found);
  }

  const { data: breadcrumb } = useQuery({
    queryKey: ["breadcrumb", product.categoryId],
    queryFn: async () => {
      if (!product.categoryId) return [];
      const chain = [];
      let current = await categoryApi.getById(product.categoryId);
      while (current && current.parentId) {
        chain.unshift(current);
        current = await categoryApi.getById(current.parentId);
      }
      if (current) chain.unshift(current);
      return chain;
    },
    enabled: !!product.categoryId,
  });

  // ⬇️ اسکرول نرم در ورود
  useEffect(() => {
    window.scrollTo({ top: 250, behavior: "smooth" });
  }, []);

  // ⬇️ ثبت شمارش بازدید — فیکس شده برای جلوگیری از دوباره اجرا شدن
  const viewSentRef = useRef(false);

  useEffect(() => {
    if (!product?.id || viewSentRef.current) return;

    const viewedKey = `viewed_product_${product.id}`;
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000; // محدودیت ۶ ساعته
    const lastView = localStorage.getItem(viewedKey);

    // اگر در ۶ ساعت گذشته بازدید کرد، دیگه نفرست
    if (lastView && Number(lastView) > sixHoursAgo) return;

    viewSentRef.current = true;

    api
      .post(`/products/${product.id}/view`)
      .then(() => {
        localStorage.setItem(viewedKey, Date.now().toString());
        console.log(`📊 viewCount برای محصول ${product.id} افزایش یافت`);
      })
      .catch((err) => console.error("❌ خطا در افزایش viewCount:", err));
  }, [product?.id]);
  const { addItem, isAdding } = useCart();
  function handleAddToCart() {
    if (!selectedVariant?.id) {
      toast.error("لطفاً طعم و بسته را انتخاب کنید");
      return;
    }

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: count,
      },
      {
        onSuccess: () => {
          toast.success("✅ به سبد خرید اضافه شد");
        },
        onError: (err) => {
          console.error("❌ خطا در افزودن به سبد:", err);
          toast.error("خطا در افزودن به سبد خرید");
        },
      }
    );
  }
  return (
    <div className="w-[85%] mx-auto flex flex-col mt-12 font-vazirmatn text-[#434343]">
      {/* 🟦 مسیر دسته‌بندی */}
      <div className="text-[#898989] text-[14px] mb-8 flex gap-1 items-center flex-wrap">
        {breadcrumb?.map((cat, i) => (
          <span key={cat.id} className="flex items-center gap-1">
            <Link
              href={`/categories/${cat.slug}?id=${cat.id}`}
              className={
                i === breadcrumb.length
                  ? "text-[#0077B6] font-semibold"
                  : "hover:text-[#0077B6] transition-colors"
              }
            >
              {cat.name}
            </Link>
            {i <= breadcrumb.length - 1 && <span>›</span>}
          </span>
        ))}
        <span className="text-[#0077B6] font-semibold">{product.name}</span>
      </div>

      {/* 🔹 تصویر چپ + توضیحات راست */}
      <div className="grid lg:grid-cols-2 gap-[64px] items-start">
        {/* تصویر اصلی */}
        <div className="flex justify-center items-center">
          <div className="w-[530px] h-[576px] bg-white rounded-[16px] flex items-center justify-center border border-[#EDEDED] overflow-hidden">
            <InnerImageZoom
              src={
                product.imageUrl?.startsWith("http")
                  ? product.imageUrl
                  : `${baseUrl}/${product.imageUrl.replace(/^\/+/, "")}`
              }
              zoomSrc={
                product.imageUrl?.startsWith("http")
                  ? product.imageUrl
                  : `${baseUrl}/${product.imageUrl.replace(/^\/+/, "")}` // یا نسخه با رزولوشن بالاتر
              }
              alt={product.name}
              zoomType="hover" // زوم با حرکت موس
              zoomScale={1.8} // میزان بزرگ‌نمایی
              className="rounded-[8px] object-contain"
            />
          </div>
        </div>

        {/* توضیحات */}
        <div className="flex flex-col gap-8">
          <h1 className="text-[#000] text-[28px] font-bold">{product.name}</h1>

          <h3 className="border-b border-[#EDEDED] text-[#656565] pb-1 font-semibold text-lg">
            مشخصات محصول
          </h3>

          <div
            dangerouslySetInnerHTML={{ __html: product.description }}
            className="text-[16px] leading-[32px] text-right space-y-2 [&_strong]:text-[#000]"
          ></div>

          {/* انتخاب طعم و بسته */}
          <div className="flex flex-row flex-wrap gap-6 w-full mt-2">
            {flavors?.length > 0 && (
              <div className="flex flex-col gap-2 flex-1 min-w-[45%]">
                <span className="font-bold text-[#000]">طعم:</span>
                <div className="flex gap-3 flex-wrap">
                  {flavors.map((flavor) => (
                    <button
                      key={flavor}
                      onClick={() => {
                        setSelectedFlavor(flavor);
                        updateVariant(flavor, selectedPackage);
                      }}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        flavor === selectedFlavor
                          ? "bg-[#00B4D8] text-white border-[#00B4D8]"
                          : "border-[#00B4D8] text-[#0077B6] hover:bg-[#E0F7FA]"
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {packages?.length > 0 && (
              <div className="flex flex-col gap-2 flex-1 min-w-[45%]">
                <span className="font-bold text-[#000]">تعداد در بسته:</span>
                <div className="flex gap-3 flex-wrap">
                  {packages.map((pkg) => (
                    <button
                      key={pkg}
                      onClick={() => {
                        setSelectedPackage(pkg);
                        updateVariant(selectedFlavor, pkg);
                      }}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        pkg === selectedPackage
                          ? "bg-[#0077B6] text-white border-[#0077B6]"
                          : "border-[#00B4D8] text-[#0077B6] hover:bg-[#E0F7FA]"
                      }`}
                    >
                      {pkg} عدد
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* قیمت و دکمه خرید */}
          <div className="mt-6 flex flex-col gap-8 w-[392px]">
            <span className="text-[24px] font-bold text-[#242424]">
              {selectedVariant?.price
                ? `${Number(selectedVariant.price).toLocaleString(
                    "fa-IR"
                  )} تومان`
                : "—"}
            </span>

            <div className="flex flex-row gap-6 items-center">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex items-center justify-center gap-2 w-[184px] h-[48px] rounded-[8px] font-medium transition-all 
  ${
    isAdding
      ? "bg-gray-400 cursor-wait"
      : "bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white hover:opacity-90"
  }`}
              >
                {isAdding ? "در حال افزودن..." : "افزودن به سبد خرید"}{" "}
              </button>

              <div className="flex flex-row items-center justify-center border border-[#00B4D8] rounded-[8px] w-[184px] h-[48px] px-6 gap-4">
                <button
                  onClick={() => setCount((c) => c + 1)}
                  className="text-[#00B4D8]"
                >
                  +
                </button>
                <span className="text-[14px] font-medium text-[#00B4D8] select-none">
                  {count} عدد
                </span>
                <button
                  onClick={() => setCount((c) => (c > 1 ? c - 1 : 1))}
                  className="text-[#00B4D8]"
                >
                  –
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
