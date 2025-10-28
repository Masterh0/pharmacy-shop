"use client";

import {
  Home2,
  Bag2,
  Location,
  Box,
  User,
  LogoutCurve,
  Category,
  Autobrightness,
  Edit2,
} from "iconsax-react";
import { usePathname } from "next/navigation";

export default function ProfileSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "پیشخوان", icon: Home2, href: "/profile" },
    { label: "تاریخچه سفارشات", icon: Bag2, href: "/profile/orders" },
    { label: "آدرس‌ها", icon: Location, href: "/profile/addresses" },
    { label: "دسته بندی ها", icon: Category, href: "/profile/categorie" },
    { label: "برند ها", icon: Autobrightness, href: "/profile/brand" },
    { label: "افزودن محصول", icon: Box, href: "/profile/add-product" },
    { label: "تغییر اطلاعات محصول", icon: Edit2, href: "/profile/edit-product" },

    { label: "اطلاعات حساب کاربری", icon: User, href: "/profile/account" },
    { label: "خروج", icon: LogoutCurve, href: "/logout" },
  ];

  return (
    <aside
      dir="rtl"
      lang="fa"
      className="
        w-[310px]
        bg-white
        rounded-2xl
        border border-[#EDEDED]
        shadow-[0_1px_3px_rgba(0,0,0,0.04)]
        px-4 py-5
        mr-[32px]
        flex flex-col
        items-stretch
        self-start
      "
    >
      {/* اطلاعات کاربر */}
      <div className="flex flex-col text-center mb-4 leading-[160%]">
        <span className="text-[#434343] text-[16px] font-medium">
          نگار زمانی
        </span>
        <span className="text-[#656565] text-[14px] font-normal">
          behvandi@gmail.com
        </span>
      </div>

      {/* جداکننده */}
      <div className="w-full h-[1px] bg-[#EDEDED] mb-4" />

      {/* آیتم‌های منو */}
      <nav className="flex flex-col gap-[6px]">
        {menuItems.map((item) => {
          // فقط دقیقاً همخوان یا مشتقات مسیر اون آیتم فعال بشن
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href + "/") && item.href !== "/profile");

          const Icon = item.icon;

          return (
            <a
              key={item.label}
              href={item.href}
              className={`
                flex items-center justify-between 
                py-[6px] px-[10px]
                
                border-b border-[#EDEDED]
                text-[15px] font-normal
                ${
                  isActive
                    ? "bg-[#00B4D8] rounded-[10px] text-white shadow-[0_1px_4px_rgba(0,180,216,0.3)]"
                    : "bg-white text-[#434343] hover:bg-[#F4FBFC]"
                }
                transition-all duration-150
              `}
            >
              <div className="flex items-center gap-[4px]">
                <Icon
                  size="18"
                  color={isActive ? "#FFFFFF" : "#434343"}
                  variant="Bold"
                />
                <span
                  className={`${
                    isActive ? "font-semibold text-white" : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
