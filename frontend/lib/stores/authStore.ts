// /lib/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ---------------------------
 * 🧩 Types
 * --------------------------- */
export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

export interface UserAuthData {
  userId: number | null;
  role: UserRole | null;
  phone: string | null;
  name: string | null;
}

export interface AuthState extends UserAuthData {
  hydrated: boolean;
  setAuth: (data: Partial<UserAuthData>) => void;
  logout: () => void;
  markHydrated: () => void;
}

/* ---------------------------
 * 🧩 Default Values
 * --------------------------- */
const defaultUser: UserAuthData = {
  userId: null,
  role: null,
  phone: null,
  name: null,
};

/* ---------------------------
 * 🧩 Store
 * --------------------------- */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...defaultUser,
      hydrated: false,

      setAuth: (data) =>
        set({
          userId: data.userId ?? get().userId,
          role: data.role ?? get().role,
          phone: data.phone ?? get().phone,
          name: data.name ?? get().name,
        }),

      logout: () => {
        set({ ...defaultUser });
      },

      markHydrated: () => set({ hydrated: true }),
    }),

    {
      name: "auth-ui",

      partialize: (s) => ({
        userId: s.userId,
        role: s.role,
        phone: s.phone,
        name: s.name,
      }),

      onRehydrateStorage: () => (state, err) => {
        if (err) console.error("Hydration error:", err);
        state?.markHydrated();
      },
    }
  )
);
