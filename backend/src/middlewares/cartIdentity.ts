import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import "../types";


export function cartIdentity(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.accessToken;

  let userId: number | undefined;
  let sessionId: string | undefined;

  /* ---------------------------------------
     1) اگر لاگین باشد → userId از JWT بخوان
  ----------------------------------------*/
  if (token) {
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      );
      userId = decoded.id;
    } catch (e) {
      // اگر توکن خراب بود → guest
      userId = undefined;
    }
  }

  /* ---------------------------------------------------
     2) اگر کاربر مهمان است → sessionId استفاده یا ایجاد کن
  -----------------------------------------------------*/
  if (!userId) {
    sessionId = req.cookies.sessionId;

    // اگر sessionId وجود نداشت → بساز
    if (!sessionId) {
      sessionId = uuid();

      // ✅ مهم: حتماً maxAge بده تا session پایدار بماند
      // تنظیمات برای سازگاری با تمام مرورگرها
      res.cookie("sessionId", sessionId, {
        httpOnly: false,       // باید false باشد (مهم)
        secure: false,         // dev - در production باید true باشد
        sameSite: "lax" as const,       // بهترین تنظیم برای dev و سازگاری با Edge/Explorer
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 روز
        path: "/",
        domain: undefined,     // برای localhost
      });

      // Session ID created for guest user
    }
  }

  /* ---------------------------------------------------
     نهایی: ذخیره در req
  -----------------------------------------------------*/
  req.cartIdentity = { userId, sessionId };

  next();
}
