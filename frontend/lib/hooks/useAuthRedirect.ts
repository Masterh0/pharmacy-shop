import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useAuthReady } from "@/lib/hooks/useAuthReady";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Status = "checking" | "redirecting" | "render";

/**
 * ✅ هوک نهایی ضد Flicker با Toast
 */
export function useAuthRedirect(): Status {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, role } = useAuthStore();
  const ready = useAuthReady();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (!ready) return;

    // 🔐 اگر لاگین کرده ولی رفته صفحه‌های auth
    if (accessToken && ["/login", "/signup", "/login/otp"].includes(pathname)) {
      setStatus("redirecting");
      toast.warning(
        "شما وارد حساب کاربری خود شده‌اید و به این صفحه دسترسی ندارید."
      );
      setTimeout(() => {
        router.replace("/");
      }, 100);
      router.replace("/");
      return;
    }

    // 🚫 اگر هنوز لاگین نکرده ولی رفته صفحات محافظت‌شده
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
