"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password"];

export default function ConditionalHeader() {
  const pathname = usePathname();

  const isAuthPage = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return (
    <div className={isAuthPage ? "hidden md:block" : "block"}>
      <Header />
    </div>
  );
}
