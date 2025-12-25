// src/lib/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, me, logout as apiLogout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await me();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // تلاش برای خروج سمت سرور (پاک کردن کوکی/توکن)
      await apiLogout().catch(() => console.log("Logout API failed/skipped"));
      
      // پاک کردن وضعیت سمت کلاینت
      setUser(null);
      
      // ریدایرکت به صفحه ورود (اختیاری، بسته به نیاز پروژه)
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser: checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// هوک اختصاصی برای استفاده ساده‌تر
export const useAuth = () => useContext(AuthContext);
