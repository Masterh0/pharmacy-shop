export interface Address {
  id: number;

  /** نام دریافت‌کننده کالا */
  fullName: string;

  /** شماره تلفن، با فرمت نرمال‌سازی شده */
  phone: string;

  /** استان (اختیاری در schema) */
  province?: string | null;

  /** شهر */
  city: string;

  /** آدرس کامل (خیابان، کوچه، پلاک) */
  street: string;

  /** کد پستی (اختیاری در schema) */
  postalCode?: string | null;

  /** آیا این آدرس پیش‌فرض کاربر است */
  isDefault: boolean;

  /** مختصات موقعیت مکانی (lat در schema) */
  lat?: number | null;

  /** مختصات موقعیت مکانی (lng در schema) */
  lng?: number | null;

  /** تاریخ ایجاد و بروزرسانی */
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string;

  /** شناسه کاربر مالک آدرس */
  userId: number;
}
