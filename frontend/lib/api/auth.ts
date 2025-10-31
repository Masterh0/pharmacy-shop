import axios from "axios";

// نقش‌ها
export type Role = "ADMIN" | "STAFF" | "CUSTOMER";

// پاسخ‌ها
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: number; phone: string; email?: string; role: Role ,name:string };
}
export interface LoginOtpInput {
  phone: string;
}
export interface AdminResponse {
  message: string;
}

export interface ApiError {
  error?: string;
}
export interface LoginOtpResponse {
  message: string;
  expiresAt?: string; // زمان انقضا OTP
  remainingMs?: number; // زمان باقیمانده اگر OTP فعال موجود باشد
}
// ورودی‌ها
export interface RegisterInput {
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

// پاسخ ثبت‌نام اولیه (OTP ارسال شد)
export interface RegisterOtpResponse {
  message: string;
  userId: number;
}
export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface UpdateProductDTO {
  name?: string;
  price?: number;
}
const api = axios.create({
  baseURL: "http://localhost:5000/auth", // آدرس backend
});

// ----------------------
// ثبت‌نام و OTP
// ----------------------
export const register = async (data: RegisterInput) => {
  const response = await api.post<RegisterOtpResponse>("/register", data);
  return response.data;
};

export const verifyRegisterOtp = async (data: VerifyOtpInput) => {
  const response = await api.post<AuthResponse>("/register/verify-otp", data);
  return response.data;
};

// ----------------------
// ورود با پسورد
// ----------------------
export const login = async (data: LoginInput) => {
  const response = await api.post<AuthResponse>("/login", data);
  return response.data;
};

// ----------------------
// ورود با OTP
// ----------------------
export const requestLoginOtp = async (phone: string) => {
  const response = await api.post("/login/request-otp", { phone });
  return response.data; // فقط پیام
};

export const verifyLoginOtp = async (data: VerifyOtpInput) => {
  const res = await api.post<AuthResponse>("/login/verify-otp", data);
  return res.data;
};

// ----------------------
// رفرش توکن
// ----------------------
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token found");
  const response = await api.post<AuthResponse>("/refresh", { refreshToken });
  return response.data;
};

// ----------------------
// تست ادمین
// ----------------------
export const testAdmin = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) throw new Error("No access token found");
  const response = await api.get<AdminResponse>("/admin/test", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const sendLoginOtp = async (data: LoginOtpInput) => {
  const res = await api.post<LoginOtpResponse>("/login/request-otp", data);
  return res.data;
};
