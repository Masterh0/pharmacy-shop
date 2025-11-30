"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ReactNode } from "react";
import "@/styles/globals.css";
const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        richColors
        position="top-center" // یا top-left برای RTL
        reverseOrder={false}
        toastOptions={{
          // اگر می‌خواهید پیام‌های خطای فارسی واضح‌تر باشند
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
