"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ReactNode, useState } from "react";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { LoadingProvider } from "@/src/components/LoadingProvider";
import LogoutModal from "@/src/components/profile/LogoutModal";
export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    return new QueryClient();
  });
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <AuthProvider>
          {children}
          <LogoutModal />
        </AuthProvider>
      </LoadingProvider>

      <Toaster
        richColors
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          error: {
            style: {
              textAlign: "right",
              direction: "rtl",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
