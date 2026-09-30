import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import crypto from "crypto";
import { CartService } from "../services/cartService";
import { OtpPurpose } from "@prisma/client";

const cartService = new CartService();

const generateOtp = () => crypto.randomInt(100000, 999999).toString();
function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length === 0) {
    return "رمز عبور الزامی است.";
  }

  // حداقل ۶ کاراکتر
  if (password.length < 6) {
    return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
  }

  // بدون فاصله
  if (/\s/.test(password)) {
    return "رمز عبور نباید شامل فاصله باشد.";
  }

  // فقط حروف انگلیسی، اعداد انگلیسی و علامت‌های مجاز
  if (!/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]+$/.test(password)) {
    return "رمز عبور فقط می‌تواند شامل حروف انگلیسی، اعداد انگلیسی و علامت‌های خاص باشد.";
  }

  // حداقل یک حرف انگلیسی
  if (!/[A-Za-z]/.test(password)) {
    return "رمز عبور باید حداقل شامل یک حرف انگلیسی باشد.";
  }

  // حداقل یک عدد انگلیسی
  if (!/[0-9]/.test(password)) {
    return "رمز عبور باید حداقل شامل یک عدد باشد.";
  }

  return null;
}
/* ------------------ Helper: Normalize Phone ------------------ */
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

/* ------------------ Cookie Helpers ------------------ */
function sendAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.setHeader("Access-Control-Allow-Credentials", "true");
}

function clearAuthCookies(res: Response) {
  const isProduction = process.env.NODE_ENV === "production";

  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
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
    { expiresIn: "15m" },
  );

  const refreshToken = uuid();
  const refreshExpiry = new Date(Date.now() + 7 * 86400000);

  await prisma.refreshToken.create({
    data: { userId, token: refreshToken, expiresAt: refreshExpiry },
  });

  return { accessToken, refreshToken };
}

/* ===========================================================================
 * 1. REGISTER
 * =========================================================================== */
const register = async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      error: "شماره موبایل الزامی است.",
    });
  }

  if (password) {
    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({
        error: passwordError,
      });
    }
  }

  try {
    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail =
      typeof email === "string" && email.trim()
        ? email.trim().toLowerCase()
        : null;

    /*
     * پیدا کردن کاربر بر اساس شماره یا ایمیل
     */
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ],
      },
    });

    /*
     * اگر User وجود دارد
     */
    if (existingUser) {
      /*
       * اگر قبلاً کاملاً تأیید شده:
       * ثبت‌نام مجدد مجاز نیست.
       */
      if (existingUser.isVerified) {
        return res.status(400).json({
          error: "کاربر با این شماره یا ایمیل قبلاً ثبت‌نام کرده است.",
        });
      }

      /*
       * User وجود دارد ولی هنوز OTP را تأیید نکرده.
       *
       * اگر ایمیل جدید متعلق به یک User دیگر باشد،
       * نباید آن را overwrite کنیم.
       */
      if (normalizedEmail && normalizedEmail !== existingUser.email) {
        const emailOwner = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (emailOwner && emailOwner.id !== existingUser.id) {
          return res.status(400).json({
            error: "این ایمیل قبلاً ثبت شده است.",
          });
        }
      }

      /*
       * اگر شماره‌ای که Register شده متعلق به User دیگری باشد
       * این حالت به خاطر unique بودن phone عملاً نباید رخ دهد،
       * ولی بررسی برای اطمینان.
       */
      if (existingUser.phone !== normalizedPhone) {
        const phoneOwner = await prisma.user.findUnique({
          where: { phone: normalizedPhone },
        });

        if (phoneOwner && phoneOwner.id !== existingUser.id) {
          return res.status(400).json({
            error: "این شماره موبایل قبلاً ثبت شده است.",
          });
        }
      }

      /*
       * ساخت Password جدید در صورت ارسال
       */
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;

      /*
       * استفاده مجدد از همان User
       *
       * هنوز unverified باقی می‌ماند.
       */
      const user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...(name !== undefined && { name }),
          ...(normalizedEmail !== null && {
            email: normalizedEmail,
          }),
          ...(password !== undefined &&
            password !== "" && {
              password: hashedPassword,
              hasPassword: true,
            }),
          isVerified: false,
        },
      });

      /*
       * OTPهای قبلی Register باطل شوند
       */
      await prisma.otp.updateMany({
        where: {
          phone: normalizedPhone,
          purpose: OtpPurpose.REGISTER,
          used: false,
        },
        data: {
          used: true,
        },
      });

      /*
       * OTP جدید
       */
      const code = generateOtp();
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

      await prisma.otp.create({
        data: {
          phone: normalizedPhone,
          codeHash,
          purpose: OtpPurpose.REGISTER,
          expiresAt,
        },
      });

      console.log(`Register OTP برای ${normalizedPhone}: ${code}`);

      return res.status(200).json({
        message: "حساب شما هنوز تأیید نشده است. کد تأیید جدید ارسال شد.",
        userId: user.id,
      });
    }

    /*
     * User اصلاً وجود ندارد
     */
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        hasPassword: !!password,
        role: "CUSTOMER",
        isVerified: false,
      },
    });

    /*
     * ساخت OTP
     */
    const code = generateOtp();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await prisma.otp.create({
      data: {
        phone: normalizedPhone,
        codeHash,
        purpose: OtpPurpose.REGISTER,
        expiresAt,
      },
    });

    console.log(`Register OTP برای ${normalizedPhone}: ${code}`);

    return res.status(201).json({
      message: "ثبت‌نام اولیه انجام شد. کد تأیید ارسال گردید.",
      userId: user.id,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      error: "خطای داخلی سرور رخ داده است.",
    });
  }
};

/* ===========================================================================
 * 2. VERIFY REGISTER OTP
 * =========================================================================== */
const verifyRegisterOtp = async (req: Request, res: Response) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({
      error: "شماره موبایل و کد الزامی است.",
    });
  }

  try {
    const normalizedPhone = normalizePhone(phone);

    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone: normalizedPhone,
        purpose: OtpPurpose.REGISTER,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        error: "کد تأیید نامعتبر است یا منقضی شده.",
      });
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });

      return res.status(400).json({
        error: "تعداد دفعات تلاش مجاز به پایان رسیده است.",
      });
    }

    const isMatch = await bcrypt.compare(code, otpRecord.codeHash);

    if (!isMatch) {
      const newAttempts = otpRecord.attempts + 1;

      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: {
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
          ...(newAttempts >= otpRecord.maxAttempts && {
            used: true,
          }),
        },
      });

      return res.status(400).json({
        error: "کد تأیید نادرست است.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "کاربر یافت نشد.",
      });
    }

    /*
     * OTP مصرف شود
     */
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    /*
     * تأیید واقعی حساب
     */
    const verifiedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
      },
    });

    // Merge Guest Cart
    const sessionId = req.cookies?.sessionId || req.body?.sessionId;

    if (typeof sessionId === "string" && sessionId.trim() !== "") {
      try {
        await cartService.mergeGuestCartToUserCart(sessionId, verifiedUser.id);
      } catch (mergeError) {
        console.error("Cart merge error (non-blocking):", mergeError);
      }

      const isProduction = process.env.NODE_ENV === "production";

      res.clearCookie("sessionId", {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      });
    }

    /*
     * فقط بعد از Verify موفق Token بده
     */
    const { accessToken, refreshToken } = await generateTokens(
      verifiedUser.id,
      verifiedUser.role,
    );

    sendAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      user: verifiedUser,
    });
  } catch (error) {
    console.error("Verify register OTP error:", error);

    return res.status(500).json({
      error: "خطای داخلی سرور رخ داده است.",
    });
  }
};

/* ===========================================================================
 * 3. LOGIN (PASSWORD)
 * =========================================================================== */
const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      error: "شماره موبایل/ایمیل و رمز عبور لازم است.",
    });
  }

  if (/[\u0600-\u06FF]/.test(password)) {
    return res.status(400).json({
      error: "رمز عبور باید با حروف انگلیسی وارد شود.",
    });
  }

  try {
    const normalizedIdentifier = normalizePhone(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.trim().toLowerCase() },
          { phone: normalizedIdentifier },
        ],
      },
    });

    /*
     * User یا Password وجود ندارد
     */
    if (!user || !user.password) {
      return res.status(400).json({
        error: "شماره موبایل یا رمز عبور نادرست است.",
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        error: "حساب کاربری غیرفعال است.",
      });
    }
    /*
     * اول Password را بررسی کن
     */
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(400).json({
        error: "شماره موبایل یا رمز عبور نادرست است.",
      });
    }

    /*
     * Password درست است ولی شماره هنوز تأیید نشده
     */
    if (!user.isVerified) {
      /*
       * OTPهای Login قبلی باطل شوند
       */
      await prisma.otp.updateMany({
        where: {
          phone: user.phone,
          purpose: OtpPurpose.LOGIN,
          used: false,
        },
        data: {
          used: true,
        },
      });

      /*
       * OTP جدید
       */
      const code = generateOtp();
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

      await prisma.otp.create({
        data: {
          phone: user.phone,
          codeHash,
          purpose: OtpPurpose.LOGIN,
          expiresAt,
        },
      });

      console.log(`Login OTP برای ${user.phone}: ${code}`);

      return res.status(200).json({
        requiresVerification: true,
        message: "شماره موبایل شما هنوز تأیید نشده است. کد تأیید ارسال شد.",
        phone: user.phone,
        expiresAt,
      });
    }

    /*
     * کاربر Verified است → Login عادی
     */

    // Merge Guest Cart
    const sessionId = req.cookies?.sessionId || req.body?.sessionId;

    if (typeof sessionId === "string" && sessionId.trim()) {
      try {
        await cartService.mergeGuestCartToUserCart(sessionId, user.id);
      } catch (err) {
        console.warn("Cart merge failed (non-blocking)", err);
      }

      const isProduction = process.env.NODE_ENV === "production";

      res.clearCookie("sessionId", {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.role,
    );

    sendAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: "خطای داخلی سرور.",
    });
  }
};

/* ===========================================================================
 * 4. SEND LOGIN OTP
 * =========================================================================== */
const sendLoginOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!/^09\d{9}$/.test(phone)) {
      return res.status(400).json({
        error: "فرمت شماره موبایل صحیح نیست.",
      });
    }

    const normalizedPhone = normalizePhone(phone);

    const user = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "کاربری با این شماره یافت نشد.",
      });
    }

    /*
     * چه Verified باشد چه نباشد،
     * اگر User وجود دارد می‌توانیم OTP بفرستیم.
     */

    const activeOtp = await prisma.otp.findFirst({
      where: {
        phone: normalizedPhone,
        purpose: OtpPurpose.LOGIN,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (activeOtp) {
      const remainingMs = activeOtp.expiresAt.getTime() - Date.now();

      if (remainingMs > 0) {
        return res.status(429).json({
          error: "کد ورود قبلاً ارسال شده و هنوز معتبر است.",
          expiresAt: activeOtp.expiresAt,
          remainingMs,
        });
      }
    }

    /*
     * OTPهای قبلی Login باطل شوند
     */
    await prisma.otp.updateMany({
      where: {
        phone: normalizedPhone,
        purpose: OtpPurpose.LOGIN,
        used: false,
      },
      data: {
        used: true,
      },
    });

    const code = generateOtp();
    const codeHash = await bcrypt.hash(code, 10);

    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await prisma.otp.create({
      data: {
        phone: normalizedPhone,
        codeHash,
        purpose: OtpPurpose.LOGIN,
        expiresAt,
      },
    });

    console.log(`Login OTP برای ${normalizedPhone}: ${code}`);

    return res.status(200).json({
      message: "کد تأیید ارسال شد.",
      expiresAt,
    });
  } catch (error) {
    console.error("Send login OTP error:", error);

    return res.status(500).json({
      error: "خطای داخلی سرور.",
    });
  }
};

/* ===========================================================================
 * 5. VERIFY LOGIN OTP
 * =========================================================================== */
const verifyLoginOtp = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        error: "شماره موبایل و کد ورود الزامی است.",
      });
    }

    const normalizedPhone = normalizePhone(phone);

    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone: normalizedPhone,
        purpose: OtpPurpose.LOGIN,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        error: "کد نامعتبر است یا منقضی شده.",
      });
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await prisma.otp.update({
        where: {
          id: otpRecord.id,
        },
        data: {
          used: true,
        },
      });

      return res.status(400).json({
        error: "تعداد دفعات تلاش مجاز به پایان رسیده است.",
      });
    }

    const isMatch = await bcrypt.compare(code, otpRecord.codeHash);

    if (!isMatch) {
      const newAttempts = otpRecord.attempts + 1;

      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: {
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
          ...(newAttempts >= otpRecord.maxAttempts && {
            used: true,
          }),
        },
      });

      return res.status(400).json({
        error: "کد وارد شده اشتباه است.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "کاربر یافت نشد.",
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        error: "حساب کاربری غیرفعال است.",
      });
    }
    /*
     * OTP مصرف شود
     */
    await prisma.otp.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    /*
     * اینجا نقطه‌ای است که مالکیت شماره تأیید شده
     */
    const verifiedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
      },
    });

    /*
     * Merge Guest Cart
     */
    const sessionId = req.cookies?.sessionId || req.body?.sessionId;

    if (typeof sessionId === "string" && sessionId.trim() !== "") {
      try {
        await cartService.mergeGuestCartToUserCart(sessionId, verifiedUser.id);
      } catch (mergeError) {
        console.error("Cart merge error (non-blocking):", mergeError);
      }

      const isProduction = process.env.NODE_ENV === "production";

      res.clearCookie("sessionId", {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      });
    }

    /*
     * حالا Login کامل است
     */
    const { accessToken, refreshToken } = await generateTokens(
      verifiedUser.id,
      verifiedUser.role,
    );

    sendAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      user: verifiedUser,
    });
  } catch (error) {
    console.error("Verify login OTP error:", error);

    return res.status(500).json({
      error: "خطای داخلی سرور.",
    });
  }
};

/* ===========================================================================
 * 6. REFRESH TOKEN
 * =========================================================================== */
const refresh = async (req: Request, res: Response) => {
  try {
    const clientRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!clientRefreshToken) {
      return res.status(401).json({ error: "رفرش‌توکن یافت نشد." });
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: clientRefreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord) {
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      }
      clearAuthCookies(res);
      return res.status(401).json({ error: "نشست کاربری نامعتبر است." });
    }

    const user = tokenRecord.user;
    if (!user) {
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      clearAuthCookies(res);
      return res.status(401).json({ error: "کاربر یافت نشد." });
    }
    if (!user.isActive) {
      return res.status(403).json({
        error: "حساب کاربری غیرفعال است.",
      });
    }
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
      { expiresIn: "15m" },
    );

    const newRefreshToken = uuid();
    const newRefreshExpiry = new Date(Date.now() + 7 * 86400000);

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
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    clearAuthCookies(res);
    return res.status(500).json({ error: "خطای داخلی سرور." });
  }
};

/* ===========================================================================
 * 7. LOGOUT
 * =========================================================================== */
const logout = async (req: Request, res: Response) => {
  try {
    const clientRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;
    if (clientRefreshToken) {
      await prisma.refreshToken
        .deleteMany({
          where: { token: clientRefreshToken },
        })
        .catch(() => {});
    }

    clearAuthCookies(res);

    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("sessionId", {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({ message: "خروج موفقیت‌آمیز بود." });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "خطا در خروج." });
  }
};

/* ===========================================================================
 * 8. ME
 * =========================================================================== */
const me = async (req: Request, res: Response) => {
  try {
    const userPayload = req.user;

    if (!userPayload?.id) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        birthday: true,
        hasPassword: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "کاربر یافت نشد." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ error: "خطای داخلی سرور." });
  }
};

/* ===========================================================================
 * 9. UPDATE PROFILE
 * =========================================================================== */
const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { name, email, birthday } = req.body;

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (existingUser) {
        return res.status(400).json({ error: "این ایمیل قبلاً ثبت شده است." });
      }
    }

    let birthdayDate: Date | undefined = undefined;
    if (birthday) {
      const parsed = new Date(birthday);
      if (!isNaN(parsed.getTime())) {
        birthdayDate = parsed;
      } else {
        return res.status(400).json({ error: "فرمت تاریخ تولد نامعتبر است." });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(birthday !== undefined && { birthday: birthdayDate ?? null }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        birthday: true,
        hasPassword: true,
      },
    });

    return res.status(200).json({
      message: "پروفایل با موفقیت بروزرسانی شد.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "خطا در بروزرسانی پروفایل." });
  }
};

/* ===========================================================================
 * 10. CHANGE PASSWORD
 * =========================================================================== */
const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { currentPassword, newPassword } = req.body;

    // رمز جدید الزامی است
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return res.status(400).json({
        error: passwordError,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        error: "کاربر یافت نشد.",
      });
    }

    // اگر قبلاً رمز داشته، رمز فعلی باید وارد شود
    if (user.hasPassword && user.password) {
      if (!currentPassword) {
        return res.status(400).json({
          error:
            "شما قبلاً رمز عبور تعیین کرده‌اید، لطفاً رمز فعلی را وارد کنید.",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          error: "رمز عبور فعلی اشتباه است.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        hasPassword: true,
      },
    });

    // همه sessionهای قبلی باطل شوند
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return res.status(200).json({
      message: "رمز عبور با موفقیت ثبت شد.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      error: "خطا در تغییر رمز عبور.",
    });
  }
};

/* ===========================================================================
 * 11. PASSWORD RESET: REQUEST OTP
 * =========================================================================== */
const requestPasswordResetOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!/^09\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "فرمت شماره موبایل صحیح نیست." });
    }

    const normalizedPhone = normalizePhone(phone);
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return res.status(200).json({
        message: "اگر این شماره ثبت شده باشد، کد برایتان ارسال می‌شود.",
      });
    }

    const activeOtp = await prisma.otp.findFirst({
      where: {
        phone: normalizedPhone,
        purpose: OtpPurpose.PASSWORD_RESET,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (activeOtp) {
      const remainingMs = activeOtp.expiresAt.getTime() - Date.now();
      if (remainingMs > 0) {
        return res.status(429).json({
          error: "کد فعال قبلاً ارسال شده است.",
          expiresAt: activeOtp.expiresAt,
          remainingMs,
        });
      }
    }

    // منقضی کردن کدهای قبلی ریست پسورد
    await prisma.otp.updateMany({
      where: {
        phone: normalizedPhone,
        purpose: OtpPurpose.PASSWORD_RESET,
        used: false,
      },
      data: { used: true },
    });

    const code = generateOtp();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 5 * 60000); // ۵ دقیقه

    await prisma.otp.create({
      data: {
        phone: normalizedPhone,
        codeHash,
        purpose: OtpPurpose.PASSWORD_RESET,
        expiresAt,
      },
    });

    console.log(`Password Reset OTP برای ${normalizedPhone}: ${code}`);

    return res.status(200).json({
      message: "کد بازیابی ارسال شد.",
      expiresAt,
    });
  } catch (error) {
    console.error("Request password reset OTP error:", error);
    return res.status(500).json({ error: "خطای داخلی سرور." });
  }
};

/* ===========================================================================
 * 12. PASSWORD RESET: VERIFY OTP
 * =========================================================================== */
const verifyPasswordResetOtp = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: "شماره موبایل و کد الزامی است." });
    }

    const normalizedPhone = normalizePhone(phone);

    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone: normalizedPhone,
        purpose: OtpPurpose.PASSWORD_RESET,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: "کد نامعتبر یا منقضی شده است." });
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });
      return res
        .status(400)
        .json({ error: "تعداد دفعات تلاش مجاز به پایان رسیده است." });
    }

    const isMatch = await bcrypt.compare(code, otpRecord.codeHash);
    if (!isMatch) {
      const newAttempts = otpRecord.attempts + 1;

      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: {
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
          ...(newAttempts >= otpRecord.maxAttempts && {
            used: true,
          }),
        },
      });

      return res.status(400).json({
        error: "کد وارد شده اشتباه است.",
      });
    }

    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { used: true, usedAt: new Date() },
    });

    const resetJwt = jwt.sign(
      { phone: normalizedPhone, purpose: "password-reset" },
      process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
      { expiresIn: "15m" },
    );

    return res.status(200).json({
      message: "کد تایید شد.",
      resetToken: resetJwt,
    });
  } catch (error) {
    console.error("Verify password reset OTP error:", error);
    return res.status(500).json({ error: "خطای داخلی سرور." });
  }
};

/* ===========================================================================
 * 13. PASSWORD RESET: RESET PASSWORD
 * =========================================================================== */
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        error: "توکن و رمز عبور جدید الزامی است.",
      });
    }

    /* --------------------------------
     * Validate new password
     * -------------------------------- */

    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return res.status(400).json({
        error: passwordError,
      });
    }

    /* --------------------------------
     * Verify reset token
     * -------------------------------- */

    let decoded: any;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
      );
    } catch {
      return res.status(401).json({
        error: "توکن نامعتبر یا منقضی شده است.",
      });
    }

    /* --------------------------------
     * Validate token purpose
     * -------------------------------- */

    if (!decoded || decoded.purpose !== "password-reset" || !decoded.phone) {
      return res.status(401).json({
        error: "توکن نامعتبر است.",
      });
    }

    const phone = normalizePhone(decoded.phone);

    /* --------------------------------
     * Find user
     * -------------------------------- */

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(404).json({
        error: "کاربر یافت نشد.",
      });
    }

    /* --------------------------------
     * Hash new password
     * -------------------------------- */

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10,
    ); /* --------------------------------
     * Update password
     * -------------------------------- */

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        hasPassword: true,
      },
    });

    /* --------------------------------
     * Invalidate all sessions
     * -------------------------------- */

    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return res.status(200).json({
      message: "رمز عبور با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      error: "خطای داخلی سرور.",
    });
  }
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
  updateProfile,
  changePassword,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
};
