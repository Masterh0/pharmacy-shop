import axios from "axios";
import { useAuthStore } from "@/lib/stores/authStore";

const api = axios.create({
  baseURL: "http://localhost:5000", // بک‌اندت (پورت سرور Node/Express)
  withCredentials: true, // ارسال کوکی‌ها در هر درخواست
});

// 🟩 فقط کنترل خطاهای عمومی و لاگ‌اوت در صورت نیاز
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { logout } = useAuthStore.getState();

    // اگر توکن اکسس منقضی شده، بک‌اند خودش باید با کوکی رفرش آن را رفرش کند.
    // فرانت فقط اگر سرور بگوید "unauthorized" بعد از رفرش، باید logout کند.
    if (error.response?.status === 401) {
      console.warn("⚠️ [API] Unauthorized — clearing user session...");
      logout();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
