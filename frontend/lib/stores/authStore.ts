import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  accessToken: string;
  refreshToken: string;
  phone: string; // شماره کاربر
  otp: string; // آخرین کدی که کاربر وارد کرده
  isVerified: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  setPhone: (phone: string) => void;
  setOtp: (otp: string) => void;
  setVerified: (verified: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: "",
      refreshToken: "",
      phone: "",
      otp: "",
      isVerified: false,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      clearTokens: () =>
        set({
          accessToken: "",
          refreshToken: "",
          phone: "",
          otp: "",
          isVerified: false,
        }),

      setPhone: (phone) => set({ phone }),
      setOtp: (otp) => set({ otp }),
      setVerified: (verified) => set({ isVerified: verified }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : sessionStorage
      ),
    }
  )
);
