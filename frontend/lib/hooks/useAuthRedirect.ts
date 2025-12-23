import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Status = "checking" | "redirecting" | "render";

const AUTH_ROUTES = ["/login", "/signup", "/login/otp"];

export function useAuthRedirect(): Status {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtectedRoute =
    pathname.startsWith("/account") || pathname.startsWith("/admin");

  /**
   * 🔑 فقط protected route auth check می‌خواد
   */
  const shouldCheckAuth = isProtectedRoute;

  const { user, isLoading } = useAuth({
    enabled: shouldCheckAuth,
  });

  const [status, setStatus] = useState<Status>("checking");
  const redirected = useRef(false);

  useEffect(() => {
    // ✅ صفحات public + auth بدون هیچ auth check
    if (!isProtectedRoute && !isAuthRoute) {
      setStatus("render");
      return;
    }

    // ✅ auth route (login/signup) → فقط redirect اگه user داریم
    if (isAuthRoute && !isProtectedRoute) {
      if (user) {
        redirected.current = true;
        setStatus("redirecting");
        toast.info("قبلاً وارد شده‌اید");
        router.replace("/");
      } else {
        setStatus("render");
      }
      return;
    }

    // ✅ protected route
    if (isProtectedRoute) {
      if (isLoading || redirected.current) return;

      if (!user) {
        redirected.current = true;
        setStatus("redirecting");
        toast.warning("برای دسترسی وارد حساب شوید");
        router.replace("/login");
        return;
      }

      // admin guard
      if (
        pathname.startsWith("/admin") &&
        user.role !== "ADMIN"
      ) {
        redirected.current = true;
        setStatus("redirecting");
        toast.error("دسترسی ادمین ندارید");
        router.replace("/");
        return;
      }

      setStatus("render");
    }
  }, [pathname, user, isLoading, router, isAuthRoute, isProtectedRoute]);

  return status;
}
