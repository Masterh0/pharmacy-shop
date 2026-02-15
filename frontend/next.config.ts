/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "5000", pathname: "/uploads/**" },
      { protocol: "https", hostname: "pharmacy-api.liara.ir", pathname: "/uploads/**" },
      { protocol: "http", hostname: "pharmacy-api.liara.ir", pathname: "/uploads/**" },
    ],
  },

  // ⛔ نادیده گرفتن ارورهای TypeScript موقع build
  typescript: {
    ignoreBuildErrors: true,
  },

  // ⛔ نادیده گرفتن ارورهای ESLint موقع build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
