# راهنمای سازگاری با مرورگرها

## چرا تنظیمات خاص برای مرورگرهای مختلف لازم است؟

### 1. تفاوت در Cookie Settings
مرورگرهای مختلف رفتار متفاوتی با کوکی‌ها دارند:
- **Chrome**: سخت‌گیری کمتر، کوکی‌ها را راحت‌تر می‌پذیرد
- **Edge**: سخت‌گیری بیشتر، نیاز به تنظیمات دقیق‌تر دارد
- **Firefox**: رفتار متفاوت با `sameSite` attribute
- **Safari**: محدودیت‌های بیشتر برای third-party cookies

### 2. تفاوت در CORS
- **Edge**: نیاز به headers بیشتر و تنظیمات دقیق‌تر
- **Chrome**: سخت‌گیری کمتر در CORS
- **Safari**: محدودیت‌های بیشتر

### 3. تنظیمات بهینه برای همه مرورگرها

#### Cookie Settings:
```typescript
{
  httpOnly: true,        // امنیت بیشتر
  secure: false,         // در dev - در production باید true باشد
  sameSite: "lax",      // بهترین تعادل بین امنیت و سازگاری
  path: "/",            // دسترسی در تمام مسیرها
  domain: undefined,     // برای localhost
}
```

#### CORS Settings:
```typescript
{
  origin: function (origin, callback) {
    // بررسی دقیق origin
  },
  credentials: true,     // اجازه ارسال کوکی‌ها
  methods: [...],        // تمام متدهای لازم
  allowedHeaders: [...], // تمام headers لازم
  exposedHeaders: [...], // headers قابل دسترسی
}
```

## Best Practices

1. **همیشه تنظیمات را برای سخت‌گیرترین مرورگر (Edge/Safari) بهینه کنید**
2. **از `sameSite: "lax"` استفاده کنید** - بهترین تعادل
3. **همیشه `domain: undefined` برای localhost**
4. **در production از `secure: true` استفاده کنید**
5. **همیشه `withCredentials: true` در frontend**

## منابع
- [MDN: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

