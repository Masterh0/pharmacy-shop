// src/lib/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { User, me, logout as apiLogout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { setUnauthorizedHandler } from "@/lib/http-client"; // مسیر فایل بالا رو درست بذارید
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { setRefreshSuccessHandler } from "../axios";
import { useWishlistStore } from "../stores/wishlistStore";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  isLoggingOut: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  isLogoutModalOpen: boolean; // 👈 جدید
  openLogoutModal: () => void; // 👈 جدید
  closeLogoutModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "loading",
  isLoading: true,
  isLoggingOut: false,
  refreshUser: async () => {},
  logout: async () => {},
  isLogoutModalOpen: false,
  openLogoutModal: async () => {},
  closeLogoutModal: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const queryClient = useQueryClient();
  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);
  const isRefreshingAuth = useRef(false);
  const pendingRecheck = useRef(false);
  const checkAuth = useCallback(async (options?: { silent?: boolean }) => {
    if (isRefreshingAuth.current) {
      pendingRecheck.current = true; // flag برای اجرای مجدد بعد از پایان
      return;
    }
    isRefreshingAuth.current = true;
    try {
      const response = await me();
      setUser(response.user);
      setStatus("authenticated");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    } finally {
      isRefreshingAuth.current = false;
      if (pendingRecheck.current) {
        pendingRecheck.current = false;
        checkAuth({ silent: true });
      }
    }
  }, []);

  const logout = async (broadcast = true) => {
    setIsLoggingOut(true);

    try {
      await apiLogout().catch(() => {});

      // کاربر از Context خارج شود
      setUser(null);
      setStatus("unauthenticated");
      setIsLogoutModalOpen(false);

      // کش سبد کاربر قبلی را حذف کن
      queryClient.removeQueries({
        queryKey: ["cart"],
      });
      useWishlistStore.getState().clear();
      // به تب‌های دیگر اطلاع بده
      if (broadcast) {
        channelRef.current?.postMessage({
          type: "logout",
        });
      }
    } catch (error) {
      console.error("❌ LOGOUT ERROR:", error);
    } finally {
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1500);
    }
  };
  useEffect(() => {
  }, [status]);
  useEffect(() => {
    checkAuth();
    const channel = new BroadcastChannel("auth-sync");
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data?.type === "logout") {
        setUser(null);
        setStatus("unauthenticated");
        setIsLogoutModalOpen(false);

        queryClient.removeQueries({
          queryKey: ["cart"],
        });

        return;
      }

      if (event.data?.type === "session-expired") {
        setUser(null);
        setStatus("unauthenticated");
        setIsLogoutModalOpen(false);

        queryClient.invalidateQueries({ queryKey: ["cart"] });

        toast.error("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.", {
          id: "session-expired",
        });

        router.replace("/login?reason=expired");

        return;
      }

      if (event.data?.type === "login") {
        checkAuth();
      }
    };

    return () => channel.close();
  }, [checkAuth]);
  useEffect(() => {
    setUnauthorizedHandler((reason) => {
      if (reason !== "SESSION_EXPIRED") return;

      // کاربر را خارج کن
      setUser(null);
      setStatus("unauthenticated");
      setIsLogoutModalOpen(false);

      // چون نشست واقعاً منقضی شده،
      // سبد کاربر قبلی هم باید مثل logout پاک شود
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      // فقط یک Toast
      toast.error("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.", {
        id: "session-expired",
      });

      // به تب‌های دیگر هم اطلاع بده
      channelRef.current?.postMessage({
        type: "session-expired",
      });

      // برو صفحه لاگین
      router.replace("/login?reason=expired");
    });
    setRefreshSuccessHandler(() => {
      checkAuth({ silent: true });
    });
    return () => {
      setUnauthorizedHandler(null);
      setRefreshSuccessHandler(null); // 👈 cleanup
    };
  }, [queryClient, router, checkAuth]);
  const refreshUser = async () => {
    await checkAuth();
    channelRef.current?.postMessage({ type: "login" });
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isLoading: status === "loading",
        isLoggingOut,
        refreshUser,
        logout,
        isLogoutModalOpen,
        openLogoutModal: () => setIsLogoutModalOpen(true),
        closeLogoutModal: () => setIsLogoutModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
