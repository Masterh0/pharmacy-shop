"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";

export function useLoginRequired() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [intendedPath, setIntendedPath] = useState<string>("/");

  /**
   * چک می‌کنه آیا کاربر لاگین کرده یا نه
   * اگر نه، مودال رو نشون میده و مسیر مورد نظر رو ذخیره می‌کنه
   */
  const requireLogin = useCallback(
    (path?: string): boolean => {
      if (isLoading) return false;

      if (!user) {
        const targetPath = path || window.location.pathname;
        setIntendedPath(targetPath);
        setShowModal(true);
        return false;
      }

      return true;
    },
    [user, isLoading]
  );

  /**
   * هدایت به صفحه لاگین با returnUrl
   */
  const goToLogin = useCallback(() => {
    const returnUrl = intendedPath || "/";
    router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    setShowModal(false);
  }, [router, intendedPath]);

  /**
   * هدایت به صفحه ثبت‌نام با returnUrl
   */
  const goToSignup = useCallback(() => {
    const returnUrl = intendedPath || "/";
    router.push(`/signup?returnUrl=${encodeURIComponent(returnUrl)}`);
    setShowModal(false);
  }, [router, intendedPath]);

  /**
   * بستن مودال
   */
  const closeModal = useCallback(() => {
    setShowModal(false);
    setIntendedPath("/");
  }, []);

  return {
    user,
    isLoading,
    showModal,
    requireLogin,
    goToLogin,
    goToSignup,
    closeModal,
  };
}
