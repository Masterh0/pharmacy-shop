"use client";

import { useWishlist } from "@/lib/hooks/useWishlist";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { useEffect, useState } from "react";

export default function WishlistButton({
  productId,
  size = 22,
  showLabel = false,
  className = "",
}: {
  productId: string | number;
  size?: number;
  showLabel?: boolean;
  className?: string;
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
        relative
        flex items-center justify-center gap-2
        transition-all duration-200
        p-1 rounded-full
        z-10
        ${isLoading ? "opacity-50 cursor-wait" : "hover:scale-110 active:scale-95"}
        ${className}
      `}
    >
      {mounted && inWishlist ? (
        <IoMdHeart size={size} className="text-[#E53935]" />
      ) : (
        <IoMdHeartEmpty
          size={size}
          className="text-[#8C8C8C] hover:text-[#E53935] transition-colors duration-200"
        />
      )}

      {showLabel && mounted && (
        <span
          className={`text-sm font-medium ${
            inWishlist ? "text-[#E53935]" : "text-gray-700"
          }`}
        >
          {inWishlist ? "در علاقه‌مندی‌ها" : "افزودن"}
        </span>
      )}
    </button>
  );
}
