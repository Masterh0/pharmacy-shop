"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext"; // مسیر ایمپورت را چک کنید

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const router = useRouter();
  const { logout } = useAuth(); // آرگومان اضافی را حذف کردم تا با بقیه کدها هماهنگ باشد
  const [step, setStep] = useState<"confirm" | "loading" | "done">("confirm");

  // اگر مودال بسته است، هیچ چیزی رندر نکن
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setStep("loading");
      
      await logout(); 
      
      setStep("done");
      
      // کمی مکث برای نمایش تیک سبز، سپس ریدایرکت
      setTimeout(() => {
        router.replace("/login");
        // نیازی به onClose نیست چون صفحه عوض می‌شود، اما برای اطمینان:
        onClose(); 
      }, 1000);
    } catch (error) {
      console.error("Logout failed", error);
      // حتی در صورت خطا، کاربر را به لاگین بفرست
      router.replace("/login");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* پس‌زمینه تار و تیره - با کلیک روی آن مودال بسته می‌شود */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* باکس مودال */}
      <div className="relative z-10 bg-white p-6 rounded-2xl shadow-2xl border w-[320px] text-center animate-fade-in scale-100">
        
        {step === "confirm" && (
          <>
            <div className="mb-4 text-red-500 bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
            <h3 className="text-gray-800 font-bold text-lg mb-2">خروج از حساب</h3>
            <p className="text-gray-500 text-sm mb-6">
              آیا مطمئن هستید می‌خواهید از حساب کاربری خود خارج شوید؟
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleConfirm}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors w-full"
              >
                بله، خارج شو
              </button>
              <button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-6 py-2.5 rounded-xl transition-colors w-full"
              >
                انصراف
              </button>
            </div>
          </>
        )}

        {step === "loading" && (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-gray-600 text-sm">در حال پردازش...</span>
          </div>
        )}

        {step === "done" && (
          <div className="py-6 flex flex-col items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl">✓</div>
            <span className="text-emerald-600 font-medium text-sm">
              با موفقیت خارج شدید
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
