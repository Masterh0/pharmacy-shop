import axios, { AxiosError, AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

type FailedRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  request: AxiosRequestConfig;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(api(p.request));
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,

  async (err: AxiosError) => {
    const originalReq = err.config as AxiosRequestConfig & { _retry?: boolean };
    const status = err.response?.status;
    const url = originalReq?.url ?? "";

    /* ---------------------------
     * ✅ 1️⃣ 400 / 422 = ارورهای فرم و بیزینس
     * --------------------------- */
    if (status === 400 || status === 422) {
      // این‌ها را لاگ نمی‌کنیم چون در UI هندل می‌شوند
      return Promise.reject(err);
    }

    /* ---------------------------
     * ✅ 2️⃣ 401 → تلاش برای رفرش توکن
     * --------------------------- */
    // فقط اگر درخواست اصلی خودش لاگین یا رفرش نبوده وارد پروسه رفرش شو
    if (
      status === 401 &&
      !originalReq._retry &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/refresh")
    ) {
      originalReq._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, request: originalReq });
        });
      }

      isRefreshing = true;

      try {
        await api.post("/auth/refresh");

        isRefreshing = false;
        processQueue(null);

        return api(originalReq);
      } catch (e) {
        isRefreshing = false;
        processQueue(e);

        // ✅ جلوگیری از لوپ: فقط اگر در صفحه لاگین نیستیم ریدایرکت کن
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.replace("/login");
        }

        return Promise.reject(e);
      }
    }

    /* ---------------------------
     * ✅ 3️⃣ مدیریت لاگ‌ها (جلوگیری از اسپم کنسول)
     * --------------------------- */

    // ارورهای ۴۰۱ روی این روت‌ها طبیعی هستند و نباید کنسول را قرمز کنند:
    // 1. refresh: سشن کاربر تمام شده.
    // 2. me: کاربر کلا لاگین نیست (مهمان).
    // 3. login: رمز عبور اشتباه است.
    if (
      status === 401 &&
      (url.includes("/auth/refresh") ||
        url.includes("/auth/me") ||
        url.includes("/auth/login"))
    ) {
      return Promise.reject(err);
    }
    const hasBusinessError =
      err.response?.data &&
      typeof err.response.data === "object" &&
      "error" in err.response.data;

    if (hasBusinessError) {
      return Promise.reject(err);
    }

    // فقط خطاهای واقعی و غیرمنتظره (مثل ۵۰۰ یا قطعی نت) لاگ شوند
    console.error("[API ERROR]", {
      url,
      status,
      message: err.message,
    });

    return Promise.reject(err);
  }
);

export default api;
