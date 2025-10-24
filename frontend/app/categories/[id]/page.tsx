"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api/category";
import Image from "next/image";

export default function CategoryProductsPage() {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["category-products", categoryId],
    queryFn: () => categoryApi.getProductsByCategory(categoryId),
    enabled: !!categoryId,
  });

  if (isLoading)
    return (
      <div className="text-center py-20 font-[IRANYekanX]">
        در حال بارگذاری...
      </div>
    );

  if (!products.length)
    return (
      <div className="text-center py-20 font-[IRANYekanX]">محصولی یافت نشد</div>
    );

  return (
    <main
      className="
        absolute left-1/2 -translate-x-[calc(50%-156px)] top-[384px]
        w-[912px] min-h-[1335px]
        flex flex-wrap justify-between gap-[24px]
        font-[IRANYekanX]
      "
    >
      {products.map((product) => (
        <div
          key={product.id}
          className="
            relative
            w-[288px] h-[429px]
            flex flex-col items-center
            p-4 gap-4 bg-white
            border border-[#CBCBCB] hover:border-[#0077B6]
            rounded-[16px] transition-all duration-200
          "
        >
          {/* 🔹 تصویر محصول */}
          <div className="relative w-[256px] h-[256px] rounded-[8px] bg-[#f9f9f9] flex items-center justify-center overflow-hidden">
            {/* عکس بک‌اند بدون هیچ تغییر ظاهری */}
            <Image
              src={`http://192.168.1.56:5000${product.imageUrl}`}
              alt={product.name}
              width={256}
              height={256}
              className="w-full h-full object-contain"
              unoptimized
            />

            {/* آیکون قلب */}
            <img
              src="/pic/productPic/Vector.svg"
              alt="like icon"
              width={24}
              height={24}
              className="absolute top-[12px] right-[12px] cursor-pointer"
            />
          </div>

          {/* 🔹 اطلاعات محصول */}
          <div className="flex flex-col items-end w-[256px] h-[125px] gap-3">
            <span className="font-bold text-[18px] leading-[25px] text-right text-black truncate">
              {product.name}
            </span>

            <p className="text-[16px] text-[#434343] leading-[180%] text-right line-clamp-2">
              {product.description}
            </p>

            <div className="flex flex-row-reverse items-center gap-[9px] mt-auto">
              <span className="text-[20px] font-bold text-black">
                {product.variants?.[0]?.price
                  ? Number(product.variants[0].price).toLocaleString("fa-IR")
                  : "—"}
              </span>
              <span className="text-[18px] font-bold text-black">تومان</span>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
