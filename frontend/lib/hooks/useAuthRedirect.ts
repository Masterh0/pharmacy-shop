import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useAuthReady } from "@/lib/hooks/useAuthReady";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Status = "checking" | "redirecting" | "render";

/**
 * ✅ نسخه هماهنگ با معماری جدید (کوکی HttpOnly)
 */
export function useAuthRedirect(): Status {
  const router = useRouter();
  const pathname = usePathname();
  const { role, userId } = useAuthStore(); // حالا به جای accessToken، userId و role رو داریم
  const ready = useAuthReady();
  const [status, setStatus] = useState<Status>("checking");
  const [firstLogin, setFirstLogin] = useState(false);

  useEffect(() => {
    if (!ready) return;

    // 🟢 تشخیص لاگین اولیه: تغییر از عدم وجود userId به وجودش
    if (userId && status === "checking") {
      setFirstLogin(true);
      setTimeout(() => setFirstLogin(false), 1500);
    }

    const isLoggedIn = Boolean(userId);

    // 🔐 اگر لاگین کرده ولی تو صفحات auth هست
    if (isLoggedIn && ["/login", "/signup", "/login/otp"].includes(pathname)) {
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
      !isLoggedIn &&
      (pathname.startsWith("/account") || pathname.startsWith("/admin"))
    ) {
      setStatus("redirecting");
      toast.warning("برای دسترسی به این صفحه ابتدا وارد حساب خود شوید.");
      router.replace("/login");
      return;
    }

    setStatus("render");
  }, [ready, userId, pathname, router]);

  return status;
}
