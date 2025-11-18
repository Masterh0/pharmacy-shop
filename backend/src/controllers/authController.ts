import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import crypto from "crypto";
const generateOtp = () => {
  // کد ۶ رقمی امن و تصادفی
  return crypto.randomInt(100000, 999999).toString();
};
/* ------------------ Helper ------------------ */
function normalizePhone(input: string): string {
  if (!input) return "";
  let phone = input.replace(/[\s\-]/g, "").trim();
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("0098")) phone = phone.slice(4);
  else if (phone.startsWith("98")) phone = phone.slice(2);
  if (phone.length === 10 && phone.startsWith("9")) phone = "0" + phone;
  phone = phone.replace(/\D/g, "");
  return phone;
}

/* ------------------ JWT + Refresh ------------------ */
async function generateTokens(userId: number, role: string) {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
    { expiresIn: "15m" }
  );

  const refreshToken = uuid();
  const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { userId, token: refreshToken, expiresAt: refreshExpiry },
  });

  return { accessToken, refreshToken };
}

/* ------------------ ثبت‌نام ------------------ */
interface RegisterBody {
  name: string;
  email?: string;
  password?: string;
  phone: string;
}

const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
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
        .json({ error: "کاربر با این شماره  قبلاً ثبت‌نام کرده است." });

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone,
        password: hashedPassword,
        hasPassword: !!password,
        role: "CUSTOMER",
        isVerified: false,
      },
    });

    const code = generateOtp();
    const expireAt = new Date(Date.now() + 2 * 60 * 1000);
    await prisma.otp.create({
      data: { phone: normalizePhone(phone), code, expiresAt: expireAt },
    });

    console.log(`OTP برای ${phone}: ${code}`);

    res.json({
      message: "ثبت‌نام موفقیت‌آمیز بود. لطفاً کد ارسال‌شده را وارد کنید.",
      userId: user.id,
    });
  } catch (error) {
    res.status(500).json({ error: "خطای داخلی سرور رخ داده است." });
  }
};

/* ------------------ تأیید OTP ثبت‌نام ------------------ */
const verifyRegisterOtp = async (
  req: Request<{}, {}, { phone: string; code: string }>,
  res: Response
) => {
  const { phone, code } = req.body;
  try {
    const otpRecord = await prisma.otp.findFirst({
      where: { phone, code, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!otpRecord)
      return res
        .status(400)
        .json({ error: "کد تأیید نامعتبر است یا مهلت آن به پایان رسیده است." });

    await prisma.otp.updateMany({ where: { phone: normalizePhone(phone) }, data: { used: true } });

    const user = await prisma.user.update({
      where: { phone: normalizePhone(phone) },
      data: { isVerified: true },
    });

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.role
    );
    return res.status(200).json({ accessToken, refreshToken, user });
  } catch {
    return res.status(500).json({ error: "خطای داخلی سرور رخ داده است." });
  }
};

/* ------------------ ورود با پسورد ------------------ */
const login = async (
  req: Request<{}, {}, { identifier: string; password: string }>,
  res: Response
) => {
  const { identifier, password } = req.body;
  if (!identifier || !password)
    return res
      .status(400)
      .json({ error: "شماره موبایل یا ایمیل و رمز عبور الزامی است." });

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });

    if (!user)
      return res.status(401).json({ error: "اطلاعات ورود صحیح نیست." });

    if (!user.isVerified)
      return res
        .status(401)
        .json({ error: "شماره موبایل شما هنوز تأیید نشده است." });

    if (!user.hasPassword || !user.password)
      return res.status(400).json({
        error: "این حساب رمز عبور ندارد. لطفاً ورود با کد تأیید را انجام دهید.",
      });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ error: "اطلاعات ورود صحیح نیست." });

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.role
    );
    res.json({ accessToken, refreshToken, user });
  } catch {
    res.status(500).json({ error: "خطای داخلی سرور رخ داده است." });
  }
};

/* ------------------ ارسال OTP ورود ------------------ */
const sendLoginOtp = async (
  req: Request<{}, {}, { phone: string }>,
  res: Response
) => {
  try {
    const { phone } = req.body;
    if (!/^09\d{9}$/.test(phone))
      return res.status(400).json({ error: "فرمت شماره موبایل صحیح نیست." });

    const user = await prisma.user.findUnique({ where: { phone: normalizePhone(phone) } });
    if (!user)
      return res.status(404).json({ error: "کاربری با این شماره یافت نشد." });
    if (!user.isVerified)
      return res
        .status(401)
        .json({ error: "شماره موبایل شما تأیید نشده است." });

    const activeOtp = await prisma.otp.findFirst({
      where: { phone, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (activeOtp) {
      const remainingMs = activeOtp.expiresAt.getTime() - Date.now();
      return res.status(429).json({
        error:
          "برای شما یک کد فعال ارسال شده است. لطفاً کد فعلی را وارد کنید یا پس از پایان اعتبار مجدداً تلاش کنید.",
        expiresAt: activeOtp.expiresAt,
        remainingMs,
      });
    }

    await prisma.otp.updateMany({
      where: { phone, used: false },
      data: { used: true },
    });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    await prisma.otp.create({ data: { phone, code, expiresAt } });

    if (process.env.NODE_ENV !== "production")
      console.log(`Login OTP برای ${phone}: ${code}`);

    return res.status(200).json({
      message: "کد تأیید با موفقیت ارسال شد.",
      expiresAt,
    });
  } catch {
    return res.status(500).json({ error: "خطای داخلی سرور رخ داده است." });
  }
};

/* ------------------ تأیید OTP ورود ------------------ */
const verifyLoginOtp = async (
  req: Request<{}, {}, { phone: string; code: string }>,
  res: Response
) => {
  try {
    const { phone, code } = req.body;

    if (!/^09\d{9}$/.test(phone))
      return res.status(400).json({ error: "فرمت شماره موبایل صحیح نیست." });

    const otpRecord = await prisma.otp.findFirst({
      where: { phone, code, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord)
      return res
        .status(400)
        .json({ error: "کد تأیید نادرست است یا مهلت آن تمام شده است." });

    await prisma.otp.updateMany({ where: { phone: normalizePhone(phone) }, data: { used: true } });
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { isVerified: true },
    });

    const user = await prisma.user.findUnique({ where: { phone: normalizePhone(phone) } });
    if (!user) return res.status(404).json({ error: "کاربر یافت نشد." });

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.role
    );
    return res.status(200).json({ accessToken, refreshToken, user });
  } catch {
    return res.status(500).json({ error: "خطای داخلی سرور رخ داده است." });
  }
};

/* ------------------ رفرش توکن ------------------ */
const refresh = async (
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response
) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ error: "رفرش‌توکن ارسال نشده است." });

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!tokenRecord || tokenRecord.expiresAt < new Date())
    return res
      .status(401)
      .json({ error: "رفرش‌توکن نامعتبر است یا منقضی شده است." });

  const user = await prisma.user.findUnique({
    where: { id: tokenRecord.userId },
  });
  if (!user)
    return res.status(401).json({ error: "کاربر مربوط به این توکن یافت نشد." });

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
