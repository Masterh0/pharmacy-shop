import { isAxiosError} from "axios";

/**
 * نوع پاسخ خطا که سرور بازمی‌گرداند.
 * مطابقت دارد با API-backend شما: { message: string; status?: string; statusCode?: number }
 */
export interface ApiErrorResponse {
  message: string;
  status?: string;
  statusCode?: number;
  error?: { message?: string };
  data?: { message?: string };
}

/**
 * استخراج پیام خطای کاربرپسند (معمولاً فارسی) از خطاهای Axios.
 * این تابع در برابر ساختارهای متفاوت response مقاوم است.
 */
export function handleApiError(error: unknown): string {
  // حالت ۱: خطای Axios
  if (isAxiosError<ApiErrorResponse>(error)) {
    const responseData = error.response?.data;

    if (responseData && typeof responseData === "object") {
      const message =
        responseData.message ||
        responseData.error?.message ||
        responseData.data?.message;

      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }

    // اگر هیچ پیام مشخصی نبود ولی status code داریم
    const status = error.response?.status;
    if (status) {
      return `خطایی با کد وضعیت ${status} رخ داده است.`;
    }

    // fallback کلی برای Axios
    return "پاسخی از سرور دریافت نشد.";
  }

  // حالت ۲: خطای عمومی جاوااسکریپت
  if (error instanceof Error) {
    return error.message || "خطایی در اجرای برنامه رخ داده است.";
  }

  // حالت ۳: خطای ناشناخته
  return "خطای ناشناخته‌ای در حین عملیات رخ داد.";
}
