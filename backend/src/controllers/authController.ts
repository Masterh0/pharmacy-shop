import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import crypto from "crypto";
import { CartService } from "../services/cartService";

const cartService = new CartService();

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

/* ------------------ Helper ------------------ */
export default function normalizePhone(input: string): string {
  if (!input) return "";
  let phone = input.replace(/[\s\-]/g, "").trim();
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("0098")) phone = phone.slice(4);
  else if (phone.startsWith("98")) phone = phone.slice(2);
  if (phone.length === 10 && phone.startsWith("9")) phone = "0" + phone;
  phone = phone.replace(/\D/g, "");
  return phone;
}

/**
 * تنظیم کوکی‌های احراز هویت
 *
 * چرا این تنظیمات لازم است؟
 * - Edge و Safari سخت‌گیری بیشتری در Cookie دارند
 * - sameSite: "lax" بهترین تعادل بین امنیت و سازگاری
 * - domain: undefined برای localhost ضروری است
 *
 * @see BROWSER_COMPATIBILITY.md برای جزئیات بیشتر
 */
function sendAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  const isProduction = process.env.NODE_ENV === "production";

  // تنظیمات کوکی برای سازگاری با Edge و تمام مرورگرها
  // این تنظیمات برای سخت‌گیرترین مرورگر (Edge) بهینه شده است
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // در production باید true باشد
    sameSite: "lax" as const, // بهترین تعادل - برای Edge ضروری است
    path: "/",
    domain: undefined, // برای localhost - Edge به این نیاز دارد
  };

  // تنظیم accessToken
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 دقیقه
  });

  // تنظیم refreshToken
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 روز
  });

  // برای Edge: اضافه کردن header اضافی
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

function clearAuthCookies(res: Response) {
  // تنظیمات clearCookie برای سازگاری با تمام مرورگرها
  const clearOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    path: "/",
  };

  res.clearCookie("accessToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);
}

/* ------------------ JWT Generator ------------------ */
async function generateTokens(userId: number, role: string) {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
    { expiresIn: "15m" }
  );

  const refreshToken = uuid();
  const refreshExpiry = new Date(Date.now() + 7 * 86400000);

  await prisma.refreshToken.create({
    data: { userId, token: refreshToken, expiresAt: refreshExpiry },
  });

  return { accessToken, refreshToken };
}

/* ------------------ REGISTER ------------------ */
const register = async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!phone)
    return res.status(400).json({ error: "شماره موبایل الزامی است." });

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: normalizePhone(phone) }] },
    });
    if (existingUser)
      return res
        .status(400)
        .json({ error: "کاربر با این شماره قبلاً ثبت‌نام کرده است." });

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const normalizedPhone = normalizePhone(phone);
    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: normalizedPhone,
        password: hashedPassword,
        hasPassword: !!password,
        role: "CUSTOMER",
        isVerified: false,
      },
    });

    const code = generateOtp();
    const expireAt = new Date(Date.now() + 2 * 60 * 1000);
    await prisma.otp.create({
      data: { phone: normalizedPhone, code, expiresAt: expireAt },
    });

    // OTP sent (in production, send via SMS service)
    console.log(`OTP برای ${normalizedPhone}: ${code}`);

    res.json({
      message: "ثبت‌نام موفقیت‌آمیز بود. لطفاً کد ارسال‌شده را وارد کنید.",
      userId: user.id,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "خطای داخلی سرور رخ داده است." });
  }
};

/* ------------------ VERIFY REGISTER OTP ------------------ */
const verifyRegisterOtp = async (req: Request, res: Response) => {
  const { phone, code } = req.body;
  try {
    const normalizedPhone = normalizePhone(phone);
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone: normalizedPhone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!otpRecord)
      return res
        .status(400)
        .json({ error: "کد تأیید نامعتبر است یا منقضی شده." });

    await prisma.otp.updateMany({
      where: { phone: normalizedPhone },
      data: { used: true },
    });

    const user = await prisma.user.update({
      where: { phone: normalizedPhone },
      data: { isVerified: true },
    });

    // ✅ Merge Guest Cart
    const sessionId = req.cookies.sessionId;

    if (typeof sessionId === "string" && sessionId.trim() !== "") {
      try {
        await cartService.mergeGuestCartToUserCart(sessionId, user.id);
      } catch (mergeError) {
        console.error("Cart merge error (non-blocking):", mergeError);
        // Continue with login even if merge fails
      }

      res.clearCookie("sessionId", {
        httpOnly: false,
        secure: false,
        sameSite: "lax" as const,
        path: "/",
        domain: undefined,
      });
    }

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.role
    );
    sendAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Verify register OTP error:", error);
    return res.status(500).json({ error: "خطای داخلی سرور رخ داده است." });
  }
};

/* ------------------ LOGIN (PASSWORD) ------------------ */
const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password)
    return res.status(400).json({
      error: "شماره موبایل/ایمیل و رمز عبور لازم است.",
    });

  // ✅ جلوگیری از پسورد فارسی
  if (/[\u0600-\u06FF]/.test(password)) {
    return res.status(400).json({
      error: "رمز عبور باید با حروف انگلیسی وارد شود",
    });
  }

  try {
    const normalizedIdentifier = normalizePhone(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: normalizedIdentifier }],
      },
    });

    if (!user)
      return res.status(400).json({
        error: "شماره موبایل یا رمز عبور نادرست است",
      });

    if (!user.isVerified)
      return res.status(401).json({
        error: "شماره موبایل تأیید نشده.",
      });

    if (!user.hasPassword)
      return res.status(400).json({
        error: "این حساب رمز عبور ندارد.",
      });

    const isValid = await bcrypt.compare(password, user.password!);
    if (!isValid)
      return res.status(400).json({
        error: "شماره موبایل یا رمز عبور نادرست است",
      });

    // ✅ Merge Guest Cart
    const sessionId = req.cookies.sessionId;
    if (typeof sessionId === "string" && sessionId.trim()) {
      try {
        await cartService.mergeGuestCartToUserCart(sessionId, user.id);
      } catch (err) {
        console.warn("Cart merge failed (non-blocking)", err);
      }

      res.clearCookie("sessionId", {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        path: "/",
        domain: undefined,
      });
    }

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.role
    );
    sendAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "خطای داخلی سرور.",
    });
  }
};

/* ------------------ SEND LOGIN OTP ------------------ */
const sendLoginOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!/^09\d{9}$/.test(phone))
      return res.status(400).json({ error: "فرمت شماره موبایل صحیح نیست." });

    const normalizedPhone = normalizePhone(phone);
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });
    if (!user) return res.status(404).json({ error: "کاربر یافت نشد." });
    if (!user.isVerified)
      return res.status(401).json({ error: "شماره تأیید نشده." });

    const activeOtp = await prisma.otp.findFirst({
      where: {
        phone: normalizedPhone,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (activeOtp) {
      const remainingMs = activeOtp.expiresAt.getTime() - Date.now();
      // اگر OTP هنوز معتبر است، همان را برگردان
      if (remainingMs > 0) {
        return res.status(429).json({
          error: "کد فعال دارید",
          expiresAt: activeOtp.expiresAt,
          remainingMs,
        });
      }
    }

    // فقط OTP های منقضی شده را mark می‌کنیم
    await prisma.otp.updateMany({
      where: {
        phone: normalizedPhone,
        expiresAt: { lt: new Date() },
      },
      data: { used: true },
    });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60000);
    await prisma.otp.create({
      data: { phone: normalizedPhone, code, expiresAt },
    });

    // OTP sent (in production, send via SMS service)
    console.log(`Login OTP برای ${normalizedPhone}: ${code}`);

    return res.status(200).json({ message: "کد ارسال شد", expiresAt });
  } catch (error) {
    console.error("Send login OTP error:", error);
    return res.status(500).json({ error: "خطای داخلی" });
  }
};

/* ------------------ VERIFY LOGIN OTP ------------------ */
const verifyLoginOtp = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    const normalizedPhone = normalizePhone(phone);

    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone: normalizedPhone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      console.log(
        `OTP verification failed for ${normalizedPhone}: Invalid or expired code`
      );
      return res.status(400).json({ error: "کد اشتباه است." });
    }

    // Mark this specific OTP as used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) return res.status(404).json({ error: "کاربر یافت نشد." });

    // ✅ Merge Guest Cart - این کار را بعد از mark کردن OTP انجام می‌دهیم
    // تا حتی اگر merge با خطا مواجه شود، OTP استفاده شده باشد
    const sessionId = req.cookies?.sessionId || req.body?.sessionId;

    console.log(
      "verifyLoginOtp - sessionId from cookies:",
      req.cookies?.sessionId
    );
    console.log(
      "verifyLoginOtp - all cookies:",
      Object.keys(req.cookies || {})
    );

    if (typeof sessionId === "string" && sessionId.trim() !== "") {
      try {
        await cartService.mergeGuestCartToUserCart(sessionId, user.id);
        console.log("Cart merged successfully for user:", user.id);
      } catch (mergeError: any) {
        console.error(
          "Cart merge error (non-blocking):",
          mergeError?.message || mergeError
        );
        // Continue with login even if merge fails
        // Don't throw - allow login to proceed
      }

      // Clear sessionId cookie regardless of merge success
      // تنظیمات برای Edge
      res.clearCookie("sessionId", {
        httpOnly: false,
        secure: false,
        sameSite: "lax" as const,
        path: "/",
        domain: undefined,
      });
    } else {
      console.log("No sessionId found, skipping cart merge");
    }

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.role
    );
    sendAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error("Verify login OTP error:", error?.message || error);
    // اگر OTP استفاده شده باشد اما خطای دیگری رخ دهد، پیام مناسب بده
    return res.status(500).json({ error: "خطای داخلی" });
  }
};

/* ------------------ REFRESH TOKEN ------------------ */
/* ------------------ REFRESH TOKEN ------------------ */
const refresh = async (req: Request, res: Response) => {
  console.log("🔄 /refresh called");
  // console.log("🍪 cookies:", req.cookies); // برای امنیت در پروداکشن کامنت شود بهتر است

  try {
    const clientRefreshToken = req.cookies?.refreshToken;

    if (!clientRefreshToken) {
      return res.status(401).json({ error: "رفرش‌توکن یافت نشد." });
    }

    // 1. دریافت توکن به همراه اطلاعات کاربر
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: clientRefreshToken },
      include: { user: true }, // ✅ اطلاعات کاربر اینجا گرفته می‌شود
    });

    // 2. اعتبارسنجی توکن
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord) {
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      }
      clearAuthCookies(res); // فرض بر این است که این تابع را دارید
      return res.status(401).json({ error: "نشست کاربری نامعتبر است." });
    }

    // 3. استخراج کاربر از نتیجه قبلی (بدون کوئری اضافه)
    const user = tokenRecord.user;

    // چک کردن اینکه کاربر وجود داشته باشد (برای اطمینان از تایپ اسکریپت و دیتابیس)
    if (!user) {
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      clearAuthCookies(res);
      return res.status(401).json({ error: "کاربر یافت نشد." });
    }

    // 4. تولید توکن‌های جدید (الان متغیر user تعریف شده و در دسترس است)
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
      { expiresIn: "15m" }
    );

    const newRefreshToken = uuid();
    const newRefreshExpiry = new Date(Date.now() + 7 * 86400000);

    // 5. آپدیت توکن در دیتابیس
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: {
        token: newRefreshToken,
        expiresAt: newRefreshExpiry,
      },
    });

    sendAuthCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        // سایر فیلدهای امن که می‌خواهید برگردانید
      },
    });
  } catch (error) {
    console.error("🔥 Refresh token HARD error:", error);
    clearAuthCookies(res);
    return res.status(500).json({ error: "خطای داخلی سرور." });
  }
};

/* ------------------ LOGOUT ------------------ */
const logout = async (req: Request, res: Response) => {
  try {
    const clearOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax" as const,
      path: "/",
    };

    res.clearCookie("accessToken", clearOptions);
    res.clearCookie("refreshToken", clearOptions);
    res.clearCookie("sessionId", {
      httpOnly: false,
      secure: false,
      sameSite: "lax" as const,
      path: "/",
      domain: undefined,
    });
    return res.status(200).json({ message: "خروج موفقیت‌آمیز." });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "خطا در خروج." });
  }
};

/* ------------------ ME ------------------ */
const me = async (req: Request, res: Response) => {
  console.log("🧠 /me called");
  console.log("👤 req.user:", req.user);

  const userPayload = req.user as { id: number; role: string };

  if (!userPayload?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "کاربر یافت نشد." });
  }

  return res.status(200).json({ user });
};

export {
  register,
  verifyRegisterOtp,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  refresh,
  logout,
  me,
};
