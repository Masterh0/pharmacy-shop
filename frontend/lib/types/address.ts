export interface Address {
  id: number;

  /** عنوان آدرس، مثل "خانه" یا "محل کار" */
  /** نام دریافت‌کننده کالا */
  fullName : string;

  /** شماره تلفن، با فرمت نرمال‌سازی شده */
  phone: string;

  /** استان */
  province: string;

  /** شهر */
  city: string;

  /** آدرس کامل (خیابان، کوچه، پلاک) */
  street: string;

  /** کد پستی */
  postalCode: string;

  /** آیا این آدرس پیش‌فرض کاربر است */
  isDefault: boolean;

  /** مختصات موقعیت مکانی (اختیاری) */
  latitude?: number;
  longitude?: number;

  /** تاریخ ایجاد و بروزرسانی */
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string;

  /** شناسه کاربر مالک آدرس */
  userId: number;
}
