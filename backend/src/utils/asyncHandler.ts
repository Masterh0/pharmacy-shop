// src/utils/asyncHandler.ts

import { Request, Response, NextFunction } from 'express';

// تعریف نوع (Type) یک تابع کنترلر Express که Promise برمی‌گرداند
type ControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * تابع Higher-Order Function که کنترلر Async را می‌گیرد
 * و آن را در یک Promise می‌پیچد تا هرگونه خطا را به تابع next() ارسال کند.
 * این کار نیاز به try/catch را در تمام کنترلرها حذف می‌کند.
 */
export const asyncHandler = (fn: ControllerFunction) =>
  (req: Request, res: Response, next: NextFunction) => {
    // اجرای تابع کنترلر و Catch کردن هر خطایی که اتفاق بیفتد و ارسال آن به next
    Promise.resolve(fn(req, res, next)).catch(next);
  };
