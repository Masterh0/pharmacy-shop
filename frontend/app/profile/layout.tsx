import ProfileSidebar from "@/src/components/profile/ProfileSidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" lang="fa" className="flex justify-start min-h-screen py-10">
      {/* کانتینر کلی (هم‌راستا با Sidebar و Boxها) */}
      <div className="flex w-[1200px] mr-32">
        {/* Sidebar پروفایل */}
        <ProfileSidebar role="user" />

        {/* ناحیه محتوای صفحه پروفایل */}
        <main
          className="
            flex-1
            bg-white
            border border-[#EDEDED]
            rounded-[16px]
            p-8
            self-start
            shadow-[0_1px_3px_rgba(0,0,0,0.04)]
            mr-[32px]    /* فاصله از سایدبار */
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}
