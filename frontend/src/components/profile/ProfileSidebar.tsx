"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { me, AuthResponse } from "@/lib/api/auth";
import { useQuery } from "@tanstack/react-query";
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
  TruckFast,
  ShoppingCart,
} from "iconsax-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type IconType = typeof Home2;

interface BaseMenuItem {
  label: string;
  icon: IconType;
}

interface LinkMenuItem extends BaseMenuItem {
  href: string;
  children?: SubMenuItem[];
  action?: never;
}

interface ActionMenuItem extends BaseMenuItem {
  action: "logout";
  href?: never;
}

interface SubMenuItem extends BaseMenuItem {
  href: string;
}

type MenuItem = LinkMenuItem | ActionMenuItem;

export default function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { name, role, userId, hydrated, setAuth, clearAuth } = useAuthStore();

  const [expanded, setExpanded] = useState<string | null>(null);
  const toggleExpand = (key: string) =>
    setExpanded((p) => (p === key ? null : key));

  // ✅ React Query بدون ارور (Generic + onSuccess + onError)
  useQuery<AuthResponse>({
    queryKey: ["me"],
    queryFn: me,
    enabled: hydrated && (!userId || !role),
    retry: false,
    onSuccess: (data) => {
      if (data?.user) {
        setAuth({
          role: data.user.role,
          userId: data.user.id,
          name: data.user.name,
          phone: data.user.phone,
        });
      }
    },
    onError: () => {
      clearAuth();
      router.replace("/login");
    },
  });

  // ✅ هوک‌ها صدا زده شدند، حالا رندر مشروط مجازه
  if (!hydrated) return null;
  if (!userId || !role) return null;

  const displayName = name?.trim() ? name : "کاربر محترم";

  const adminMenu: MenuItem[] = [
    { label: "پیشخوان", icon: Home2, href: "/manager/profile" },
    { label: "تاریخچه سفارشات", icon: Bag2, href: "/manager/profile/orders" },
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
        { label: "ویرایش برند", icon: Edit2, href: "/manager/profile/brands/edit" },
      ],
    },
    {
      label: "محصولات",
      icon: Box,
      href: "/manager/profile/products",
      children: [
        { label: "افزودن محصول", icon: Add, href: "/manager/profile/add-product" },
        { label: "ویرایش محصول", icon: Edit2, href: "/manager/profile/edit-product" },
      ],
    },
    { label: "اطلاعات حساب کاربری", icon: User, href: "/manager/profile/account" },
    { label: "خروج", icon: LogoutCurve, action: "logout" },
  ];

  const customerMenu: MenuItem[] = [
    { label: "سفارشات من", icon: Bag2, href: "/customer/orders" },
    { label: "آدرس‌های من", icon: Location, href: "/customer/addresses" },
    { label: "سبد خرید", icon: ShoppingCart, href: "/customer/cart" },
    { label: "اطلاعات حساب کاربری", icon: User, href: "/customer/account" },
    { label: "پیش‌فاکتورها و ارسال‌ها", icon: TruckFast, href: "/customer/shipments" },
    { label: "خروج", icon: LogoutCurve, action: "logout" },
  ];

  const menuItems = role === "ADMIN" ? adminMenu : customerMenu;

  return (
    <aside
      dir="rtl"
      className="w-[310px] bg-white rounded-2xl border border-[#EDEDED] shadow px-4 py-5 mr-[32px] flex flex-col"
    >
      {/* User Info */}
      <div className="text-center mb-4 leading-[160%]">
        <span className="text-[#434343] text-[16px] font-medium">{displayName}</span>
        <span className="text-[#656565] text-[13px] block">
          {role === "ADMIN" ? "مدیر سیستم" : "مشتری فروشگاه"}
        </span>
      </div>

      <hr className="border-[#EDEDED] mb-4" />

      <nav className="flex flex-col gap-[6px]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expanded === item.label;
          const isActive =
            "href" in item &&
            (pathname === item.href || pathname.startsWith(item.href + "/"));

          const handleClick = () => {
            if (item.action === "logout") {
              clearAuth();
              router.replace("/");
              return;
            }
            if ("children" in item && item.children) {
              toggleExpand(item.label);
            } else if ("href" in item) {
              router.push(item.href);
            }
          };

          return (
            <div key={item.label}>
              <button
                onClick={handleClick}
                className={`w-full flex items-center justify-between py-[6px] px-[10px] rounded-[10px] border-b border-[#EDEDED]
                  ${
                    isActive || isExpanded
                      ? "bg-[#00B4D8] text-white shadow"
                      : "bg-white text-[#434343] hover:bg-[#F4FBFC]"
                  }`}
              >
                <div className="flex items-center gap-[6px]">
                  <Icon
                    size="18"
                    color={isActive || isExpanded ? "#FFFFFF" : "#434343"}
                    variant="Bold"
                  />
                  <span>{item.label}</span>
                </div>

                {"children" in item && item.children && (
                  <span
                    className={`transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                )}
              </button>

              {"children" in item && item.children && (
                <div
                  className={`pl-4 pr-2 overflow-hidden transition-all duration-300 ${
                    isExpanded
                      ? "max-h-[500px] opacity-100 mt-[4px]"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {item.children.map((sub) => {
                    const SubIcon = sub.icon;
                    const subActive =
                      pathname === sub.href ||
                      pathname.startsWith(sub.href + "/");

                    return (
                      <button
                        key={sub.label}
                        onClick={() => router.push(sub.href)}
                        className={`flex items-center gap-[6px] py-[5px] px-[12px] text-[14px] rounded-[8px]
                          ${
                            subActive
                              ? "bg-[#E0F7FA] text-[#0077B6] font-medium"
                              : "text-[#434343] hover:bg-[#F4FBFC]"
                          }`}
                      >
                        <SubIcon
                          size="16"
                          color={subActive ? "#0077B6" : "#656565"}
                          variant="Bold"
                        />
                        {sub.label}
                      </button>
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
