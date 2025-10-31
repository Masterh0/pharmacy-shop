import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
function normalizePhone(input: string): string {
  if (!input) return "";

  let phone = input.replace(/[\s\-]/g, "").trim(); // حذف فاصله و خط تیره
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("0098")) phone = phone.slice(4);
  else if (phone.startsWith("98")) phone = phone.slice(2);

  if (phone.length === 10 && phone.startsWith("9")) {
    phone = "0" + phone;
  }

  phone = phone.replace(/\D/g, ""); // حذف هر کاراکتر غیر عددی
  return phone;
}
// -------------------
// توليد توکن
// -------------------
async function generateTokens(userId: number, role: string) {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
    { expiresIn: "15m" }
  );

  const refreshToken = uuid();
  const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 روز

  await prisma.refreshToken.create({
    data: { userId, token: refreshToken, expiresAt: refreshExpiry },
  });

  return { accessToken, refreshToken };
}

// -------------------
// ثبت‌نام (CUSTOMER) با OTP
// -------------------
interface RegisterBody {
  name : string;
  email?: string;
  password?: string;
  phone: string;
}

const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const {name, email, password, phone } = req.body;

  if (!phone) return res.status(400).json({ error: "Phone required" });

  try {
    // بررسی وجود کاربر
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: normalizePhone(phone)}] },
    });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    // هش رمز فقط اگر ثبت‌نام سنتی باشد
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // ایجاد کاربر جدید
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email || null,
        phone: phone ,
        password: hashedPassword,
        hasPassword: !!password, // true اگر رمز دارد، false اگر ندارد
        role: "CUSTOMER",
        isVerified: false, // تا قبل از تایید OTP
      },
    });

    // در هر دو حالت، OTP تولید و ذخیره می‌شود (برای تایید شماره)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = new Date(Date.now() + 2 * 60 * 1000); // دو دقیقه اعتبار
    await prisma.otp.create({
      data: { phone: normalizePhone(phone), code, expiresAt: expireAt },
    });

    console.log(`OTP for ${phone}: ${code}`); // فقط برای تست در کنسول

    res.json({
      message:
        "User created successfully. Please verify your phone via OTP before login.",
      userId: user.id,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// -------------------
// تایید OTP ثبت‌نام
// -------------------
const verifyRegisterOtp = async (
  req: Request<{}, {}, { phone: string; code: string }>,
  res: Response
) => {
  const { phone, code } = req.body;

  try {
    // ۱️⃣ پیدا کردن OTP معتبر، فقط اگر استفاده نشده و تاریخش نگذشته
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    // ۲️⃣ بررسی اعتبار
    if (!otpRecord)
      return res.status(400).json({ error: "OTP invalid or expired" });

    // ۳️⃣ علامت زدن به عنوان مصرف‌شده برای همه OTPهای همین شماره تلفن
    await prisma.otp.updateMany({
      where: { phone },
      data: { used: true },
    });

    // ۴️⃣ تایید حساب کاربر
    const user = await prisma.user.update({
      where: { phone },
      data: { isVerified: true },
    });

    // ۵️⃣ تولید Access و Refresh Token
    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.role
    );

    // ۶️⃣ بازگرداندن پاسخ نهایی
    return res.status(200).json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------
// لاگین با پسورد
// -------------------
const login = async (
  req: Request<{}, {}, { identifier: string; password: string }>,
  res: Response
) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "Phone/Email and password required" });
  }

  try {
    // 🔎 یافتن کاربر بر اساس شماره یا ایمیل
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🔒 بررسی وضعیت تأیید شماره
    if (!user.isVerified) {
      return res.status(401).json({ error: "Phone not verified" });
    }

    // ⚙️ بررسی اینکه آیا کاربر اصلاً رمز دارد
    if (!user.hasPassword || !user.password) {
      return res.status(400).json({
        error: "This account has no password. Please login with OTP.",
      });
    }

    // ✅ مقایسه رمز عبور (با اطمینان از string بودن password)
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🎟 تولید توکن‌های دسترسی
    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.role
    );

    // ✅ پاسخ نهایی به فرانت
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// -------------------
// ارسال OTP برای لاگین (بدون پسورد)
// -------------------
 const sendLoginOtp = async (
  req: Request<{}, {}, { phone: string }>,
  res: Response
) => {
  try {
    const { phone } = req.body;

    // ✅ اعتبارسنجی
    if (!/^09\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone format" });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.isVerified)
      return res.status(401).json({ error: "Phone not verified" });

    // ✅ بررسی وجود OTP فعال که هنوز منقضی نشده باشد
    const activeOtp = await prisma.otp.findFirst({
      where: { phone, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (activeOtp) {
      const remainingMs = activeOtp.expiresAt.getTime() - Date.now();
      return res.status(429).json({
        error: "OTP already sent. Please wait.",
        expiresAt: activeOtp.expiresAt,
        remainingMs,
      });
    }

    // 🔁 باطل کردن OTPهای قبلی
    await prisma.otp.updateMany({
      where: { phone, used: false },
      data: { used: true },
    });

    // 🔢 تولید OTP جدید (۶ رقمی)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // اعتبار ۲ دقیقه

    await prisma.otp.create({
      data: { phone, code, expiresAt },
    });

    // ⚠ فقط برای تست (در dev)
    if (process.env.NODE_ENV !== "production")
      console.log(`Login OTP for ${phone}: ${code}`);

    // ✅ بازگردانی اطلاعات به فرانت
    return res.status(200).json({
      message: "OTP sent successfully",
      expiresAt, // تا فرانت بتواند countdown بگذارد
    });
  } catch (error) {
    console.error("sendLoginOtp error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ------------------
// تایید OTP لاگین
// ------------------
 const verifyLoginOtp = async (
  req: Request<{}, {}, { phone: string; code: string }>,
  res: Response
) => {
  try {
    const { phone, code } = req.body;

    // ✅ بررسی صحت شماره تلفن
    if (!/^09\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone format" });
    }

    // ✅ یافتن OTP معتبر (استفاده نشده و منقضی نشده)
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // 🔁 باطل کردن تمام OTPهای همین شماره
    await prisma.otp.updateMany({
      where: { phone },
      data: { used: true },
    });

    // ✅ به‌روزرسانی OTP جاری به عنوان تأییدشده
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { isVerified: true },
    });

    // ✅ تهیه کاربر
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ تولید توکن‌ها
    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.role
    );

    // ✅ پاسخ نهایی
    return res.status(200).json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    console.error("verifyLoginOtp error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// -------------------
// رفرش توکن
// -------------------
const refresh = async (
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response
) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ error: "Refresh token required" });

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!tokenRecord || tokenRecord.expiresAt < new Date())
    return res.status(401).json({ error: "Invalid or expired refresh token" });

  const user = await prisma.user.findUnique({
    where: { id: tokenRecord.userId },
  });
  if (!user) return res.status(401).json({ error: "User not found" });

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
    user.id,
    user.role
  );

  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.json({ accessToken, refreshToken: newRefreshToken });
};

export {
  register,
  verifyRegisterOtp,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  refresh,
};
