import React from "react";
import { Link } from "react-router-dom";

export default function VerifyOTP() {
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow text-center">
      <h2 className="text-xl font-bold mb-4">OTP Flow Disabled</h2>
      <p className="mb-4">
        OTP based verification has been removed. Please register and then sign in using the Login page.
      </p>
      <Link
        to="/login"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
      >
        Go to Login
      </Link>
    </div>
  );
}