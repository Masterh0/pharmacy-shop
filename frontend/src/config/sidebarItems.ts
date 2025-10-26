// src/config/sidebarItems.ts

export const sidebarItems = {
  user: [
    { id: 1, label: "پیشخوان", icon: "home", path: "/profile/dashboard" },
    {
      id: 2,
      label: "تاریخچه سفارشات",
      icon: "activity",
      path: "/profile/orders",
    },
    {
      id: 3,
      label: "آدرس‌ها",
      icon: "location-minus",
      path: "/profile/addresses",
    },
    { id: 4, label: "محصولات", icon: "box", path: "/profile/products" },
    {
      id: 5,
      label: "اطلاعات حساب کاربری",
      icon: "user",
      path: "/profile/account",
    },
    { id: 6, label: "خروج", icon: "logout", path: "/logout" },
  ],
  admin: [
    {
      id: 1,
      label: "داشبورد مدیریت",
      icon: "chart-square",
      path: "/admin/dashboard",
    },
    { id: 2, label: "مدیریت محصولات", icon: "box", path: "/admin/products" },
    { id: 3, label: "مدیریت کاربران", icon: "user", path: "/admin/users" },
    { id: 4, label: "گزارش‌ها", icon: "activity", path: "/admin/reports" },
    { id: 5, label: "تنظیمات", icon: "setting-2", path: "/admin/settings" },
    { id: 6, label: "خروج", icon: "logout", path: "/logout" },
  ],
};
