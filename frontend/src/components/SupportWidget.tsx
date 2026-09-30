"use client";

import {
  Headset,
  X,
  Phone,
  MessageCircle,
  Instagram,
  ChevronLeft,
  Copy,
  Check,
  Grip,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "behvandi-support-widget-position";

const DESKTOP_BUTTON_SIZE = 56;
const MOBILE_BUTTON_SIZE = 48;

const SCREEN_PADDING = 12;

const DESKTOP_PANEL_WIDTH = 340;
const MOBILE_PANEL_WIDTH = 300;

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [position, setPosition] = useState({
    right: 24,
    bottom: 24,
  });

  const [panelPosition, setPanelPosition] = useState({
    right: 24,
    bottom: 84,
  });

  const widgetRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    startRight: 24,
    startBottom: 24,
  });

  const phoneNumber = "09163182903";

  const whatsappNumber = "989163182903";

  const instagramUrl = "https://instagram.com/drbehvandi_pharmacy";

  // =========================================================
  // Load saved position
  // =========================================================

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (
        typeof parsed?.right !== "number" ||
        typeof parsed?.bottom !== "number"
      ) {
        return;
      }

      setPosition(parsed);
    } catch {
      // Ignore invalid storage
    }
  }, []);

  // =========================================================
  // Save position
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    } catch {
      // Ignore storage errors
    }
  }, [position]);

  // =========================================================
  // Keep button inside viewport
  // =========================================================

  useEffect(() => {
    function keepButtonInside() {
      const buttonSize =
        window.innerWidth < 640 ? MOBILE_BUTTON_SIZE : DESKTOP_BUTTON_SIZE;

      const maxRight = Math.max(
        SCREEN_PADDING,
        window.innerWidth - buttonSize - SCREEN_PADDING,
      );

      const maxBottom = Math.max(
        SCREEN_PADDING,
        window.innerHeight - buttonSize - SCREEN_PADDING,
      );

      setPosition((current) => ({
        right: Math.min(Math.max(current.right, SCREEN_PADDING), maxRight),
        bottom: Math.min(Math.max(current.bottom, SCREEN_PADDING), maxBottom),
      }));
    }

    window.addEventListener("resize", keepButtonInside);

    keepButtonInside();

    return () => {
      window.removeEventListener("resize", keepButtonInside);
    };
  }, []);

  // =========================================================
  // Calculate panel position
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    function calculatePanelPosition() {
      const button = buttonRef.current;

      if (!button) return;

      const panelWidth =
        window.innerWidth < 640 ? MOBILE_PANEL_WIDTH : DESKTOP_PANEL_WIDTH;

      const panel = panelRef.current;

      const panelHeight = panel?.getBoundingClientRect().height ?? 400;

      const buttonRect = button.getBoundingClientRect();

      /*
       * Default:
       * panel opens above the button and aligns
       * its right edge with the button.
       */

      let right = window.innerWidth - buttonRect.right;

      let bottom = window.innerHeight - buttonRect.top + 12;

      // -------------------------------------------------------
      // Horizontal correction
      // -------------------------------------------------------

      const maxRight = window.innerWidth - panelWidth - SCREEN_PADDING;

      /*
       * If panel would go outside the right side,
       * move it left.
       */

      if (right > maxRight) {
        right = maxRight;
      }

      /*
       * Don't allow panel to go outside left side.
       */

      right = Math.max(right, SCREEN_PADDING);

      /*
       * If button is near the left side,
       * make sure panel still fits.
       */

      const left = window.innerWidth - right - panelWidth;

      if (left < SCREEN_PADDING) {
        right = window.innerWidth - panelWidth - SCREEN_PADDING;
      }

      // -------------------------------------------------------
      // Vertical correction
      // -------------------------------------------------------

      const panelTop = window.innerHeight - bottom - panelHeight;

      /*
       * If there isn't enough room above the button,
       * open the panel below the button.
       */

      if (panelTop < SCREEN_PADDING) {
        bottom = window.innerHeight - buttonRect.bottom - 12;
      }

      /*
       * Final vertical correction
       */

      const maxBottom = window.innerHeight - panelHeight - SCREEN_PADDING;

      if (bottom > maxBottom) {
        bottom = maxBottom;
      }

      bottom = Math.max(bottom, SCREEN_PADDING);

      setPanelPosition({
        right,
        bottom,
      });
    }

    /*
     * Wait one frame so the panel has its
     * actual rendered height.
     */

    requestAnimationFrame(calculatePanelPosition);

    window.addEventListener("resize", calculatePanelPosition);

    return () => {
      window.removeEventListener("resize", calculatePanelPosition);
    };
  }, [isOpen, position]);

  // =========================================================
  // Close outside
  // =========================================================

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [isOpen]);

  // =========================================================
  // Escape
  // =========================================================

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // =========================================================
  // Drag
  // =========================================================

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    dragRef.current = {
      isDragging: true,
      hasMoved: false,
      startX: event.clientX,
      startY: event.clientY,
      startRight: position.right,
      startBottom: position.bottom,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragRef.current.isDragging) return;

    const deltaX = event.clientX - dragRef.current.startX;

    const deltaY = event.clientY - dragRef.current.startY;

    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (distance < 6) return;

    dragRef.current.hasMoved = true;

    const buttonSize =
      window.innerWidth < 640 ? MOBILE_BUTTON_SIZE : DESKTOP_BUTTON_SIZE;

    const maxRight = Math.max(
      SCREEN_PADDING,
      window.innerWidth - buttonSize - SCREEN_PADDING,
    );

    const maxBottom = Math.max(
      SCREEN_PADDING,
      window.innerHeight - buttonSize - SCREEN_PADDING,
    );

    const right = Math.min(
      Math.max(dragRef.current.startRight - deltaX, SCREEN_PADDING),
      maxRight,
    );

    const bottom = Math.min(
      Math.max(dragRef.current.startBottom - deltaY, SCREEN_PADDING),
      maxBottom,
    );

    setPosition({
      right,
      bottom,
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragRef.current.isDragging) return;

    const wasDragged = dragRef.current.hasMoved;

    dragRef.current.isDragging = false;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore
    }

    if (!wasDragged) {
      setIsOpen((previous) => !previous);
    }
  }

  // =========================================================
  // Copy phone
  // =========================================================

  async function handleCopyPhone() {
    try {
      await navigator.clipboard.writeText(phoneNumber);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      try {
        const textarea = document.createElement("textarea");

        textarea.value = phoneNumber;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        // Ignore
      }
    }
  }

  return (
    <div
      ref={widgetRef}
      dir="rtl"
      className="fixed inset-0 z-[9999] pointer-events-none"
    >
      {/* =====================================================
          Support Panel
      ====================================================== */}

      <div
        ref={panelRef}
        className={`
          pointer-events-auto
          fixed
          w-[300px]
          max-w-[calc(100vw-24px)]
          overflow-hidden
          rounded-2xl
          border
          border-gray-100
          bg-white
          shadow-[0_12px_45px_rgba(0,0,0,0.15)]
          transition-all
          duration-300
          ease-out
          ${
            isOpen
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible translate-y-3 scale-95 opacity-0"
          }
        `}
        style={{
          right: `${panelPosition.right}px`,
          bottom: `${panelPosition.bottom}px`,
        }}
      >
        {/* Header */}

        <div className="bg-primary px-4 py-3.5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Headset className="h-5 w-5" />

                <h3 className="text-sm font-bold">پشتیبانی  دکتر بهوندی</h3>
              </div>

              <p className="mt-1 text-[11px] leading-5 text-white/85">
                از طریق راه‌های زیر با ما در ارتباط باشید.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="بستن"
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white/10
                hover:bg-white/20
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Options */}

        <div className="space-y-2 p-2.5">
          {/* Phone */}

          <div
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-gray-100
              px-3
              py-2.5
              transition
              hover:bg-primary/5
            "
          >
            <a
              href={`tel:${phoneNumber}`}
              className="flex min-w-0 flex-1 items-center gap-2.5"
            >
              <span
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-primary/10
                  text-primary
                "
              >
                <Phone className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-gray-800">
                  تماس با ما
                </span>

                <span
                  dir="ltr"
                  className="mt-0.5 block text-right text-[11px] text-gray-400"
                >
                  {phoneNumber}
                </span>
              </span>
            </a>

            <button
              type="button"
              onClick={handleCopyPhone}
              aria-label="کپی شماره"
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-gray-50
                text-gray-400
                hover:bg-primary/10
                hover:text-primary
              "
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          {copied && (
            <p className="text-center text-[10px] font-medium text-green-600">
              شماره تماس کپی شد ✓
            </p>
          )}

          {/* WhatsApp */}

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group
              flex
              items-center
              gap-2.5
              rounded-xl
              border
              border-gray-100
              px-3
              py-2.5
              transition
              hover:border-green-200
              hover:bg-green-50
            "
          >
            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-green-50
                text-green-600
                group-hover:bg-green-500
                group-hover:text-white
              "
            >
              <MessageCircle className="h-4 w-4" />
            </span>

            <span className="flex-1">
              <span className="block text-xs font-bold text-gray-800">
                پشتیبانی واتساپ
              </span>

              <span className="mt-0.5 block text-[10px] text-gray-400">
                ارتباط مستقیم با پشتیبانی
              </span>
            </span>

            <ChevronLeft className="h-4 w-4 text-gray-300 group-hover:text-green-500" />
          </a>

          {/* Instagram */}

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group
              flex
              items-center
              gap-2.5
              rounded-xl
              border
              border-gray-100
              px-3
              py-2.5
              transition
              hover:border-pink-200
              hover:bg-pink-50
            "
          >
            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-pink-50
                text-pink-500
                group-hover:bg-pink-500
                group-hover:text-white
              "
            >
              <Instagram className="h-4 w-4" />
            </span>

            <span className="flex-1">
              <span className="block text-xs font-bold text-gray-800">
                اینستاگرام
              </span>

              <span className="mt-0.5 block text-[10px] text-gray-400">
                ارتباط و پشتیبانی
              </span>
            </span>

            <ChevronLeft className="h-4 w-4 text-gray-300 group-hover:text-pink-500" />
          </a>
        </div>

        {/* Footer */}

        <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 text-center">
          <p className="text-[10px] text-gray-400">
            خوشحالیم که کمکتان کنیم 
          </p>
        </div>
      </div>

      {/* =====================================================
          Floating Button
      ====================================================== */}

      <button
        ref={buttonRef}
        type="button"
        aria-label={isOpen ? "بستن پشتیبانی" : "باز کردن پشتیبانی"}
        aria-expanded={isOpen}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="
          pointer-events-auto
          group
          fixed
          flex
          h-12
          w-12
          touch-none
          select-none
          items-center
          justify-center
          rounded-full
          bg-primary
          text-white
          shadow-[0_7px_20px_rgba(0,0,0,0.18)]
          transition-[transform,box-shadow]
          duration-200
          hover:scale-105
          focus:outline-none
          focus:ring-4
          focus:ring-primary/20
          sm:h-14
          sm:w-14
        "
        style={{
          right: `${position.right}px`,
          bottom: `${position.bottom}px`,
        }}
      >
        {!isOpen && (
          <span
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-full
              bg-primary
              opacity-25
              animate-ping
            "
          />
        )}

        <span
          className={`
            relative
            z-10
            transition-transform
            duration-300
            ${isOpen ? "rotate-90" : ""}
          `}
        >
          {isOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Headset className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </span>

        {!isOpen && (
          <span
            className="
              pointer-events-none
              absolute
              -right-1
              -top-1
              hidden
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              border-2
              border-white
              bg-gray-800
              md:flex
              md:opacity-0
              md:transition-opacity
              md:group-hover:opacity-100
            "
          >
            <Grip className="h-3 w-3" />
          </span>
        )}
      </button>
    </div>
  );
}
