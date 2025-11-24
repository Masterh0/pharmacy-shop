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
import { toast } from "sonner";

import CartSuccessModal from "@/src/components/CartSuccessModal"; // 👈 اضافه شد

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

  // 👇 برای کنترل نمایش پاپ‌آپ موفقیت
  const [showPopup, setShowPopup] = useState(false);

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

  useEffect(() => {
    window.scrollTo({ top: 250, behavior: "smooth" });
  }, []);

  const viewSentRef = useRef(false);
  useEffect(() => {
    if (!product?.id || viewSentRef.current) return;
    const viewedKey = `viewed_product_${product.id}`;
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    const lastView = localStorage.getItem(viewedKey);
    if (lastView && Number(lastView) > sixHoursAgo) return;
    viewSentRef.current = true;
    api
      .post(`/products/${product.id}/view`)
      .then(() => {
        localStorage.setItem(viewedKey, Date.now().toString());
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
      { productId: product.id, variantId: selectedVariant.id, quantity: count },
      {
        onSuccess: () => {
          toast.success("✅ به سبد خرید اضافه شد");
          console.log("🟢 addItem success!");
          setShowPopup(true); // 👈 نمایش مودال موفقیت
          setCount(1);
        },
        onError: (err) => {
          console.error("❌ خطا در افزودن به سبد:", err);
          toast.error("خطا در افزودن به سبد خرید");
        },
      }
    );
  }

  return (
    <>
      {/* 🔹 بدنه اصلی صفحه */}
      <div className="w-[85%] mx-auto flex flex-col mt-12 font-vazirmatn text-[#434343]">
        {/* مسیر دسته‌بندی */}
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
                    : `${baseUrl}/${product.imageUrl.replace(/^\/+/, "")}`
                }
                alt={product.name}
                zoomType="hover"
                zoomScale={1.8}
                className="rounded-[8px] object-contain"
              />
            </div>
          </div>

          {/* توضیحات */}
          <div className="flex flex-col gap-8">
            <h1 className="text-[#000] text-[28px] font-bold">
              {product.name}
            </h1>

            <h3 className="border-b border-[#EDEDED] text-[#656565] pb-1 font-semibold text-lg">
              مشخصات محصول
            </h3>

            <div
              dangerouslySetInnerHTML={{ __html: product.description }}
              className="text-[16px] leading-[32px] text-right space-y-2 [&_strong]:text-[#000]"
            />

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
              <div className="flex flex-col gap-1">
                {selectedVariant?.discountPrice ? (
                  <>
                    <span className="text-[14px] text-[#E53935] line-through decoration-[#E53935]">
                      {Number(selectedVariant.price).toLocaleString("fa-IR")}{" "}
                      تومان
                    </span>
                    <span className="text-[24px] font-bold text-[#242424]">
                      {Number(selectedVariant.discountPrice).toLocaleString(
                        "fa-IR"
                      )}{" "}
                      تومان
                    </span>
                  </>
                ) : (
                  <span className="text-[24px] font-bold text-[#242424]">
                    {selectedVariant?.price
                      ? `${Number(selectedVariant.price).toLocaleString(
                          "fa-IR"
                        )} تومان`
                      : "—"}
                  </span>
                )}
              </div>

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
                  {isAdding ? "در حال افزودن..." : "افزودن به سبد خرید"}
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

      {/* 👇 نمایش پاپ‌آپ موفقیت */}
      <CartSuccessModal show={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}
