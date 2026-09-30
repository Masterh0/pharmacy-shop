import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

function ForgotPasswordLoading() {
  return (
    <div
      dir="rtl"
      className="flex min-h-[70vh] items-center justify-center bg-[#f7fbfc] px-4"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#087da9]/20 border-t-[#087da9]" />

        <p className="text-sm text-[#6b7280]">
          در حال بارگذاری صفحه...
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordClient />
    </Suspense>
  );
}