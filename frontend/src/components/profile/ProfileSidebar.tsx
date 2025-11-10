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
  TruckFast,
  ShoppingCart,
} from "iconsax-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

/* ---------------- Types ------------------ */
type IconType = typeof Home2;

interface BaseMenuItem {
  label: string;
  icon: IconType;
}

interface LinkMenuItem extends BaseMenuItem {
  href: string;
  action?: never;
  children?: SubMenuItem[];
}

interface ActionMenuItem extends BaseMenuItem {
  action: "logout";
  href?: never;
  children?: never;
}

interface SubMenuItem extends BaseMenuItem {
  href: string;
}

type MenuItem = LinkMenuItem | ActionMenuItem;

/* ---------------- Component ------------------ */
export default function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { name, role, accessToken, logout } = useAuthStore();

  const [expanded, setExpanded] = useState<string | null>(null);
  const toggleExpand = (key: string) => setExpanded(expanded === key ? null : key);

  // 🚨 برای جلوگیری از دسترسی بدون لاگین
  useEffect(() => {
    if (!accessToken || !role) router.replace("/login");
  }, [accessToken, role, router]);

  if (!accessToken || !role) return null;

  /* -------------- منوهای مختلف -------------- */

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

  const displayName = name?.trim() && name !== "null" ? name : "کاربر محترم";
  const showCompleteProfilePrompt = !name?.trim() || name === "null";

  /* ---------------- Render ------------------ */
  return (
    <aside
      dir="rtl"
      lang="fa"
      className="w-[310px] bg-white rounded-2xl border border-[#EDEDED] shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-4 py-5 mr-[32px] flex flex-col self-start"
    >
      {/* اطلاعات کاربر */}
      <div className="flex flex-col text-center mb-4 leading-[160%]">
        <span className="text-[#434343] text-[16px] font-medium">{displayName}</span>
        <span className="text-[#656565] text-[13px]">
          {role === "ADMIN" ? "مدیر سیستم" : "مشتری فروشگاه"}
        </span>

        {showCompleteProfilePrompt && (
          <button
            onClick={() =>
              router.push(role === "ADMIN" ? "/manager/profile/account" : "/customer/account")
            }
            className="mt-2 text-[13px] text-[#00B4D8] hover:text-[#0077B6] underline underline-offset-2"
          >
            جهت تکمیل اطلاعاتتان کلیک کنید
          </button>
        )}
      </div>

      <div className="w-full h-[1px] bg-[#EDEDED] mb-4" />

      {/* منو */}
      <nav className="flex flex-col gap-[6px]">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href + "/") && item.href !== "/profile");
          const isExpanded = expanded === item.label;
          const Icon = item.icon;

          const handleClick = () => {
            if (item.action === "logout") {
              logout();
              router.replace("/");
              return;
            }
            if (item.children) toggleExpand(item.label);
            else if (item.href) router.push(item.href);
          };

          return (
            <div key={item.label}>
              <button
                onClick={handleClick}
                className={`w-full flex items-center justify-between py-[6px] px-[10px] border-b border-[#EDEDED] text-[15px]
                ${
                  isActive || isExpanded
                    ? "bg-[#00B4D8] rounded-[10px] text-white shadow-[0_1px_4px_rgba(0,180,216,0.3)]"
                    : "bg-white text-[#434343] hover:bg-[#F4FBFC]"
                } transition-all duration-150`}
              >
                <div className="flex items-center gap-[6px]">
                  <Icon size="18" color={isActive || isExpanded ? "#FFFFFF" : "#434343"} variant="Bold" />
                  <span
                    className={`${
                      isActive || isExpanded ? "font-semibold text-white" : "font-normal"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {item.children && (
                  <span className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                )}
              </button>

              {/* زیرمنو */}
              {item.children && (
                <div
                  className={`pl-4 pr-2 overflow-hidden transition-all duration-300 ${
                    isExpanded ? "max-h-[500px] opacity-100 mt-[4px]" : "max-h-0 opacity-0"
                  }`}
                >
                  {item.children.map((sub) => {
                    const SubIcon = sub.icon;
                    const subActive = pathname === sub.href || pathname.startsWith(sub.href + "/");

                    return (
                      <button
                        key={sub.label}
                        onClick={() => router.push(sub.href)}
                        className={`flex items-center gap-[6px] py-[5px] px-[12px] text-[14px] rounded-[8px] transition-colors duration-150 ${
                          subActive
                            ? "bg-[#E0F7FA] text-[#0077B6] font-medium"
                            : "text-[#434343] hover:bg-[#F4FBFC]"
                        }`}
                      >
                        <SubIcon size="16" color={subActive ? "#0077B6" : "#656565"} variant="Bold" />
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
