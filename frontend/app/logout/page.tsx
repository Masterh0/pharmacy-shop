"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth({ enabled: true });

  const [step, setStep] = useState<"confirm" | "loading" | "done">("confirm");

  const handleConfirm = async () => {
    try {
      setStep("loading");
      
      await logout(); // ✅ canonical logout
      setStep("done");

      setTimeout(() => {
        router.replace("/login");
      }, 1000);
    } catch {
      // حتی اگر خطا بده، کاربر نباید لاگین بماند
      setStep("done");
      setTimeout(() => {
        router.replace("/login");
      }, 1000);
    }
  };

  const handleCancel = () => router.back();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Background blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      {/* Modal */}
      <div
        className="
          relative z-10 bg-white p-6 rounded-xl shadow-xl border
          w-[300px] text-center animate-fade-in
        "
      >
        {step === "confirm" && (
          <>
            <p className="text-gray-700 text-sm mb-4">
              آیا مطمئن هستید می‌خواهید خارج شوید؟
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleConfirm}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg"
              >
                بله، خارج شو
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-lg"
              >
                خیر
              </button>
            </div>
          </>
        )}

        {step === "loading" && (
          <span className="text-gray-600 text-sm">در حال خروج...</span>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-gray-600 text-sm">در حال خروج...</span>
            <span className="text-emerald-600 text-xs">
              ✓ با موفقیت خارج شدید
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
