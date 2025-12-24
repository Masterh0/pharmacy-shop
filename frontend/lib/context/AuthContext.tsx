// src/lib/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, me } from "@/lib/api/auth"; // اطمینان حاصل کن مسیر درست است

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>; // تابعی برای رفرش دستی (مثلا بعد از آپدیت پروفایل)
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await me(); // درخواست به /auth/me
      setUser(response.user);
    } catch (error) {
      // اگر ارور داد (401) یعنی کاربر لاگین نیست
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// این هوک را برای استفاده در کامپوننت‌ها اکسپورت می‌کنیم
export const useAuth = () => useContext(AuthContext);
