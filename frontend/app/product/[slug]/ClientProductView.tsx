"use client";

import Image from "next/image";
import { useState } from "react";

export default function ClientProductView({
  product,
  variants,
  flavors,
  packages,
  baseUrl,
  initialVariant,
}) {
  const [selectedFlavor, setSelectedFlavor] = useState(initialVariant?.flavor || "");
  const [selectedPackage, setSelectedPackage] = useState(initialVariant?.packageQuantity || "");
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);

  function updateVariant(flavor, pkg) {
    const found = variants.find(
      (v) => (!flavor || v.flavor === flavor) && (!pkg || v.packageQuantity === pkg)
    );
    if (found) setSelectedVariant(found);
  }

  return (
    <div className="w-[85%] mx-auto flex flex-col mt-12 font-vazirmatn text-[#434343]">
      {/* مسیر دسته‌بندی */}
      <div className="text-gray-500 text-sm mb-8 flex gap-1">
        <span>مکمل تخصصی</span>
        <span>›</span>
        <span>کاهش وزن</span>
        <span>›</span>
        <span className="text-[#0077B6] font-bold">{product.name}</span>
      </div>

      {/* ساختار دو ستونه */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* 📸 بخش تصویر */}
        <div className="flex flex-col items-center gap-8 mt-8">
          <div className="w-[420px] h-[420px] flex items-center justify-center bg-white rounded-[16px]">
            <Image
              src={
                product.imageUrl?.startsWith("http")
                  ? product.imageUrl
                  : `${baseUrl}/${product.imageUrl.replace(/^\/+/, "")}`
              }
              alt={product.name}
              width={380}
              height={380}
              className="object-contain rounded-md"
            />
          </div>

          {/* تصاویر کوچک تستی */}
          <div className="flex gap-4 mt-2">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="w-[80px] h-[80px] bg-white border border-[#CBCBCB] rounded-[8px] hover:border-[#00B4D8] transition-all"
              />
            ))}
          </div>
        </div>

        {/* 📋 بخش متن و انتخاب‌ها */}
        <div className="flex flex-col justify-between gap-8 text-[#434343]">
          {/* نام محصول */}
          <h1 className="text-[#000000] text-3xl font-bold tracking-tight">{product.name}</h1>

          {/* توضیحات بدون باکس */}
          <div
            dangerouslySetInnerHTML={{ __html: product.description }}
            className="text-right font-vazirmatn leading-8 space-y-2
              [&_strong]:text-[#000000]
              [&_p]:text-[#434343]
              [&_li::before]:content-['•'] [&_li::before]:absolute [&_li::before]:right-0.5
              [&_li::before]:text-[#0077B6] [&_li::before]:font-bold
              relative [&_li]:pr-6"
          ></div>

          {/* 🔹 انتخاب طعم و بسته کنار هم */}
          <div className="flex flex-row flex-wrap items-start gap-8 ">
            {flavors.length > 0 && (
              <div className="flex flex-col gap-2 w-[48%]">
                <span className="font-bold text-[#000000]">طعم:</span>
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
                          ? "bg-[#00B4D8] text-white border-[#00B4D8] shadow-sm"
                          : "border-[#00B4D8] text-[#0077B6] hover:bg-[#E0F7FA]"
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {packages.length > 0 && (
              <div className="flex flex-col gap-2 w-[48%]">
                <span className="font-bold text-[#000000]">تعداد در بسته:</span>
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
                          ? "bg-[#0077B6] text-white border-[#0077B6] shadow-sm"
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

          {/* 🔹 قیمت و دکمه کنار هم پایین */}
          <div className="mt-8 flex flex-row items-center justify-between pt-6">
            <span className="text-[22px] font-bold text-[#000000]">
              {selectedVariant?.price
                ? selectedVariant.price.toLocaleString("fa-IR")
                : "—"}{" "}
              تومان
            </span>

            <button className="bg-gradient-to-r from-[#00B4D8] to-[#0077B6] hover:shadow-lg text-white text-lg font-bold py-3 rounded-full w-[230px] flex items-center justify-center gap-2 transition-all">
              افزودن به سبد خرید
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
