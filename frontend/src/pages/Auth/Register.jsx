import React, { useState, useEffect } from "react";
import { registerUser, verifyOtp, getCounsellors } from "../../api/auth";
import { Link } from "react-router-dom";
import { validatePassword } from "../../utils/validate";

export default function Register() {
  const [role, setRole] = useState("counsilli"); // 'counsilli' or 'counsellor'
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    counsellorName: "",
  });
  const [counsellors, setCounsellors] = useState([]);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "error" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === "counsilli") {
      async function fetchCounsellors() {
        try {
          const data = await getCounsellors();
          setCounsellors(data);
          if (data.length > 0) {
            setForm((prev) => ({ ...prev, counsellorName: data[0].name }));
          }
        } catch (err) {
          console.error("Failed to fetch counsellors", err);
        }
      }
      fetchCounsellors();
    }
  }, [role]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg({ text: "" });

    // Validate password strength
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setMsg({ text: passwordError, type: "error" });
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      };
      if (role === "counsilli") {
        dataToSend.counsellorName = form.counsellorName;
      }
      await registerUser(dataToSend);
      setStep(2);
      setMsg({ text: "OTP sent to your email.", type: "success" });
    } catch (err) {
      setMsg({ text: err.message, type: "error" });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMsg({ text: "" });
    setLoading(true);
    try {
      await verifyOtp(form.email, otp);
      setStep(3);
      setMsg({
        text: "Registration complete! You can now login.",
        type: "success",
      });
    } catch (err) {
      setMsg({ text: err.message, type: "error" });
    }
    setLoading(false);
  };

  const renderMessage = () => {
    if (!msg.text) return null;
    const colors =
      msg.type === "success"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";
    return (
      <div className={`p-3 text-center text-sm rounded-lg ${colors}`}>
        {msg.text}
      </div>
    );
  };

  return (
    <div className="auth-container">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-2xl">
        {step === 1 && (
          <div className="flex border-b border-gray-300">
            <button
              onClick={() => setRole("counsilli")}
              className={`flex-1 py-3 text-center font-semibold transition-colors ${
                role === "counsilli"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Register as Counsilli
            </button>
            <button
              onClick={() => setRole("counsellor")}
              className={`flex-1 py-3 text-center font-semibold transition-colors ${
                role === "counsellor"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Register as Counsellor
            </button>
          </div>
        )}

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {step === 1 && "Create Your Account"}
            {step === 2 && "Verify Your Email"}
            {step === 3 && "Registration Complete"}
          </h1>
          <p className="text-gray-600">
            {step === 1 && "Join our community to track your sadhana."}
            {step === 2 && `Enter the OTP sent to ${form.email}.`}
          </p>
        </div>

        {renderMessage()}

        {step === 1 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 text-gray-700 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 text-gray-700 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 text-gray-700 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
            {role === "counsilli" && (
              <select
                name="counsellorName"
                value={form.counsellorName}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-700 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              >
                <option value="" disabled>
                  Select your Counsellor
                </option>
                {counsellors.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
            >
              Register
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              maxLength={6}
              pattern="\d{6}"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
              className="w-full px-4 py-3 text-center tracking-widest text-lg bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center">
            <Link
              to="/login"
              className="w-full inline-block px-4 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Proceed to Login
            </Link>
          </div>
        )}

        <div className="text-sm text-center mt-4">
          {step === 1 && (
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Login here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
