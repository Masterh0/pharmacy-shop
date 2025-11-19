import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/api/auth";

interface UserAuthData {
  accessToken?: string;
  refreshToken?: string;
  role?: Role;
  userId?: number;
  phone?: string;
  name?: string;
}

interface AuthState extends UserAuthData {
  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    role: Role;
    userId: number;
    phone: string;
    name?: string;
  }) => void;
  setTokens: (data: { accessToken: string; refreshToken: string }) => void; // ✨ این تابع همینطور که هست درسته
  logout: () => void; // ✨ این تابع هم درسته
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: undefined,
      refreshToken: undefined,
      role: undefined,
      userId: undefined,
      phone: undefined,
      name: undefined,

      setAuth: (data) => {
        console.log("🟢 [AuthStore] setAuth called (full data)");
        set({ ...data });
      },
      
      setTokens: ({ accessToken, refreshToken }) => { // ✨ تعریف درست: دریافت یک شیء
        console.log("🔄 [AuthStore] setTokens called (refresh flow)");
        set({ accessToken, refreshToken });
      },

      logout: () => {
        console.log("🟡 [AuthStore] logout called — clearing state...");
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
      onRehydrateStorage: () => {
        console.log("🔷 [AuthStore] Rehydration started — loading from storage...");
        return (state, error) => {
          if (error) {
            console.error("❌ [AuthStore] Error during rehydration:", error);
          } else {
            console.log("🟣 [AuthStore] Rehydration complete — current state:", state);
          }
        };
      },
    }
  )
);
