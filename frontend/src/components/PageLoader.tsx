// app/components/PageLoader.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function PageLoader({
  message = "در حال بارگذاری...",
  fullScreen = true,
}: PageLoaderProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 z-[9999]"
    : "w-full h-full";

  return (
    <div
      className={`${containerClass} bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 backdrop-blur-sm flex items-center justify-center`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* لوگو با انیمیشن */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* دایره چرخان پشت لوگو */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00B4D8] border-r-[#0096c7]"
            style={{ width: "80px", height: "80px" }}
          />

          {/* لوگو */}
          <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0077B6] flex items-center justify-center shadow-2xl">
            <Image
              src="/pic/headersPic/shopping-cart.svg"
              alt="loading"
              width={40}
              height={40}
              className="brightness-0 invert"
            />
          </div>
        </motion.div>

        {/* متن با انیمیشن */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-[16px] font-semibold text-[#242424] font-IRANYekanX">
            {message}
          </p>

          {/* نقطه‌های چشمک‌زن */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-[#00B4D8]"
              />
            ))}
          </div>
        </motion.div>

        {/* پروگرس بار */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-[#00B4D8] via-[#0096c7] to-[#00B4D8] rounded-full overflow-hidden"
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="h-full w-1/3 bg-white/50 rounded-full"
          />
        </motion.div>
      </div>
    </div>
  );
}
