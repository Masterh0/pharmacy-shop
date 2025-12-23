"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as authApi from "@/lib/api/auth";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useEffect } from "react";
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
};

export function useAuth({ enabled = false }: UseAuthOptions = {}) {
  const qc = useQueryClient();
  const router = useRouter();

  /**
   * ✅ فقط برای protected routes
   */
  const meQuery = useQuery<User | null, AxiosError<ApiErrorResponse>>({
    queryKey: AUTH_KEY,
    queryFn: async () => {
      authLog("ME_QUERY_CALL");
      const res = await authApi.me();
      authLog("ME_QUERY_SUCCESS", res.user);
      return res.user;
    },
    enabled,
    retry: false,
    staleTime: Infinity,
    initialData: () => qc.getQueryData<User | null>(AUTH_KEY) ?? null,
  });

  /**
   * ✅ هندل 401 فقط وقتی خودمان خواستیم
   */
  useEffect(() => {
    if (!enabled) return;

    if (meQuery.isError && meQuery.error?.response?.status === 401) {
      authLog("ME_QUERY_401 → CLEAR CACHE");
      qc.setQueryData(AUTH_KEY, null);
      toast.error("نشست کاربری منقضی شده است");
    }
  }, [enabled, meQuery.isError, meQuery.error]);

  const loginMutation = useMutation<
    AuthResponse,
    AxiosError<ApiErrorResponse>,
    LoginInput
  >({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      qc.setQueryData(AUTH_KEY, data.user);
      console.log(
        "🧪 LOGIN CACHE",
        qc.getQueryCache().find({ queryKey: AUTH_KEY })?.state.data
      );
      toast.success("ورود موفقیت‌آمیز بود ✅");
    },
    onError: (error) => {
      const status = error.response?.status;
      const msg = error.response?.data?.error;

      if (status === 400 || status === 401) {
        toast.error(msg || "اطلاعات ورود نادرست است");
        return;
      }

      toast.error("خطای غیرمنتظره‌ای رخ داد");
    },
  });

  const logoutMutation = useMutation<
    { message: string },
    AxiosError<ApiErrorResponse>,
    void
  >({
    mutationFn: authApi.logout,
    onSuccess: (data) => {
      authLog("LOGOUT → CLEAR AUTH CACHE");
      qc.setQueryData(AUTH_KEY, null);
      toast.success(data.message || "خارج شدید");
      router.replace("/login");
    },
  });

  return {
    user: meQuery.data,
    isAuthenticated: Boolean(meQuery.data),
    isLoading:
      meQuery.isLoading || loginMutation.isPending || logoutMutation.isPending,

    login: loginMutation.mutate,
    logout: logoutMutation.mutate,

    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
