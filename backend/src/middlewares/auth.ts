import jwt, { TokenExpiredError } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";

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
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRole;
      };
    }
  }
}

/* ============================================================
 * 🧱 verifyAccessToken
 * توضیح: چک توکن دسترسی در تمام مسیرهای محافظت‌شده
 * ============================================================ */
export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: "No access token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    /** ✅ تفکیک خطاهای JWT برای هندل خاص */
    if (error instanceof TokenExpiredError) {
      // ⏰ فرانت‌اند از این متن برای شروع Refresh استفاده می‌کند
      return res.status(401).json({ error: "jwt expired" });
    }

    console.error("🚨 Access Token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
};

/* ============================================================
 * 🧱 verifyRefreshToken
 * ============================================================ */
export const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: "jwt expired" });
    }

    console.error("Refresh token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

/* ============================================================
 * 🧱 checkRole
 * ============================================================ */
export const checkRole =
  (roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user)
      return res.status(401).json({ error: "User not authenticated" });

    if (!roles.includes(req.user.role))
      return res
        .status(403)
        .json({ error: `Access denied. Requires role: ${roles.join(" or ")}` });

    next();
  };
