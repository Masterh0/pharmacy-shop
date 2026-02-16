"use client";

import { useWishlist } from "@/lib/hooks/useWishlist";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { useEffect, useState } from "react";

export default function WishlistButton({
  productId,
  size = 28,
  showLabel = false,
  className = "",
}) {
  const { isInWishlist, toggleWishlist, isAdding, isRemoving } = useWishlist();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const inWishlist = mounted ? isInWishlist(productId) : false;
  const isLoading = isAdding || isRemoving;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleWishlist(productId);
      }}
      disabled={isLoading}
      title={
        mounted
          ? inWishlist
            ? "حذف از علاقه‌مندی‌ها"
            : "افزودن به علاقه‌مندی‌ها"
          : "علاقه‌مندی"
      }
      className={`
        group relative
        flex items-center justify-center gap-2
        transition-all duration-300
        ${showLabel ? "px-4 py-2.5" : "w-11 h-11"}
        rounded-full z-50
        ${isLoading
          ? "opacity-50 cursor-wait"
          : "hover:scale-110 hover:-translate-y-1 active:scale-95"}
        ${className}
      `}
    >
      {mounted && inWishlist ? (
        <IoMdHeart size={size} className="text-[#2196F3]" />
      ) : (
        <IoMdHeartEmpty
          size={size}
          className="text-[#434343] group-hover:text-[#2196F3]"
        />
      )}

      {showLabel && mounted && (
        <span
          className={`text-sm font-medium ${
            inWishlist ? "text-[#2196F3]" : "text-gray-700"
          }`}
        >
          {inWishlist ? "در علاقه‌مندی‌ها" : "افزودن"}
        </span>
      )}
    </button>
  );
}
