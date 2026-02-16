# راهنمای دیپلوی روی Liara

## پیش‌نیاز
- اکانت Liara
- دیتابیس PostgreSQL روی Liara
- اتصال گیت به Liara

---

## ۱. دیپلوی بک‌اند (API)

### ۱.۱ ساخت اپ در پنل Liara
- یک اپ **Node** بساز با نام مثلاً `pharmacy-api`
- گیت رو وصل کن
- **Root Directory** رو روی `backend` بذار (اگر پروژه monorepo است)

### ۱.۲ متغیرهای محیطی (Environment Variables)
در بخش تنظیمات اپ این متغیرها را اضافه کن:

| متغیر | توضیح | مثال |
|-------|-------|------|
| `DATABASE_URL` | ارتباط با دیتابیس PostgreSQL | `postgresql://user:pass@host:5432/dbname` (از پنل دیتابیس Liara کپی کن) |
| `ACCESS_TOKEN_SECRET` | کلید JWT برای access token | یک رشته تصادفی قوی |
| `REFRESH_TOKEN_SECRET` | کلید JWT برای refresh token | یک رشته تصادفی قوی |
| `FRONTEND_URL` | آدرس فرانت‌اند (برای CORS) | مثلاً `https://pharmacy-shop.liara.ir` |

### ۱.۳ پورت
Liara خودش `PORT` را تنظیم می‌کند. در `liara.json` پورت ۳۰۰۰ تنظیم شده؛ Liara با همین کار می‌کند.

### ۱.۴ دیپلوی
- Push به برنچ متصل‌شده
- Liara خودش `npm install` → `prisma migrate deploy` → `npm run build` → `npm start` را اجرا می‌کند

### ۱.۵ آدرس بک‌اند
بعد از دیپلوی، آدرس اپ را یادداشت کن، مثلاً:
`https://pharmacy-api.liara.ir`

---

## ۲. دیپلوی فرانت‌اند (Next.js)

### ۲.۱ ساخت اپ در پنل Liara
- یک اپ **Next.js** بساز با نام مثلاً `pharmacy-shop`
- گیت را وصل کن
- **Root Directory** را روی `frontend` بذار

### ۲.۲ متغیرهای محیطی

| متغیر | توضیح | مثال |
|-------|-------|------|
| `NEXT_PUBLIC_API_URL` | آدرس بک‌اند | `https://pharmacy-api.liara.ir` |
| `NEXT_PUBLIC_BASE_URL` | همان آدرس بک‌اند (برای تصاویر) | `https://pharmacy-api.liara.ir` |

### ۲.۳ تصاویر
در `next.config.ts` دامنه `pharmacy-api.liara.ir` برای `/uploads` اضافه شده است. اگر دامنه API متفاوت است، آن را در config به‌روز کن.

### ۲.۴ دیپلوی
- Push به برنچ متصل‌شده
- Liara build و deploy را انجام می‌دهد

---

## ۳. چک‌لیست نهایی

- [ ] دیتابیس PostgreSQL ساخته و متصل شده
- [ ] مایگریشن‌ها در دیتابیس اجرا شده (`prisma migrate deploy` در build)
- [ ] `DATABASE_URL` در بک‌اند تنظیم شده
- [ ] `ACCESS_TOKEN_SECRET` و `REFRESH_TOKEN_SECRET` در بک‌اند تنظیم شده
- [ ] `FRONTEND_URL` در بک‌اند = آدرس فرانت‌اند
- [ ] `NEXT_PUBLIC_API_URL` و `NEXT_PUBLIC_BASE_URL` در فرانت‌اند = آدرس بک‌اند

---

## نکات

1. **ترتیب دیپلوی**: اول بک‌اند را دیپلوی کن، بعد فرانت‌اند را با آدرس درست API.
2. **دامنه سفارشی**: اگر دامنه داری، آن را در CORS (`FRONTEND_URL`) و در متغیرهای فرانت (`NEXT_PUBLIC_*`) وارد کن.
3. **آپلود تصاویر**: مسیر `uploads` در بک‌اند روی دیسک اپ ذخیره می‌شود؛ در ریستارت اپ داده‌ها از بین می‌روند. برای پروداکشن بهتر است از object storage (مثل Liara Object Storage یا S3) استفاده شود.
