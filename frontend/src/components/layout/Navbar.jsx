import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../App";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    document.cookie = "token=; Max-Age=0";
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex flex-wrap items-center justify-between">
      <div className="flex gap-4 items-center">
        <Link to="/" className="font-bold text-lg">
          VOICE Sadhana
        </Link>
        {!user && (
          <Link to="/register" className="hover:underline">
            Register
          </Link>
        )}
        {!user && (
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        )}
        {user?.role === "counsilli" && (
          <>
            <Link to="/counsilli/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/counsilli/add-sadhana" className="hover:underline">
              Add Sadhana
            </Link>
            <Link to="/counsilli/monthly-report" className="hover:underline">
              Monthly Report
            </Link>
          </>
        )}
        {user?.role === "counsellor" && (
          <>
            <Link to="/counsellor/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/counsellor/counsilli-list" className="hover:underline">
              Counsilli List
            </Link>
          </>
        )}
      </div>
      {user && (
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-sm mr-2">
            {user.name} ({user.role})
          </span>
          <button
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
