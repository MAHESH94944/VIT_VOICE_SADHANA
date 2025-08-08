import React, { useState } from "react";
import { verifyOtp, registerUser } from "../../api/auth";

export default function VerifyOTP({ email, onVerified }) {
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    if (!otp || otp.length !== 6) {
      setMsg("Enter a valid 6-digit OTP.");
      setLoading(false);
      return;
    }
    try {
      await verifyOtp(email, otp);
      setMsg("OTP verified. Registration complete.");
      if (onVerified) onVerified();
    } catch (err) {
      setMsg(err.message);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    setMsg("");
    try {
      // You may need to pass registration data here
      await registerUser({ email });
      setMsg("OTP resent to your email.");
    } catch (err) {
      setMsg(err.message);
    }
    setResending(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">OTP Verification</h2>
      {msg && <div className="mb-2 text-red-500">{msg}</div>}
      <form onSubmit={handleVerify} className="flex flex-col gap-3">
        <input
          type="text"
          maxLength={6}
          pattern="\d{6}"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
          className="border p-2 rounded tracking-widest text-center text-lg"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        <button
          type="button"
          className="bg-blue-500 text-white py-2 rounded font-semibold mt-2"
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      </form>
    </div>
  );
}
