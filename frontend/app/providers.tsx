"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ReactNode, useState } from "react";
import "@/styles/globals.css";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    console.log("🧠 CREATE QueryClient");
    return new QueryClient();
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
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
