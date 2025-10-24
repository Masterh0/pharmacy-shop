/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000", // همون پورتی که سرور بک‌اندت ران می‌شه
        pathname: "/uploads/**", // مسیر پوشه تصاویر
      },
    ],
  },
};

module.exports = nextConfig;
