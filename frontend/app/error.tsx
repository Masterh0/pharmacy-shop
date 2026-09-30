"use client";

import { Link } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold">خطایی رخ داد</h1>

      <p className="mt-4 text-muted-foreground">
        مشکلی در پردازش درخواست پیش آمده است.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-xl px-6 py-3 font-semibold"
        >
          تلاش مجدد
        </button>

        <Link href="/" className="rounded-xl px-6 py-3 font-semibold">
          صفحه اصلی
        </Link>
      </div>
    </main>
  );
}
