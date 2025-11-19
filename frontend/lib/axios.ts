import axios from "axios";
import { useAuthStore } from "./stores/authStore";

// 🟦 ساخت نمونه اصلی Axios
const api = axios.create({
  baseURL: "http://localhost:5000", // آدرس backend خودت
  withCredentials: true, // برای ارسال کوکی‌های HttpOnly اگر داری
});


// 🟩 ۲. بعد از هر پاسخ => بررسی کن اگر JWT منقضی شده، رفرش توکن بگیر
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🟩 ۲. بعد از هر پاسخ => بررسی کن اگر JWT منقضی شده، رفرش توکن بگیر
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // ✨ اینجا logout رو destructure می‌کنیم نه clearTokens
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    // فقط اگر خطای 401 و پیام 'jwt expired' بود، سعی به رفرش می‌کنیم
    if (
      error.response?.status === 401 &&
      error.response?.data?.error === "jwt expired" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // 🌀 درخواست برای دریافت AccessToken جدید با RefreshToken
        const refreshRes = await axios.post(
          "http://localhost:5000/auth/refresh", // آدرس دقیق endpoint رفرش توکن
          { refreshToken }, // اگر RefreshToken در کوکی است، نیازی به body نیست
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data.accessToken;
        const newRefreshToken = refreshRes.data.refreshToken;

        // 🧠 ذخیره‌ی توکن‌های جدید در Zustand و localStorage
        // ✨ نحوه صحیح فراخوانی setTokens با یک شیء
        setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        // هدر درخواست اصلی را آپدیت کن و مجدداً بفرست
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        // اگر RefreshToken هم باطل بود => خروج اجباری کاربر
        // ✨ استفاده از logout
        logout();
        window.location.href = "/login";
      }
    }

    // در سایر خطاها، نرمال reject کن
    return Promise.reject(error);
  }
);

export default api;
