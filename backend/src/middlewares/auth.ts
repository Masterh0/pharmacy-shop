import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

// 🧩 تعریف نوع Payload داخل JWT
interface JwtPayload {
  id: number;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  iat?: number;
  exp?: number;
}

// 🧠 گسترش تایپ Request برای دسترسی به req.user در تمام کنترلرها
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/* ============================================================
 * 🧱 Middleware: verifyAccessToken
 * کاربرد: چکِ معتبر بودن Access Token (برای تمام روت‌های محافظت‌شده)
 * ============================================================ */
export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ error: 'No access token provided' });

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    req.user = decoded; // نوع الان کاملاً مشخصه
    next();
  } catch (error) {
    console.error('Access token verification failed:', error);
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};

/* ============================================================
 * 🧱 Middleware: verifyRefreshToken
 * کاربرد: بررسی توکن رفرش از body یا کوکی
 * ============================================================ */
export const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.body.refreshToken ||
    req.cookies?.refreshToken; // ✅ پشتیبانی از کوکی هم برای امنیت بیشتر

  if (!token) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: number };

    // 🔎 چک وجود کاربر
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // افزودن user به req
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

/* ============================================================
 * 🧱 Middleware: checkRole
 * کاربرد: محافظت از مسیرهای خاص با نقش‌های مجاز
 * ============================================================ */
export const checkRole =
  (roles: Array<'ADMIN' | 'STAFF' | 'CUSTOMER'>) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
