import ProfileSidebar from "@/src/components/profile/ProfileSidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" lang="fa" className="min-h-screen py-10 bg-[#FAFAFA]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        {/* این flex کانتینر اصلی است */}
        <div className="flex flex-col lg:flex-row gap-6 items-start relative">
          
          {/* Sidebar Wrapper */}
          {/* عرض و چسبندگی اینجا کنترل می‌شود */}
          <aside className="hidden lg:block w-[310px] flex-shrink-0 sticky top-8 h-fit z-10">
            <ProfileSidebar />
          </aside>

          {/* MAIN Content */}
          {/* min-w-0 بسیار مهم است تا جلوی اسکرول افقی اضافی را بگیرد */}
          <main
            className="
              flex-1
              min-w-0 
              w-full
              bg-white
              border border-[#EDEDED]
              rounded-[16px]
              shadow-[0_1px_3px_rgba(0,0,0,0.04)]
            "
          >
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
