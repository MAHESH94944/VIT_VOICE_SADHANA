import React, { useState } from "react";
import {
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
} from "../../api/auth";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../components/common/PasswordInput";
import OTPInput from "../../components/common/OTPInput";
import fireConfetti from "../../utils/confetti";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setStep(2);
    } catch (err) {
      setMsg(
        err.response?.data?.message || err.message || "Failed to request OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await verifyResetOTP(email, otp);
      setStep(3);
    } catch (err) {
      setMsg(
        err.response?.data?.message || err.message || "Invalid or expired OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg("");
    if (newPassword !== confirmPassword)
      return setMsg("Passwords do not match");
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      // celebration
      try {
        fireConfetti();
      } catch (err) {
        console.warn("Confetti failed to launch:", err);
      }
      setMsg("Password reset successful — please login");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setMsg(
        err.response?.data?.message || err.message || "Password reset failed",
      );
    } finally {
      setLoading(false);
    }
  };

  // Keep everything the same but replace the return statement with this:

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-12 px-4">
      <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-xl p-6 md:p-10 transform transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Reset your password
          </h2>
          <div className="text-sm text-gray-500">Secure & simple</div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 ${
                  step === s
                    ? "bg-orange-500 text-white shadow"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {msg && <div className="mb-4 text-sm text-red-600">{msg}</div>}

        <div className="relative min-h-[300px]">
          {/* Step 1 */}
          <div
            className={`transition-all duration-300 absolute w-full ${
              step === 1
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <form onSubmit={handleRequest} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Registered email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@university.edu"
                className="w-full border border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-orange-200 transition"
              />
              <button
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg shadow-md transition-transform duration-150 transform hover:scale-105"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </div>

          {/* Step 2 */}
          <div
            className={`transition-all duration-300 absolute w-full ${
              step === 2
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <form onSubmit={handleVerify} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Enter the 6‑digit OTP
              </label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                placeholder="123456"
                className="w-full text-center tracking-widest text-lg font-mono border border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-orange-200 transition"
              />
              <div className="flex gap-3">
                <button
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg shadow-md"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 py-2 rounded-lg"
                >
                  Back
                </button>
              </div>
            </form>
          </div>

          {/* Step 3 */}
          <div
            className={`transition-all duration-300 absolute w-full ${
              step === 3
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <form onSubmit={handleReset} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <label className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="flex gap-3">
                <button
                  disabled={loading}
                  className="flex-1 bg-orange-700 hover:bg-orange-800 text-white py-2 rounded-lg shadow-md"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-200 py-2 rounded-lg"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
