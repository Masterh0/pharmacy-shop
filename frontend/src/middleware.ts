// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";
const SESSION_COOKIE = "sessionId REFRESH_COOKIE = "refreshToken";
const SESSION_COOKIE = "sessionId"";

/** صفحات کاربر لاگین‌شده */
const PROTECTED_PREFIXES = [
  "/profile",
  "/checkout/address",
  "/checkout/payment",
];

/** پنل مدیریت */
const MANAGER_PREFIXES = ["/manager"];

const STAFF_ROLES = new Set(["ADMIN", "STAFF"]);

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthPage(pathname: string) {
  return pathname === LOGIN_PATH || pathname.startsWith("/signup");
}

type JwtPayload = { id?: number; role?: string };

/** فقط decode برای UX — اعتبار واقعی سمت Express است */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.search = "";
  url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
  url.searchParams.set("reason", "required");
  return NextResponse.redirect(url);
}

function redirectToForbidden(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = FORBIDDEN_PATH;
  url.search = "";
  return NextResponse.redirect(url);
}

function applyGuestSession(
  req: NextRequest,
  res: NextResponse,
  isAuthed: boolean,
): NextResponse {
  if (isAuthed) {
    // کاربر لاگین: sessionId مهمان نساز / پاک کن
    if (req.cookies.get(SESSION_COOKIE)?.value) {
      res.cookies.set(SESSION_COOKIE, "", {
        path: "/",
        maxAge: 0,
      });
    }
    return res;
  }

  // اگر sessionId را جای دیگری می‌سازی، این بلوک را حذف کن
  if (!req.cookies.get(SESSION_COOKIE)?.value) {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookies.set(SESSION_COOKIE, crypto.randomUUID(), {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  const hasSessionHint = Boolean(accessToken || refreshToken);

  const payload = accessToken ? decodeJwtPayload(accessToken) : null;
  const role = payload?.role;

  const needsAuth = startsWithAny(pathname, PROTECTED_PREFIXES);
  const needsStaff = startsWithAny(pathname, MANAGER_PREFIXES);

  // بدون هیچ توکنی → لاگین
  if ((needsAuth || needsStaff) && !hasSessionHint) {
    return redirectToLogin(req);
  }

  // نقش اشتباه(req);
  }

  // نقش اشتباه وقتی access if (needsStaff && accessToken && role && !STAFF_ROLES.has(role)) {
    return redirectToForbidden(req);
  }

  // لاگین/ثبت‌نام وقتی نشست دارد
  if (isAuthPage(pathname) && hasSessionHint) {
    const redirectParam = req.nextUrl.searchParams.get("redirect") || "/";
    const safePath = redirectParam.startsWith("/") ? redirectParam : "/";
    const url = req.nextUrl.clone();
    url.pathname = safePath;
    url.search = "";
    const res = NextResponse.redirect(url);
    return applyGuestSession(req, res, true);
  }

  const res = NextResponse.next();
  return applyGuestSession(req, res, hasSessionHint);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg*)",|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
