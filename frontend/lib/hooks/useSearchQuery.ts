"use client";

import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api/search";
import { useState, useEffect } from "react";

export function useSearchQuery(query: string) {
  const [debounced, setDebounced] = useState("");

  // debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const result = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => searchApi.search(debounced),
    enabled: debounced.length >= 2,
    staleTime: 1000 * 10, // 10 seconds
  });

  return {
    ...result,
    query: debounced,
  };
}
