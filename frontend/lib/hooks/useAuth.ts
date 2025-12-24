"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as authApi from "@/lib/api/auth";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { authLog } from "@/lib/authDebug";
import { AUTH_KEY } from "../constants/auth";

export type Role = "ADMIN" | "STAFF" | "CUSTOMER";

export interface User {
  id: number;
  phone: string;
  email?: string;
  name: string;
  role: Role;
}

interface AuthResponse {
  user: User;
}

interface LoginInput {
  identifier: string;
  password: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

type UseAuthOptions = {
  enabled?: boolean;
  initialData?: User | null;
};

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

/* -----------------------------------------------------------
   ✅ Main Hook - SUPER SIMPLE VERSION
----------------------------------------------------------- */
export function useAuth({ enabled = true, initialData }: UseAuthOptions = {}) {
  const qc = useQueryClient();
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");

  /** 🧩 بررسی وجود توکن‌ها */
  const hasToken =
    typeof window !== "undefined" &&
    /accessToken=|refreshToken=/.test(document.cookie);

  /** 🧠 Query دریافت کاربر فعلی - ✅ NO REFRESH LOGIC */
  const meQuery = useQuery<User | null, AxiosError<ApiErrorResponse>>({
    queryKey: AUTH_KEY,
    queryFn: () => authApi.me(), // ✅ ساده - interceptor همه کارها رو میکنه
    enabled: enabled && hasToken,
    retry: 1, // ✅ فقط 1 بار retry
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialData,
  });

  /** 🧩 مدیریت وضعیت احراز هویت - ✅ SUPER SIMPLE */
  useEffect(() => {
    if (!enabled) {
      setStatus("unauthenticated");
      return;
    }

    if (meQuery.isLoading || meQuery.isFetching) {
      setStatus("checking");
      return;
    }

    // ✅ اگر data داریم = authenticated، وگرنه unauthenticated
    if (meQuery.data) {
      authLog("AUTH_STATUS → AUTHENTICATED");
      setStatus("authenticated");
    } else {
      authLog("AUTH_STATUS → UNAUTHENTICATED");
      qc.setQueryData(AUTH_KEY, null);
      setStatus("unauthenticated");
    }
  }, [enabled, meQuery.data, meQuery.isLoading, meQuery.isFetching, qc]);

  /* -----------------------------------------------------------
     ✅ Login Mutation - بدون تغییر
  ----------------------------------------------------------- */
  const loginMutation = useMutation<
    AuthResponse,
    AxiosError<ApiErrorResponse>,
    LoginInput
  >({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      qc.setQueryData(AUTH_KEY, data.user);
      setStatus("authenticated");
      authLog("LOGIN_SUCCESS", data.user);
      toast.success("ورود موفقیت‌آمیز بود ✅");
      setTimeout(() => router.replace("/"), 100);
    },
    onError: (error) => {
      const status = error.response?.status;
      const msg = error.response?.data?.error || error.response?.data?.message;
      
      if (status === 400 || status === 401) {
        toast.error(msg || "اطلاعات ورود نادرست است");
      } else {
        toast.error("خطای غیرمنتظره‌ای رخ داد");
      }
      setStatus("unauthenticated");
    },
  });

  /* -----------------------------------------------------------
     ✅ Logout Mutation - بدون تغییر
  ----------------------------------------------------------- */
  const logoutMutation = useMutation<
    { message: string },
    AxiosError<ApiErrorResponse>,
    void
  >({
    mutationFn: authApi.logout,
    async onMutate() {
      qc.setQueryData(AUTH_KEY, null);
      setStatus("unauthenticated");
    },
    onSuccess: (data) => {
      authLog("LOGOUT_SUCCESS");
      qc.cancelQueries({ queryKey: AUTH_KEY });
      qc.removeQueries({ queryKey: AUTH_KEY });
      toast.success(data.message || "خارج شدید");

      if (typeof document !== "undefined") {
        document.cookie = "accessToken=; Max-Age=0; path=/";
        document.cookie = "refreshToken=; Max-Age=0; path=/";
      }

      setTimeout(() => router.replace("/login"), 100);
    },
    onError: (error) => {
      authLog("LOGOUT_ERROR", error);
      toast.error("خطا در خروج از سیستم");
      qc.invalidateQueries({ queryKey: AUTH_KEY });
    },
  });

  return {
    user: meQuery.data,
    data: meQuery.data,
    status,
    isAuthenticated: status === "authenticated",
    isChecking: status === "checking",
    isUnauthenticated: status === "unauthenticated",
    isLoading: meQuery.isLoading || meQuery.isFetching,
    isFetching: meQuery.isFetching,
    error: meQuery.error,
    isError: meQuery.isError,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    meQuery,
    loginMutation,
    logoutMutation,
    refetch: meQuery.refetch,
    invalidate: () => qc.invalidateQueries({ queryKey: AUTH_KEY }),
  };
}

// بقیه هوک‌ها بدون تغییر...
export function useAuthCache() {
  const qc = useQueryClient();
  const user = qc.getQueryData<User | null>(AUTH_KEY);
  return { user, isAuthenticated: !!user };
}

export function useAuthStatus() {
  const { status, isAuthenticated, isChecking, isUnauthenticated } = useAuth({
    enabled: true,
  });
  return { status, isAuthenticated, isChecking, isUnauthenticated };
}
