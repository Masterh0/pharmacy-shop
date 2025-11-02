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
    (set, get) => ({
      accessToken: undefined,
      refreshToken: undefined,
      role: undefined,
      userId: undefined,
      phone: undefined,
      name: undefined,

      setAuth: (data) => {
        console.log("🟢 [AuthStore] setAuth called with data:", data);
        set({ ...data });

        // بلافاصله بعد از set، وضعیت فعلی رو لاگ بگیر
        console.log("✅ [AuthStore] new state:", get());
      },

      logout: () => {
        console.log("🟡 [AuthStore] logout called — clearing state...");
        localStorage.removeItem("auth-store");
        set({
          accessToken: undefined,
          refreshToken: undefined,
          role: undefined,
          userId: undefined,
          phone: undefined,
          name: undefined,
        });
        console.log("✅ [AuthStore] after logout:", get());
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
