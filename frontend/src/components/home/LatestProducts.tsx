"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { productApi } from "@/lib/api/products";
import type { Product } from "@/lib/types/product";
import WishlistButton from "../WishlistButton";
import { HiSparkles } from "react-icons/hi2";
interface ProductWithDisplayVariant extends Product {
  displayVariant?: {
    price?: number | string | null;
    discountPrice?: number | string | null;
    images?: {
      url: string;
      displayOrder?: number;
    }[];
  } | null;
  effectivePrice?: number;
  displayDiscountPrice?: number | null;
}

function getImageUrl(url?: string | null) {
  if (!url) return "";

  if (url.startsWith("http")) {
    return url;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  return `${baseUrl.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
}

function getProductPrice(product: ProductWithDisplayVariant) {
  const variant = product.displayVariant;

  const price = Number(
    variant?.price ?? product.displayPrice ?? product.effectivePrice ?? 0,
  );

  const discountPrice = Number(
    variant?.discountPrice ?? product.displayDiscountPrice ?? 0,
  );

  const hasDiscount = discountPrice > 0 && discountPrice < price;

  return {
    price,
    finalPrice: hasDiscount ? discountPrice : price,
    hasDiscount,
    discountPercent: hasDiscount
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0,
  };
}

export default function LatestProducts() {
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<Product[]>({
    queryKey: ["home", "latest-products"],
    queryFn: () => productApi.getLatestProducts(8),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section dir="rtl" className="w-full mx-auto px-4 mt-8 lg:mt-10">
      {" "}
      {/* Header with Divider Line */}
      <div className="flex items-center gap-3 mb-6">
        {/* Icon */}
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
          <HiSparkles size={18} />
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 whitespace-nowrap">
          جدیدترین محصولات
        </h2>

        {/* Divider */}
        <div className="flex-1 h-[1px] bg-gray-200 mr-2" />

        {/* More */}
        <Link
          href="/products?sort=newest&page=1"
          className="text-sm font-medium text-primary hover:text-[#0077B6] transition-colors whitespace-nowrap"
        >
          مشاهده بیشتر
        </Link>
      </div>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {" "}
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white border border-[#EDEDED] rounded-2xl p-4 animate-pulse flex flex-col justify-between"
            >
              <div className="h-[170px] lg:h-[190px] bg-[#F3F4F6] rounded-xl" />
              <div className="h-3 bg-[#F3F4F6] rounded mt-4 w-3/4" />
              <div className="h-3 bg-[#F3F4F6] rounded mt-2 w-1/2" />
              <div className="h-4 bg-[#F3F4F6] rounded mt-4 w-2/3" />
            </div>
          ))}
        </div>
      )}
      {/* Error State */}
      {isError && (
        <div className="bg-white border border-[#EDEDED] rounded-2xl py-10 text-center">
          <p className="text-sm text-[#9CA3AF]">
            دریافت محصولات با خطا مواجه شد.
          </p>
        </div>
      )}
      {/* Empty State */}
      {!isLoading && !isError && products.length === 0 && (
        <div className="bg-white border border-[#EDEDED] rounded-2xl py-10 text-center">
          <p className="text-sm text-[#9CA3AF]">
            هنوز محصولی برای نمایش وجود ندارد.
          </p>
        </div>
      )}
      {/* Products Grid */}
      {!isLoading && !isError && products.length > 0 && (
        <div
          dir="rtl"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5"
        >
          {products.map((item) => {
            const product = item as ProductWithDisplayVariant;

            const image =
              product.displayVariant?.images?.[0]?.url ?? product.imageUrl;

            const imageUrl = getImageUrl(image);

            const { price, finalPrice, hasDiscount, discountPercent } =
              getProductPrice(product);

            const brandName =
              typeof product.brand === "string"
                ? product.brand
                : product.brand?.name;

            const brandSlug =
              typeof product.brand === "object" && product.brand?.slug
                ? product.brand.slug
                : (product.brandId ?? "");

            return (
              <div
                key={product.id}
                className="
                w-full
                bg-white
                border
                border-[#EDEDED]
                rounded-2xl
                 relative
                  p-3
                  flex
                  flex-col
                  justify-between
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:shadow-md
                "
              >
                {/* Discount Badge */}
                {hasDiscount && (
                  <span
                    className="
                      absolute
                      top-4
                      right-4
                      z-10
                      w-8
                      h-8
                      rounded-full
                      bg-[#E53935]
                      text-white
                      text-[11px]
                      font-bold
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {discountPercent}٪
                  </span>
                )}

                {/* Main Content Area */}
                <div>
                  {/* Product Image & Title Link */}
                  <Link
                    href={`/product/${product.id}-${product.slug}`}
                    draggable={false}
                    className="block"
                  >
                    {/* Image Container */}
                    <div className="relative w-full h-[135px] lg:h-[155px] flex items-center justify-center overflow-hidden">
                      {" "}
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          draggable={false}
                          className="
                            w-full
                            h-full
                            object-contain
                            p-2
                            transition-transform
                            duration-300
                            hover:scale-105
                          "
                        />
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">
                          بدون تصویر
                        </span>
                      )}
                    </div>

                    {/* Like Button & Product Name Row */}
                    <div className="mt-3 flex flex-row-reverse items-start justify-between gap-2">
                      {/* Wishlist Button */}
                      <div className="shrink-0 pt-0.5">
                        <WishlistButton productId={product.id} size={22} />
                      </div>

                      {/* Product Name */}
                      <h3 className="text-[14px] font-bold text-[#242424] leading-6 line-clamp-2 text-right">
                        {product.name}
                      </h3>
                    </div>
                  </Link>

                  {/* Brand Name Link */}
                  {brandName && (
                    <div className="mt-1 text-right">
                      <Link
                        href={`/brands/${brandSlug}`}
                        className="text-[12px] text-[#8C8C8C] hover:text-[#00B4D8] transition-colors inline-block"
                      >
                        {brandName}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Price Section */}
                <div className="mt-4 pt-2 text-left">
                  {hasDiscount && (
                    <div className="text-[12px] text-[#E53935] line-through font-medium mb-0.5">
                      {price.toLocaleString("fa-IR")} تومان
                    </div>
                  )}

                  <div className="flex items-center justify-end pl-4 gap-1">
                    <span className="text-[16px] font-bold text-[#242424]">
                      {finalPrice.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-[11px] font-normal text-[#4A4A4A]">
                      تومان
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
