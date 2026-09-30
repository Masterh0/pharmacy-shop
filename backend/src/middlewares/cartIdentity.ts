import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import "../types";

export function cartIdentity(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  let userId: number | undefined;
  let sessionId: string | undefined;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
      userId = decoded.id;

      // ✅ authenticated: کوکی مهمان باقی‌مونده رو پاک کن
      if (req.cookies.sessionId) {
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("sessionId", {
          httpOnly: false,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          path: "/",
        });
      }
    } catch (e: any) {
      if (e.name === "TokenExpiredError") {
        // ✅ accessToken منقضی شده — اگه refreshToken داره، نباید guest بشه
        if (refreshToken) {
          res.status(401).json({ code: "ACCESS_EXPIRED_RETRY" });
          return;
        }
        // refreshToken هم نیست → session کاملاً منقضی
        res.status(401).json({ error: "TOKEN_EXPIRED" });
        return;
      }
      // سایر خطاهای JWT (tampered token و...) → guest fallback
      userId = undefined;
    }
  } else if (refreshToken) {
    // ✅ اصلاً accessToken نیست ولی refreshToken هست → کاربر لاگینه، رفرش لازمه
    res.status(401).json({ code: "ACCESS_EXPIRED_RETRY" });
    return;
  }

  if (!userId) {
    sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = uuid();
      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("sessionId", sessionId, {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30,
        path: "/",
      });
    }
  }

  req.cartIdentity = { userId, sessionId };
  next();
}
