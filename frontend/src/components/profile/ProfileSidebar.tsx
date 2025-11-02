"use client";
import { useAuthStore } from "@/lib/stores/authStore";
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
  Add,
} from "iconsax-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function ProfileSidebar() {
  const pathname = usePathname();
  const { name } = useAuthStore();

  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  const menuItems = [
    { label: "پیشخوان", icon: Home2, href: "/manager/profile" },
    { label: "تاریخچه سفارشات", icon: Bag2, href: "/manager/profile/orders" },
    { label: "آدرس‌ها", icon: Location, href: "/manager/profile/addresses" },

    {
      label: "دسته‌بندی‌ها",
      icon: Category,
      href: "/manager/profile/categories",
      children: [
        { label: "افزودن دسته", icon: Add, href: "/manager/profile/categorie" },
        { label: "تغییر دسته", icon: Edit2, href: "/manager/profile/categories/edit" },
      ],
    },
    {
      label: "برندها",
      icon: Autobrightness,
      href: "/manager/profile/brands",
      children: [
        { label: "افزودن برند", icon: Add, href: "/manager/profile/brand" },
        { label: "تغییر برند", icon: Edit2, href: "/manager/profile/brands/edit" },
      ],
    },

    {
      label: "محصولات",
      icon: Box,
      href: "/manager/profile/products",
      children: [
        { label: "افزودن محصول", icon: Add, href: "/manager/profile/add-product" },
        { label: "تغییر محصول", icon: Edit2, href: "/manager/profile/edit-product" },
      ],
    },

    { label: "اطلاعات حساب کاربری", icon: User, href: "/manager/profile/account" },
    { label: "خروج", icon: LogoutCurve, href: "/logout" },
  ];

  return (
    <aside
      dir="rtl"
      lang="fa"
      className="w-[310px] bg-white rounded-2xl border border-[#EDEDED] shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-4 py-5 mr-[32px] flex flex-col items-stretch self-start"
    >
      {/* اطلاعات کاربر */}
      <div className="flex flex-col text-center mb-4 leading-[160%]">
        <span className="text-[#434343] text-[16px] font-medium">{name}</span>
        <span className="text-[#656565] text-[14px] font-normal">
          behvandi@gmail.com
        </span>
      </div>

      {/* جداکننده */}
      <div className="w-full h-[1px] bg-[#EDEDED] mb-4" />

      {/* آیتم‌ها */}
      <nav className="flex flex-col gap-[6px]">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href + "/") && item.href !== "/profile");
          const isExpanded = expanded === item.label;
          const Icon = item.icon;

          return (
            <div key={item.label}>
              {/* آیتم اصلی */}
              <button
                onClick={() =>
                  item.children ? toggleExpand(item.label) : null
                }
                className={`w-full flex items-center justify-between py-[6px] px-[10px] border-b border-[#EDEDED] text-[15px] font-normal text-right ${
                  isActive || isExpanded
                    ? "bg-[#00B4D8] rounded-[10px] text-white shadow-[0_1px_4px_rgba(0,180,216,0.3)]"
                    : "bg-white text-[#434343] hover:bg-[#F4FBFC]"
                } transition-all duration-150`}
              >
                <div className="flex items-center gap-[6px]">
                  <Icon
                    size="18"
                    color={isActive || isExpanded ? "#FFFFFF" : "#434343"}
                    variant="Bold"
                  />
                  <span
                    className={`${
                      isActive || isExpanded
                        ? "font-semibold text-white"
                        : "font-normal"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {item.children && (
                  <span
                    className={`transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    ▼
                  </span>
                )}
              </button>

              {/* زیرمنوها */}
              {item.children && (
                <div
                  className={`pl-4 pr-2 overflow-hidden transition-all duration-300 ${
                    isExpanded
                      ? "max-h-[500px] opacity-100 mt-[4px]"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive =
                      pathname === child.href ||
                      pathname.startsWith(child.href + "/");

                    return (
                      <a
                        key={child.label}
                        href={child.href}
                        className={`flex items-center gap-[6px] py-[5px] px-[12px] text-[14px] rounded-[8px] transition-colors duration-150 ${
                          childActive
                            ? "bg-[#E0F7FA] text-[#0077B6] font-medium"
                            : "text-[#434343] hover:bg-[#F4FBFC]"
                        }`}
                      >
                        <ChildIcon
                          size="16"
                          color={childActive ? "#0077B6" : "#656565"}
                          variant="Bold"
                        />
                        {child.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
