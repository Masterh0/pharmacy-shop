// app/customer/layout.tsx

import ProfileSidebar from "@/src/components/profile/ProfileSidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" lang="fa" className="flex min-h-screen py-10 px-4 lg:px-8">
      
      {/* کانتینر کلی */}
      <div className="flex w-full  max-w-[1400px] mx-auto gap-8">
        
        {/* Sidebar - عرض ثابت */}
        <ProfileSidebar />

        {/* محتوای اصلی - تمام عرض باقیمانده */}
        <main className="flex-1 bg-white border border-[#EDEDED] rounded-[16px] p-6 lg:p-8 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
