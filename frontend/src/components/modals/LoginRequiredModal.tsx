"use client";

import { useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

export default function LoginRequiredModal({
  isOpen,
  onClose,
  onLogin,
  onSignup,
}: LoginRequiredModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // ✅ استفاده از Portal برای رندر در body (خارج از هدر)
  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center
        bg-black/70 backdrop-blur-md
        animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-[440px]
          animate-[slideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* دکمه بستن */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 
            transition-colors text-2xl font-light"
          aria-label="بستن"
        >
          ×
        </button>

        {/* آیکون */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#E3F2FD] rounded-full flex items-center justify-center">
            <Image
              src="/pic/headersPic/profile-circle-svgrepo-com.svg"
              alt="ورود"
              width={48}
              height={48}
            />
          </div>
        </div>

        {/* متن */}
        <h2 className="text-center text-[#242424] text-xl font-bold mb-3">
          برای دسترسی به این بخش ابتدا وارد حساب کاربری خود شوید
        </h2>

        <p className="text-center text-gray-500 text-sm mb-8">
          برای ادامه فرآیند خرید، نیاز به ورود یا ثبت‌نام دارید
        </p>

        {/* دکمه‌ها */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="w-full py-3 bg-[#0077B6] text-white rounded-xl
              font-medium text-base hover:bg-[#0096C7] 
              transition-all shadow-md hover:shadow-lg"
          >
            ورود به حساب
          </button>

          <button
            onClick={onSignup}
            className="w-full py-3 bg-white text-[#0077B6] rounded-xl
              font-medium text-base border-2 border-[#0077B6]
              hover:bg-[#E3F2FD] transition-all"
          >
            ثبت‌نام
          </button>
        </div>

        {/* لینک انصراف */}
        <button
          onClick={onClose}
          className="w-full mt-4 text-center text-gray-500 text-sm 
            hover:text-gray-700 transition-colors"
        >
          انصراف
        </button>
      </div>
    </div>,
    document.body
  );
}
