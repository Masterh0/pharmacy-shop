import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * هوک بررسی آماده بودن Zustand Persist برای احراز هویت
 *
 * - `ready` وقتی true میشه که hydration از localStorage کامل انجام شده باشه.
 * - میشه ازش برای کنترل UI در حالت لود اولیه استفاده کرد تا از پرش جلوگیری بشه.
 */
export function useAuthReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // تابعی که بعد از اتمام hydration صدا زده میشه
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setReady(true);
    });

    // اگر hydration قبلاً تموم شده بود (مثلاً در مرورگر بعدی)
    if (useAuthStore.persist.hasHydrated()) {
      setReady(true);
    }

    return () => unsubscribe?.();
  }, []);

  return ready;
}
