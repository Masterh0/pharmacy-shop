import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-bakend.liara.run/",
  withCredentials: true,
});

type RetryConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

type UnauthorizedReason = "SESSION_EXPIRED" | "LOGOUT";

type UnauthorizedHandler = (reason: UnauthorizedReason) => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  onUnauthorized = handler;
};
let onRefreshSuccess: (() => void) | null = null;

export const setRefreshSuccessHandler = (fn: (() => void) | null) => {
  onRefreshSuccess = fn;
};
/**
 * فقط یک refresh در کل برنامه می‌تواند در حال انجام باشد.
 */
let refreshPromise: Promise<void> | null = null;

/**
 * برای جاهایی مثل cart:
 * اگر refresh در حال انجام است، صبر کن تا تمام شود.
 */
export const waitForAuthRefresh = async () => {
  if (refreshPromise) {
    await refreshPromise;
  }
};

const isAuthRoute = (url: string) => {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/forgot-password")
  );
};
const isClientError = (status?: number) => {
  return !!status && status >= 400 && status < 500;
};

const isServerError = (status?: number) => {
  return !!status && status >= 500;
};
const doRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh")
      .then(() => {
        onRefreshSuccess?.();
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

/**
 * اگر refresh در حال انجام است، requestهای جدید
 * قبل از ارسال صبر می‌کنند.
 */
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const url = config.url ?? "";

  // خود refresh نباید منتظر خودش بماند
  if (url.includes("/auth/refresh")) {
    return config;
  }

  if (refreshPromise) {
    try {
      await refreshPromise;
    } catch {
      // اگر refresh شکست خورد، request اصلی
      // توسط response interceptor تعیین تکلیف می‌شود.
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = originalRequest.url ?? "";

    // -------------------------
    // 400 / 422
    // -------------------------

    if (status === 400 || status === 422) {
      return Promise.reject(error);
    }

    // -------------------------
    // 401
    // -------------------------

    if (status === 401 && !originalRequest._retry && !isAuthRoute(url)) {
      originalRequest._retry = true;

      try {
        await doRefresh();

        return api(originalRequest);
      } catch (refreshError) {

        onUnauthorized?.("SESSION_EXPIRED");

        return Promise.reject(refreshError);
      }
    }

    // -------------------------
    // 401 refresh
    // -------------------------

    if (status === 401 && url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // -------------------------
    // 401 auth routes
    // -------------------------

    if (
      status === 401 &&
      (url.includes("/auth/me") ||
        url.includes("/auth/login") ||
        url.includes("/auth/register"))
    ) {
      return Promise.reject(error);
    }

    // -------------------------
    // Business errors
    // -------------------------

    const hasBusinessError =
      error.response?.data &&
      typeof error.response.data === "object" &&
      "error" in error.response.data;

    if (hasBusinessError) {
      return Promise.reject(error);
    }

    // -------------------------
    // 404
    // -------------------------

    if (status === 404) {
      console.error("[API 404]", {
        url,
        message: error.message,
      });

      return Promise.reject(error);
    }

    // -------------------------
    // 500+
    // -------------------------

    if (status && status >= 500) {
      console.error("[API SERVER ERROR]", {
        url,
        status,
        message: error.message,
      });

      return Promise.reject(error);
    }

    // -------------------------
    // Network / unknown
    // -------------------------

    console.error("[API ERROR]", {
      url,
      status,
      message: error.message,
    });

    return Promise.reject(error);
  },
);

export default api;
