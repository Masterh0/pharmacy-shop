import { Suspense } from "react";
import OtpClient from "./OtpClient";

export default function LoginOtpPage() {
  return (
    <Suspense fallback={<OtpLoading />}>
      <OtpClient />
    </Suspense>
  );
}

function OtpLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <p className="animate-pulse text-[#00B4D8]">در حال بارگذاری...</p>
    </div>
  );
}
