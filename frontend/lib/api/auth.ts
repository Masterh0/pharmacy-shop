import api from "@/lib/axios"; 

// نقش‌ها
export type Role = "ADMIN" | "STAFF" | "CUSTOMER";

// پاسخ لاگین/ثبت‌نام
export interface AuthResponse {
  user: {
    id: number;
    phone: string;
    email?: string;
    role: Role;
    name: string;
  };
}

// ورودی‌ها
export interface RegisterInput {
  name: string;
  phone: string;
  password: string;
  email?: string;
  role?: Role; // در ریجستر عادی همیشه CUSTOMER
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface VerifyOtpInput {
  phone: string;
  code: string;
}

export interface LoginOtpInput {
  phone: string;
}

// پاسخ‌های خاص
export interface RegisterOtpResponse {
  message: string;
  userId: number;
}

export interface LoginOtpResponse {
  message: string;
  expiresAt?: string;
  remainingMs?: number;
}

export interface AdminResponse {
  message: string;
}

export interface ApiError {
  error?: string;
}

// ----------------------
// ثبت‌نام + OTP
// ----------------------
export const register = async (data: RegisterInput) => {
  const res = await api.post<RegisterOtpResponse>("/auth/register", data);
  return res.data;
};

export const verifyRegisterOtp = async (data: VerifyOtpInput) => {
  // بعد از موفقیت، بک‌اند کوکی HttpOnly رو ست می‌کنه
  const res = await api.post<AuthResponse>("/auth/register/verify-otp", data);
  return res.data;
};

// ----------------------
// ورود با پسورد
// ----------------------
export const login = async (data: LoginInput) => {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
};

// ----------------------
// ورود با OTP
// ----------------------
export const requestLoginOtp = async (phone: string) => {
  const res = await api.post<{ message: string }>("/auth/login/request-otp", { phone });
  return res.data;
};

export const verifyLoginOtp = async (data: VerifyOtpInput) => {
  const res = await api.post<AuthResponse>("/auth/login/verify-otp", data);
  return res.data;
};

// ----------------------
// رفرش‌توکن از بک‌اند (کوکی)
// ----------------------
// export const refreshToken = async () => {
//   // در نسخه جدید نیازی به ارسال توکن در body نیست — بک‌اند از req.cookies.refreshToken استفاده می‌کند
//   const res = await api.post<AuthResponse>("/auth/refresh");
//   return res.data;
// };

// // ----------------------
// // تست ادمین
// // ----------------------
// export const testAdmin = async () => {
//   // کوکی HttpOnly به صورت خودکار ارسال می‌شود
//   const res = await api.get<AdminResponse>("/auth/admin/test");
//   return res.data;
// };

// ----------------------
// ارسال OTP برای لاگین
// ----------------------
export const sendLoginOtp = async (data: LoginOtpInput) => {
  const res = await api.post<LoginOtpResponse>("/auth/login/request-otp", data);
  return res.data;
};

// ----------------------
// لاگ‌اوت (پاک کردن کوکی‌ها)
// ----------------------
export const logout = async () => {
  const res = await api.post<{ message: string }>("/auth/logout", null, {
    withCredentials: true, // ارسال کوکی‌ها برای پاکسازی
  });
  return res.data;
};
export const me = async () => {
  const res = await api.get<AuthResponse>("/auth/me", {
  });
  return res.data;
};
