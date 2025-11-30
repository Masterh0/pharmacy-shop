// /lib/api/axiosClient.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/lib/stores/authStore";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

/* ---------------------------
 * 🧩  Types
 * --------------------------- */
type FailedRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  request: AxiosRequestConfig;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

/* ---------------------------
 * 🧩  Queue Processor
 * --------------------------- */
const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(api(p.request));
  });

  failedQueue = [];
};

/* ---------------------------
 * 🧩  Interceptor
 * --------------------------- */
api.interceptors.response.use(
  (res) => res,

  async (err: AxiosError) => {
    const originalReq = err.config as AxiosRequestConfig & { _retry?: boolean };

    if (err.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;

      // اگر رفرش در حال انجام باشد → صف
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, request: originalReq });
        });
      }

      isRefreshing = true;

      try {
        // تلاش برای رفرش توکن از طریق کوکی HttpOnly
        await api.post("/auth/refresh", {}, { withCredentials: true });

        isRefreshing = false;
        processQueue(null);

        return api(originalReq);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        // logout واقعی سمت بک‌اند (پاک کردن کوکی‌ها)
        try {
          await api.post("/logout", {}, { withCredentials: true });
        } catch (_) {}

        // پاک کردن وضعیت UI
        const { logout } = useAuthStore.getState();
        logout();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        throw refreshError;
      }
    }

    throw err;
  }
);

export default api;
