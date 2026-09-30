"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ProfileSidebar from "@/src/components/profile/ProfileSidebar";
import { AuthGuard } from "@/src/components/guards/AuthGuard";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 1024;

      if (isMobile && mainRef.current) {
        mainRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [pathname]);

  return (
    <AuthGuard>
      <div
        dir="rtl"
        lang="fa"
        className="min-h-screen py-4 sm:py-8 bg-[#FAFAFA]"
      >
        <div className="container mx-auto px-3 sm:px-4 max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
            {/* سایدبار */}
            <aside className="w-full lg:w-[300px] flex-shrink-0 lg:sticky lg:top-6 z-10">
              <ProfileSidebar />
            </aside>

            {/* محتوای اصلی */}
            <main
              ref={mainRef}
              className="flex-1 min-w-0 w-full bg-white border border-[#EDEDED] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
