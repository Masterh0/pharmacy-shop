import { useAuth } from "@/lib/hooks/useAuth";

/**
 * ✅ Auth readiness بر اساس React Query
 * - true یعنی auth check تمام شده
 */
export function useAuthReady() {
  const { isLoading } = useAuth();

  return !isLoading;
}
