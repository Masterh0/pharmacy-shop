"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

export default function LogoutPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    logout(); // پاک کردن کل auth state
    router.replace("/"); // هدایت کاربر به لاگین (یا "/" اگه خواستی)
  }, [logout, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <span className="text-gray-600 text-sm">
        در حال خروج از حساب کاربری...
      </span>
    </div>
  );
}
