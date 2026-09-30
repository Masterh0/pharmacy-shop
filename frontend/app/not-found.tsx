"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-7xl font-bold">404</h1>

      <h2 className="mt-4 text-2xl font-semibold">صفحه مورد نظر پیدا نشد</h2>

      <p className="mt-2 text-muted-foreground">
        ممکن است این محصول، دسته‌بندی یا صفحه حذف شده باشد.
      </p>

      <Link href="/" className="mt-8 rounded-xl px-6 py-3 font-semibold">
        بازگشت به صفحه اصلی
      </Link>
    </main>
  );
}
