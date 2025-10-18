import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";



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
  email?: string;
  password: string;
  phone: string;
}

const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const { email, password, phone } = req.body;

  if (!phone) return res.status(400).json({ error: "Phone required" });
  if (!password) return res.status(400).json({ error: "Password required" });

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone,
        password: hashedPassword,
        role: "CUSTOMER",
        isVerified: false,
      },
    });

    // تولید OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = new Date(Date.now() + 2 * 60 * 1000); // 2 دقیقه
    await prisma.otp.create({
      data: { phone, code, expiresAt: expireAt },
    });
    console.log(`OTP for ${phone}: ${code}`); // برای تست

    res.json({
      message: "User created, OTP sent to phone",
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

  const otpRecord = await prisma.otp.findFirst({
    where: { phone, code },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) return res.status(400).json({ error: "Invalid OTP" });
  if (otpRecord.expiresAt < new Date())
    return res.status(400).json({ error: "OTP expired" });

  // تایید کاربر
  const user = await prisma.user.update({
    where: { phone },
    data: { isVerified: true },
  });

  const { accessToken, refreshToken } = await generateTokens(
    user.id,
    user.role
  );

  res.json({ accessToken, refreshToken, user });
};

// -------------------
// لاگین با پسورد
// -------------------
const login = async (
  req: Request<{}, {}, { identifier: string; password: string }>,
  res: Response
) => {
  const { identifier, password } = req.body;
  if (!identifier || !password)
    return res.status(400).json({ error: "Phone/Email and password required" });

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.isVerified)
      return res.status(401).json({ error: "Phone not verified" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ error: "Invalid credentials" });

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.role
    );

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
  const { phone } = req.body;
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.isVerified)
    return res.status(401).json({ error: "Phone not verified" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expireAt = new Date(Date.now() + 2 * 60 * 1000);
  await prisma.otp.create({ data: { phone, code, expiresAt: expireAt } });

  console.log(`Login OTP for ${phone}: ${code}`); // برای تست
  res.json({ message: "OTP sent" });
};

// -------------------
// تایید OTP لاگین
// -------------------
const verifyLoginOtp = async (
  req: Request<{}, {}, { phone: string; code: string }>,
  res: Response
) => {
  const { phone, code } = req.body;

  const otpRecord = await prisma.otp.findFirst({
    where: { phone, code },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) return res.status(400).json({ error: "Invalid OTP" });
  if (otpRecord.expiresAt < new Date())
    return res.status(400).json({ error: "OTP expired" });

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const { accessToken, refreshToken } = await generateTokens(
    user.id,
    user.role
  );

  res.json({ accessToken, refreshToken, user });
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
