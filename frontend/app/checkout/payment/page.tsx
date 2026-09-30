import { Suspense } from "react";
import PaymentClient from "./PaymentClient";

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentClient />
    </Suspense>
  );
}

function PaymentLoading() {
  return (
    <div dir="rtl" className="min-h-screen bg-white px-4 py-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* عنوان */}
        <div className="mb-8 flex items-center justify-between">
          <div className="h-7 w-36 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* بخش اصلی پرداخت */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-5 h-5 w-28 animate-pulse rounded bg-gray-200" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
              </div>
            </div>
          </div>

          {/* خلاصه سفارش */}
          <div className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-6 h-5 w-28 animate-pulse rounded bg-gray-200" />

            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
              </div>

              <div className="flex justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              </div>

              <div className="my-4 border-t border-gray-100" />

              <div className="flex justify-between">
                <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
              </div>

              <div className="h-11 w-full animate-pulse rounded-xl bg-[#E5F8FC]" />
            </div>
          </div>
        </div>

        {/* لودینگ کوچک */}
        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00B4D8] border-t-transparent" />
          <span>در حال آماده‌سازی اطلاعات پرداخت...</span>
        </div>
      </div>
    </div>
  );
}
