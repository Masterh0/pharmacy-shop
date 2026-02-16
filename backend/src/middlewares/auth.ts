import jwt, { TokenExpiredError } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import "../types";

/* ============================================================
 * 🧩 Type Definitions
 * ============================================================ */
export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

export interface JwtPayload {
  id: number;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// 🧠 افزودن تایپ req.user در Express

/* ============================================================
 * 🧱 verifyAccessToken
 * توضیح: بررسی توکن دسترسی موجود در کوکی HttpOnly
 * ============================================================ */
export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ✅ اولویت اول: هدر Authorization (برای موبایل و تست)
  let token = req.headers.authorization?.split(" ")[1];

  // ✅ اولویت دوم: کوکی (برای وب)
  if (!token) {
    token = req.cookies?.accessToken;
  }

  if (!token) {
    // 401 استاندارد بدون پیام جیسون هم گاهی کافیست، اما جیسون بهتر است
    return res.status(401).json({ error: "No access token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as any; // یا تایپ JwtPayload خودتان

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res
        .status(401)
        .json({ error: "jwt expired", code: "TOKEN_EXPIRED" }); // کد برای فرانت‌اند مفید است
    }
    return res.status(403).json({ error: "Invalid access token" });
  }
};

/* ============================================================
 * 🧱 verifyRefreshToken
 * توضیح: بررسی Refresh Token موجود در کوکی HttpOnly یا Body
 * توجه: Refresh Token به صورت UUID در دیتابیس ذخیره می‌شود نه JWT
 * ============================================================ */
export const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    // بررسی وجود توکن در دیتابیس
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, role: true } } },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord) {
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      }
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    if (!tokenRecord.user) {
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      return res.status(401).json({ error: "User not found" });
    }

    req.user = { id: tokenRecord.user.id, role: tokenRecord.user.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

/* ============================================================
 * 🧱 checkRole
 * توضیح: محدودکردن دسترسی به مسیرها بر اساس نقش کاربر
 * ============================================================ */
export const checkRole =
  (roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "دسترسی مجاز نیست" });
  }
  next();
};
