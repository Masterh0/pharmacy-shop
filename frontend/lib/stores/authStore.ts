import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/api/auth";

interface AuthState {
  accessToken?: string;
  refreshToken?: string;
  role?: Role;
  userId?: number;
  phone?: string;
  name?: string;
  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    role: Role;
    userId: number;
    phone: string;
    name?: string;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: undefined,
      refreshToken: undefined,
      role: undefined,
      userId: undefined,
      phone: undefined,
      name: undefined,

      setAuth: (data) => set({ ...data }),

      logout: () => {
        // فقط داده‌های استور رو پاک کن، نه کل localStorage
        localStorage.removeItem("auth-store");
        set({
          accessToken: undefined,
          refreshToken: undefined,
          role: undefined,
          userId: undefined,
          phone: undefined,
          name: undefined,
        });
      },
    }),
    {
      name: "auth-store",
    }
  )
);
