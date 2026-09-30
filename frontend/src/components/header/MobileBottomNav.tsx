"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home2, ShoppingCart, User } from "iconsax-react";

import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/hooks/useAddToCart";
import { useLoginRequired } from "@/lib/hooks/useLoginRequired";
import LoginRequiredModal from "../modals/LoginRequiredModal";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const { user, isLoading } = useAuth();
  const { cart } = useCart();

  const { showModal, requireLogin, goToLogin, goToSignup, closeModal } =
    useLoginRequired();

  const itemCount =
    cart?.items?.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0,
    ) ?? 0;

  // صفحات ورود و ثبت‌نام
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/signup/");

  // کل فرآیند Checkout
  const isCheckoutPage = pathname.startsWith("/checkout");

  if (isAuthPage || isCheckoutPage) {
    return null;
  }

  const profileHref = user
    ? user.role === "ADMIN"
      ? "/manager/profile"
      : "/profile"
    : "/login";

  const handleCartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // اگر مهمان باشد، Modal باز می‌شود
    if (!requireLogin("/checkout/cart")) {
      e.preventDefault();
    }
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(href + "/");
  };

  const profileActive = user ? isActive(profileHref) : pathname === "/login";

  const cartActive = isActive("/checkout/cart");
  const homeActive = isActive("/");

  return (
    <>
      <nav
        dir="ltr"
        className="
          fixed bottom-0 left-0 right-0
          z-[60]
          lg:hidden
          h-[68px]
          bg-white
          border-t border-[#E5E5E5]
          shadow-[0_-2px_12px_rgba(0,0,0,0.08)]
          flex items-center justify-around
          px-6
          pb-[env(safe-area-inset-bottom)]
        "
      >
        {/* پروفایل / ورود */}
        <Link
          href={profileHref}
          className={`
            flex flex-col items-center justify-center
            gap-1
            min-w-[70px]
            transition-colors
            ${profileActive ? "text-[#00B4D8]" : "text-[#777777]"}
          `}
        >
          <User
            size="25"
            variant={profileActive ? "Bold" : "Outline"}
            color="currentColor"
          />

          <span className="text-[12px] font-medium font-IRANYekanX">
            {isLoading ? "..." : user ? "پروفایل" : "ورود"}
          </span>
        </Link>

        {/* سبد خرید */}
        <Link
          href="/checkout/cart"
          onClick={handleCartClick}
          className={`
            relative
            flex flex-col items-center justify-center
            gap-1
            min-w-[70px]
            transition-colors
            ${cartActive ? "text-[#00B4D8]" : "text-[#777777]"}
          `}
        >
          <div className="relative">
            <ShoppingCart
              size="25"
              variant={cartActive ? "Bold" : "Outline"}
              color="currentColor"
            />

            {itemCount > 0 && (
              <span
                className="
                  absolute
                  -top-2
                  -right-2
                  min-w-[17px]
                  h-[17px]
                  px-1
                  rounded-full
                  bg-[#00B4D8]
                  text-white
                  text-[9px]
                  font-bold
                  flex items-center justify-center
                  border-2 border-white
                "
              >
                {itemCount}
              </span>
            )}
          </div>

          <span className="text-[12px] font-medium font-IRANYekanX">
            سبد خرید
          </span>
        </Link>

        {/* خانه */}
        <Link
          href="/"
          className={`
            flex flex-col items-center justify-center
            gap-1
            min-w-[70px]
            transition-colors
            ${homeActive ? "text-[#00B4D8]" : "text-[#777777]"}
          `}
        >
          <Home2
            size="25"
            variant={homeActive ? "Bold" : "Outline"}
            color="currentColor"
          />

          <span className="text-[12px] font-medium font-IRANYekanX">خانه</span>
        </Link>
      </nav>

      {/* پیام ورود / ثبت‌نام */}
      <LoginRequiredModal
        isOpen={showModal}
        onClose={closeModal}
        onLogin={goToLogin}
        onSignup={goToSignup}
      />
    </>
  );
}
