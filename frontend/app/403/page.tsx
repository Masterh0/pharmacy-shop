// app/403/page.tsx
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert
            className="h-10 w-10 text-destructive"
            strokeWidth={1.5}
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tight text-destructive">
            ۴۰۳
          </h1>
          <p className="text-lg font-medium text-foreground">دسترسی غیرمجاز</p>
          <p className="text-muted-foreground">
            شما اجازه‌ی دسترسی به این صفحه را ندارید. اگر فکر می‌کنید این یک
            اشتباه است، با مدیر سیستم تماس بگیرید.
          </p>
        </div>

        <button className="mt-2 bg-blue-500  rounded-md ">
          <Link href="/">بازگشت به خانه</Link>
        </button>
      </div>
    </div>
  );
}
