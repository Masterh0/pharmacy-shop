// src/utils/ApiError.ts

/**
 * کلاس پایه برای تمام خطاهای عملیاتی (Operational Errors) قابل پیش‌بینی API.
 * خطاهای عملیاتی خطاهایی هستند که سیستم می‌تواند با آن‌ها کنار بیاید و باید پاسخ مناسبی به کاربر بدهد.
 */
export class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean; // نشان می‌دهد که خطا قابل مدیریت است (مانند 400، 404)

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        // این خط مهم است برای اینکه Stack Trace را به درستی بگیریم
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * خطای 404 - منبع پیدا نشد
 */
export class NotFoundError extends ApiError {
    constructor(message: string = "Resource not found") {
        super(message, 404);
    }
}

/**
 * خطای 400 - درخواست نامعتبر (مانند اعتبارسنجی داده‌ها)
 */
export class BadRequestError extends ApiError {
    constructor(message: string = "Invalid data provided or Bad Request") {
        super(message, 400);
    }
}

/**
 * خطای 401 - عدم مجوز (Unauthorized)
 */
export class UnauthorizedError extends ApiError {
    constructor(message: string = "Access denied due to invalid or missing credentials") {
        super(message, 401);
    }
}

// می‌توانید کلاس‌های 403 (Forbidden) و 429 (Too Many Requests) را نیز اضافه کنید.
