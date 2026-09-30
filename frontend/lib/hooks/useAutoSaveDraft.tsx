import { useEffect, useRef, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

const DRAFT_KEY = "product-create-draft";
const DEBOUNCE_MS = 500;
function sanitizeForStorage(data: any): any {
  if (data instanceof File || data instanceof Blob) {
    return undefined;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeForStorage).filter((value) => value !== undefined);
  }

  if (data && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data)
        .map(([key, value]) => [key, sanitizeForStorage(value)])
        .filter(([, value]) => value !== undefined),
    );
  }

  return data;
}

export function useAutoSaveDraft(form: UseFormReturn<any>, enabled = true) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // بارگذاری draft هنگام mount
  const loadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const { data } = JSON.parse(raw);
      return data ?? null;
    } catch {
      return null;
    }
  }, []);
  const skipNextSaveRef = useRef(false);
  const saveDraft = useCallback(
    (values: any) => {
      if (!enabled) return;

      if (skipNextSaveRef.current) {
        skipNextSaveRef.current = false;
        return;
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({
              savedAt: Date.now(),
              data: sanitizeForStorage(values),
            }),
          );
        } catch {}
      }, DEBOUNCE_MS);
    },
    [enabled],
  );

  const clearDraft = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    skipNextSaveRef.current = true;
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const discardDraft = useCallback(() => {
    if (!confirm("پیش‌نویس حذف شود؟ این عمل قابل بازگشت نیست.")) return;
    clearDraft();
    form.reset();
  }, [clearDraft, form]);

  // watch → autosave
  useEffect(() => {
    if (!enabled) return;
    const sub = form.watch((values) => saveDraft(values));
    return () => sub.unsubscribe();
  }, [form, saveDraft, enabled]);

  // cleanup timer on unmount
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return { loadDraft, clearDraft, discardDraft };
}
