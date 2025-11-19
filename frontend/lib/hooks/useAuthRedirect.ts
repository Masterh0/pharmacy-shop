import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useAuthReady } from "@/lib/hooks/useAuthReady";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Status = "checking" | "redirecting" | "render";

/**
 * ✅ نسخه‌ی نهایی ضد Flicker با تشخیص ورود اولیه کاربر
 */
export function useAuthRedirect(): Status {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, role } = useAuthStore();
  const ready = useAuthReady();
  const [status, setStatus] = useState<Status>("checking");
  const [firstLogin, setFirstLogin] = useState(false);

  useEffect(() => {
    if (!ready) return;

    // 🟢 شناسایی لاگین اولیه
    // وقتی accessToken برای اولین بار ست می‌شود، یعنی verifyOtp موفق بوده
    if (accessToken && status === "checking") {
      setFirstLogin(true);
      setTimeout(() => setFirstLogin(false), 1500); // بعد از ۱.۵ ثانیه عادی بشه
    }

    // 🔐 اگر لاگین کرده ولی تو صفحات auth هست
    if (accessToken && ["/login", "/signup", "/login/otp"].includes(pathname)) {
      setStatus("redirecting");
      if (!firstLogin) {
        toast.warning(
          "شما وارد حساب کاربری خود شده‌اید و به این صفحه دسترسی ندارید."
        );
      } else {
        toast.info("در حال ورود برای اولین بار...");
      }
      setTimeout(() => router.replace("/"), 300);
      return;
    }

    // 🚫 اگر لاگین نکرده ولی رفته صفحات محافظت‌شده
    if (
      !accessToken &&
      (pathname.startsWith("/account") || pathname.startsWith("/admin"))
    ) {
      setStatus("redirecting");
      toast.warning("برای دسترسی به این صفحه ابتدا وارد حساب خود شوید.");
      router.replace("/login");
      return;
    }

    setStatus("render");
  }, [ready, accessToken, pathname, router]);

  return status;
}
