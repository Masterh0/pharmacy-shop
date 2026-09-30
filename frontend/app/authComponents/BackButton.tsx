// components/common/BackButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="hidden md:flex items-center gap-2 cursor-pointer text-[#171717] m-6"
    >
      <span className="text-2xl hover:text-cyan-600">↩</span>
      <span className="text-lg">بازگشت</span>
    </button>
  );
}
