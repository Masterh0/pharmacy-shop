"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter, usePathname } from "next/navigation"; // 👈 اضافه شد
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Role } from "@/lib/api/auth";
import CheckoutLoading from "../CheckoutLoading";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: Role;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requiredRole,
  redirectTo = "/login",
  loadingFallback,
}: AuthGuardProps) {
  const { user, status, isLoggingOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // 👈 مسیر فعلی
  const hasToasted = useRef(false);

  const isWrongRole = requiredRole && user?.role !== requiredRole;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (status === "unauthenticated" && !isLoggingOut && !hasToasted.current) {
      hasToasted.current = true;

      const targetUrl = `${redirectTo}?returnUrl=${encodeURIComponent(pathname)}&reason=required`;

      timer = setTimeout(() => {
        router.replace(targetUrl);
      }, 100);
    } else if (
      status === "authenticated" &&
      isWrongRole &&
      !hasToasted.current
    ) {
      hasToasted.current = true;
      toast.error("شما دسترسی به این صفحه را ندارید", { id: "auth-forbidden" });
      timer = setTimeout(() => {
        router.replace("/403");
        hasToasted.current = false;
      }, 700);
    } else if (status === "authenticated" && !isWrongRole) {
      toast.dismiss("auth-forbidden");
      hasToasted.current = false;
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, isWrongRole, router, redirectTo, pathname]);

  if (status === "loading" && !user) {
    return <CheckoutLoading/>;
  }

  if ((status === "unauthenticated" && !isLoggingOut) || isWrongRole) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" />
    );
  }

  return <>{children}</>;
}

// کامپوننت لودر تمام صفحه (تغییرات جزئی برای ظاهر بهتر)
function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-zinc-950 bg-opacity-70 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
    </div>
  );
}
