// lib/hooks/usePageLoading.ts
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function usePageLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return { isLoading, setIsLoading };
}
