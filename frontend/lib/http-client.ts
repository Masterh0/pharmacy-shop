// lib/http-client.ts
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
type UnauthorizedHandler = (reason: string) => void;

let onUnauthorizedHandler: UnauthorizedHandler = () => {};
export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorizedHandler = handler;
}
async function refreshAccessToken(): Promise<string> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("REFRESH_FAILED");
        const data = await res.json();
        return data.accessToken;
      })
      .finally(() => {
        isRefreshing = false;
      });
  }
  return refreshPromise!;
}

export async function httpClient(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let res = await fetch(url, { ...options, credentials: "include" });

  if (res.status === 401) {
    try {
      // اگه رفرش در حال انجامه، منتظر همون بمون (single-flight)
      await refreshAccessToken();
      // ریکوئست اصلی رو دوباره بزن — کاربر هیچی نمی‌فهمه
      res = await fetch(url, { ...options, credentials: "include" });
    } catch {
      // فقط اینجا یعنی refresh token هم مرده → session واقعاً تموم شده
      onUnauthorizedHandler("SESSION_EXPIRED");
      throw new Error("SESSION_EXPIRED");
    }
  }

  return res;
}
