// /lib/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserAuthData {
  role?: string | null;
  userId?: number | null;
  phone?: string | null;
  name?: string | null;
}

interface AuthState extends UserAuthData {
  hydrated: boolean;
  setAuth: (data: UserAuthData) => void;
  clearAuth: () => void;
  markHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      role: null,
      userId: null,
      phone: null,
      name: null,
      hydrated: false,

      setAuth: (data) => {
        set({
          role: data.role ?? get().role,
          userId: data.userId ?? get().userId,
          phone: data.phone ?? get().phone,
          name: data.name ?? get().name,
        });
      },

      clearAuth: () => {
        set({
          role: null,
          userId: null,
          phone: null,
          name: null,
        });
      },

      markHydrated: () => set({ hydrated: true }),
    }),

    {
      name: "auth-ui",
      partialize: (s) => ({
        role: s.role,
        userId: s.userId,
        phone: s.phone,
        name: s.name,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);
