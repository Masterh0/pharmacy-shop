/**
 * 📦 brandInput.ts
 * Type definitions for creating or updating Brand entities.
 *
 * هدف: جداسازی نوع داده‌ای که کاربر از طریق فرم به سرور ارسال می‌کند،
 * از نوع کامل Brand که از دیتابیس برمی‌گردد.
 */

export interface CreateBrandDTO {
  name: string;
  slug?: string;
}

export type UpdateBrandDTO = Partial<CreateBrandDTO>;
