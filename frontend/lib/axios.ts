import axios, { AxiosError, AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
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
     * ✅ 1️⃣ 400 / 422 = بیزینسی → سایلنت
     * --------------------------- */
    if (status === 400 || status === 422) {
      // ❌ لاگ نشه
      // ✅ فقط reject بشه تا React Query هندل کنه
      return Promise.reject(err);
    }

    /* ---------------------------
     * ✅ 2️⃣ 401 → Refresh Logic
     * --------------------------- */
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

        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }

        return Promise.reject(e);
      }
    }

    /* ---------------------------
     * ✅ 3️⃣ فقط خطای واقعی لاگ بشه
     * --------------------------- */
    console.error("[API ERROR]", {
      url,
      status,
      message: err.message,
    });

    return Promise.reject(err);
  }
);

export default api;
