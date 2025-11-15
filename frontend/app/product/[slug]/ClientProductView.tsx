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
    <div className="w-[85%] mx-auto flex flex-col mt-10 font-vazirmatn">
      {/* مسیر دسته‌بندی */}
      <div className="text-gray-500 text-[14px] mb-6 flex gap-1">
        <span>مکمل تخصصی</span>
        <span>›</span>
        <span>کاهش وزن</span>
        <span>›</span>
        <span className="text-[#0077B6] font-semibold">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* گالری تصویر */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-[420px] h-[420px] border border-[#CBCBCB] rounded-lg flex items-center justify-center shadow-sm">
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

          <div className="flex gap-4">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="w-[80px] h-[80px] border border-[#CBCBCB] rounded-md bg-white hover:border-[#00B4D8] transition"
              />
            ))}
          </div>
        </div>

        {/* اطلاعات محصول */}
        <div className="flex flex-col gap-6">
          <h1 className="text-[#0077B6] text-3xl font-bold">{product.name}</h1>

          <div className="bg-white border rounded-xl p-5 shadow-sm text-[#434343] leading-8">
            <h2 className="text-xl font-bold text-gray-700 mb-2">مشخصات محصول</h2>
            <p>{product.description}</p>
          </div>

          {flavors.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-gray-700">انتخاب طعم:</span>
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
                        : "border-[#00B4D8] text-[#00B4D8] hover:bg-[#E0F7FA]"
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {packages.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-gray-700">تعداد در بسته:</span>
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
                        : "border-[#00B4D8] text-[#00B4D8] hover:bg-[#E0F7FA]"
                    }`}
                  >
                    {pkg} عدد
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2">
            <span className="text-[24px] font-bold text-black">
              {selectedVariant?.price
                ? selectedVariant.price.toLocaleString("fa-IR")
                : "—"}{" "}
              تومان
            </span>
          </div>

          <button className="mt-4 bg-gradient-to-r from-[#00B4D8] to-[#0077B6] hover:shadow-lg text-white text-lg font-bold py-3 rounded-full w-[230px] flex items-center justify-center gap-2 transition-all">
            افزودن به سبد
          </button>
        </div>
      </div>
    </div>
  );
}
