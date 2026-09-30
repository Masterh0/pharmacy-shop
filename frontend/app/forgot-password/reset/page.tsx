import { Suspense } from "react";
import ForgotPasswordResetClient from "./ForgotPasswordResetClient";

function ForgotPasswordResetLoading() {
  return (
    <div
      dir="rtl"
      className="flex min-h-[70vh] items-center justify-center bg-[#f7fbfc] px-4 py-10"
    >
      <div className="w-full max-w-md animate-pulse rounded-3xl border border-[#e2f0f5] bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-[#e8f5f9]" />

        <div className="mx-auto mb-3 h-6 w-48 rounded-lg bg-slate-200" />

        <div className="mx-auto mb-8 h-4 w-64 rounded-lg bg-slate-100" />

        <div className="mb-4 h-12 rounded-xl bg-slate-100" />

        <div className="mb-4 h-12 rounded-xl bg-slate-100" />

        <div className="h-12 rounded-xl bg-[#d9eef5]" />
      </div>
    </div>
  );
}

export default function ForgotPasswordResetPage() {
  return (
    <Suspense fallback={<ForgotPasswordResetLoading />}>
      <ForgotPasswordResetClient />
    </Suspense>
  );
}
