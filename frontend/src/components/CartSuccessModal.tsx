"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface CartSuccessModalProps {
  show: boolean;
  onClose: () => void;
}
console.log("✅ CartSuccessModal mounted!");
export default function CartSuccessModal({ show, onClose }: CartSuccessModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[999] flex justify-center items-center bg-black/30 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-[360px] p-6 flex flex-col items-center gap-5"
          >
            <Image
              src="/pic/cart-success.svg"
              alt="Success"
              width={72}
              height={72}
            />

            <h2 className="text-[#0077B6] text-lg font-bold text-center leading-relaxed">
              محصول با موفقیت به سبد خرید اضافه شد!
            </h2>

            <div className="flex gap-3 mt-2">
              {/* 👇 دکمه رفتن به سبد خرید */}
              <Link
                href="/cart"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white text-sm font-medium shadow-md hover:opacity-90 transition-all duration-200"
              >
                رفتن به سبد خرید
              </Link>

              {/* 👇 دکمه بستن پنل */}
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-[#00B4D8] text-[#0077B6] text-sm font-medium hover:bg-[#E0F7FA] transition-all duration-200"
              >
                بستن
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
