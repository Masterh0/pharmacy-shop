"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/lib/api/auth"; // تابع API سمت فرانت

export default function LogoutPage() {
  const router = useRouter();
  const clearAuthState = useAuthStore((state) => state.logout);

  // Mutation لاگ‌اوت
  const { mutate: logoutMutate } = useMutation({
    mutationFn: logout, // فایل lib/api/auth
    onSuccess: () => {
      clearAuthState(); // پاک کردن داده‌های استور
      router.replace("/login"); // انتقال به صفحه لاگین
    },
    onError: (err) => {
      console.error("Logout failed:", err);
      clearAuthState(); // حتی در خطا، استیت محلی رو پاک کن
      router.replace("/login");
    },
  });

  useEffect(() => {
    logoutMutate(); // اجرای لاگ‌اوت سمت سرور
  }, [logoutMutate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <span className="text-gray-600 text-sm">
        در حال خروج از حساب کاربری...
      </span>
    </div>
  );
}
