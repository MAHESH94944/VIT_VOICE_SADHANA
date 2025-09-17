import React, { useState, useEffect } from "react";
import { registerUser, getCounsellors } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
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
  const [msg, setMsg] = useState({ text: "", type: "error" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "counsilli") {
      async function fetchCounsellors() {
        try {
          const data = await getCounsellors();
          setCounsellors(Array.isArray(data) ? data : data || []);
          if ((data || []).length > 0) {
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
      // After successful registration, go to login page
      navigate("/login");
    } catch (err) {
      setMsg({ text: err.message || "Registration failed", type: "error" });
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

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            Join our community to track your sadhana.
          </p>
        </div>

        {renderMessage()}

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
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
            