"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/hooks/useAddToCart";
import { useEffect, useState, useRef } from "react";
import CartPreview from "./CartPreview";
import { useLoginRequired } from "@/lib/hooks/useLoginRequired";
import LoginRequiredModal from "../modals/LoginRequiredModal";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
export default function HeaderActions() {
  const {
    user,
    isLoading,
    showModal,
    requireLogin,
    goToLogin,
    goToSignup,
    closeModal,
  } = useLoginRequired();

  const [navigatingTo, setNavigatingTo] = useState<"login" | "signup" | null>(
    null,
  );
  const pathname = usePathname();
  const { cart } = useCart();

  const itemCount =
    cart?.items?.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0,
    ) ?? 0;

  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);
  useEffect(() => {
    setMounted(true);

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 lg:w-[288px] lg:h-[40px]" />;
  }

  const profileHref = user?.role === "ADMIN" ? "/manager/profile" : "/profile";
  const isOnProfilePage = pathname === profileHref;
  const handleCartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!requireLogin("/checkout/cart")) {
      e.preventDefault();
    }
  };

  const handleAuthNavigation = (
    type: "login" | "signup" | "profile",
    e: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (navigatingTo === type) {
      e.preventDefault();
      return;
    }

    setNavigatingTo(type);
  };

  return (
    <>
      <div
        className="
          flex
          flex-row
          items-center
          justify-between
          gap-3
          lg:w-[288px]
          lg:h-[40px]
        "
      >
        {/* =========================
            🛒 Cart
        ========================== */}

        <div
          className="relative hidden lg:block"
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }

            setIsHovered(true);
          }}
          onMouseLeave={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }

            hoverTimeoutRef.current = setTimeout(() => {
              setIsHovered(false);
            }, 250);
          }}
        >
          <Link
            href="/checkout/cart"
            onClick={handleCartClick}
            className="
              relative
              flex
              h-10
              flex-row-reverse
              items-center
              gap-2
              whitespace-nowrap
              text-[14px]
              font-IRANYekanX
              font-medium
              text-[#434343]
              transition-colors
              duration-200
              hover:text-[#00B4D8]
            "
          >
            <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
              <Image
                src="/pic/headersPic/shopping-cart.svg"
                alt="سبد خرید"
                width={24}
                height={24}
              />

              {itemCount > 0 && (
                <span
                  className="
                    absolute
                    -right-[9px]
                    -top-[8px]
                    z-50
                    flex
                    min-w-[18px]
                    h-[18px]
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white
                    bg-[#90E0EF]
                    px-1
                    text-[10px]
                    font-bold
                    leading-none
                    text-[#242424]
                    shadow-sm
                  "
                >
                  {itemCount}
                </span>
              )}
            </div>

            <span>سبد خرید</span>
          </Link>

          {/* Cart Preview */}
          {itemCount > 0 && (
            <div
              className={`
                absolute
                left-[-70px]
                top-[48px]
                z-50
                w-[360px]
                rounded-xl
                border
                border-gray-100
                bg-white
                shadow-[0_8px_30px_rgba(0,0,0,0.10)]
                transition-all
                duration-200
                ${
                  isHovered
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-2 opacity-0"
                }
              `}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <CartPreview isLoggedIn={!!user} onLoginRequired={requireLogin} />
            </div>
          )}
        </div>

        {/* =========================
            👤 Auth / Profile
        ========================== */}

        {isLoading ? (
          <div
            className="
              h-10
              w-[100px]
              animate-pulse
              rounded-lg
              bg-gray-200
            "
          />
        ) : user ? (
          <Link
            href={profileHref}
            onClick={(e) => {
              if (isOnProfilePage) {
                e.preventDefault();
                return;
              }

              handleAuthNavigation("profile", e);
            }}
            aria-disabled={navigatingTo === "profile"}
            className="
    group
    flex
    h-10
    items-center
    gap-2
    rounded-xl
    px-2
    text-[#083B56]
    transition-all
    duration-200
    hover:bg-[#E8F9FC]
    active:scale-[0.97]
    whitespace-nowrap
  "
          >
            <div
              className="
      relative
      flex
      h-8
      w-8
      shrink-0
      items-center
      justify-center
      overflow-hidden
      rounded-full
      bg-[#E8F9FC]
    "
            >
              {navigatingTo === "profile" ? (
                <Loader2
                  className="
          h-4 w-4
          animate-spin
          text-[#087DA9]
        "
                />
              ) : (
                <Image
                  src="/pic/headersPic/profile-circle-svgrepo-com.svg"
                  alt="پروفایل"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-cover"
                />
              )}
            </div>

            <span className="text-[13px] font-medium lg:text-sm">
              {navigatingTo === "profile" ? "...پروفایل" : "پروفایل"}
            </span>
          </Link>
        ) : (
          <div
            className="
              flex
              h-10
              shrink-0
              flex-row-reverse
              items-center
              gap-2
              text-[13px]
              font-IRANYekanX
              font-medium
              text-[#434343]
              lg:text-[14px]
            "
          >
            {/* Login */}
            <Link
              href="/login"
              onClick={(e) => handleAuthNavigation("login", e)}
              aria-disabled={navigatingTo !== null}
              className="
                flex
                h-8
                min-w-[58px]
                items-center
                justify-center
                gap-1.5
                whitespace-nowrap
                rounded-lg
                px-2
                transition-all
                duration-200
                hover:bg-[#E8F9FC]
                hover:text-[#00B4D8]
                active:scale-[0.97]
              "
            >
              {navigatingTo === "login" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                  <span>در حال ورود</span>
                </>
              ) : (
                "ورود"
              )}
            </Link>

            {/* Divider */}
            <span
              className="
                hidden
                h-4
                w-px
                bg-[#D9E5E8]
                lg:block
              "
            />

            {/* Signup */}
            <Link
              href="/signup"
              onClick={(e) => handleAuthNavigation("signup", e)}
              aria-disabled={navigatingTo !== null}
              className="
                hidden
                h-8
                min-w-[68px]
                items-center
                justify-center
                gap-1.5
                whitespace-nowrap
                rounded-lg
                px-2
                transition-all
                duration-200
                hover:bg-[#E8F9FC]
                hover:text-[#00B4D8]
                active:scale-[0.97]
                lg:flex
              "
            >
              {navigatingTo === "signup" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                  <span>در حال ثبت‌نام</span>
                </>
              ) : (
                "ثبت‌نام"
              )}
            </Link>
          </div>
        )}
      </div>

      {/* =========================
          Login Required Modal
      ========================== */}

      <LoginRequiredModal
        isOpen={showModal}
        onClose={closeModal}
        onLogin={goToLogin}
        onSignup={goToSignup}
      />
    </>
  );
}
