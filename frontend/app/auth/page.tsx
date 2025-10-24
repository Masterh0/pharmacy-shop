"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  register,
  verifyRegisterOtp,
  login,
  Role,
  AuthResponse,
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
} from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import type { AxiosError } from "axios";

export default function AuthPage() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [isRegister, setIsRegister] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [userIdForOtp, setUserIdForOtp] = useState<number | null>(null);

  const { setTokens } = useAuthStore();

  // ---------------- Register
  const registerMutation = useMutation<
    { message: string; userId: number },
    AxiosError,
    RegisterInput
  >({
    mutationFn: register,
    onSuccess: (data) => {
      setUserIdForOtp(data.userId);
      setShowOtpForm(true);
      alert("✅ OTP sent to your phone. Please enter it below.");
    },
    onError: (error) =>
      alert(
        `❌ Register Error: ${
          (error.response?.data as { error?: string })?.error || error.message
        }`
      ),
  });

  const verifyOtpMutation = useMutation<
    AuthResponse,
    AxiosError,
    VerifyOtpInput
  >({
    mutationFn: verifyRegisterOtp,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setShowOtpForm(false);
      alert(`✅ Registration verified! Logged in as ${data.user.role}`);
    },
    onError: (error) =>
      alert(
        `❌ Register Error: ${
          (error.response?.data as { error?: string })?.error || error.message
        }`
      ),
  });

  // ---------------- Login
  const loginMutation = useMutation<AuthResponse, AxiosError, LoginInput>({
    mutationFn: login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      alert(`✅ Logged in as ${data.user.role}`);
    },
    onError: (error) =>
      alert(
        `❌ Register Error: ${
          (error.response?.data as { error?: string })?.error || error.message
        }`
      ),
  });

  // ---------------- Handlers
  const handleSubmit = () => {
    if (isRegister) {
      registerMutation.mutate({
        phone,
        password,
        email: email || undefined,
        role,
      });
    } else {
      loginMutation.mutate({ identifier: phone, password });
    }
  };

  const handleVerifyOtp = () => {
    if (!userIdForOtp) return;
    verifyOtpMutation.mutate({ phone, code: otpCode });
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg">
      {!showOtpForm ? (
        <>
          <h1 className="text-3xl font-bold text-center mb-6">
            {isRegister ? "Register" : "Login"}
          </h1>
          <div className="space-y-3">
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="w-full p-3 border rounded-lg"
            />
            {isRegister && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full p-3 border rounded-lg"
              />
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border rounded-lg"
            />
            {isRegister && (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            )}
          </div>
          <div className="mt-5 space-y-3">
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-600 text-white rounded-lg"
            >
              {isRegister ? "Register" : "Login"}
            </button>
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="w-full py-3 bg-gray-200 rounded-lg"
            >
              {isRegister ? "Switch to Login" : "Switch to Register"}
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">Enter OTP</h1>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="OTP Code"
            className="w-full p-3 border rounded-lg mb-3"
          />
          <button
            onClick={handleVerifyOtp}
            className="w-full py-3 bg-green-600 text-white rounded-lg"
          >
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
}
