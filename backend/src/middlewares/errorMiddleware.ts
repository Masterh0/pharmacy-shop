// src/middlewares/errorMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

/**
 * Middleware نهایی برای مدیریت و پاسخ‌دهی به خطاها.
 * این تابع باید ۴ آرگومان (err, req, res, next) داشته باشد.
 */
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    // ۱. تعیین کد وضعیت (Status Code)
    // اگر خطا از نوع ApiError باشد، از statusCode خودش استفاده می‌کنیم. در غیر این صورت 500 (خطای سرور).
    const statusCode = err instanceof ApiError ? err.statusCode : 500;

    // ۲. تعیین پیام خطا (Message)
    // اگر خطای عملیاتی باشد، پیام آن را می‌فرستیم. اگر خطای سرور باشد، یک پیام عمومی می‌فرستیم.
    const message = err instanceof ApiError && err.isOperational 
        ? err.message 
        : 'Internal Server Error';

    // ۳. لاگ‌گیری خطا (مهم برای دیباگ)
    console.error('SERVER ERROR:', err);

    // ۴. ارسال پاسخ استاندارد JSON به کلاینت
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        // (اختیاری) در محیط Development استک خطا را برای دیباگ ارسال کنید:
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
