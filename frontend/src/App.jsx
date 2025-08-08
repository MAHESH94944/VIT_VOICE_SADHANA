import React, { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  NavLink,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { Helmet } from "react-helmet-async";

// Lazy load all page components
const Register = lazy(() => import("./pages/Auth/Register"));
const Login = lazy(() => import("./pages/Auth/Login"));
const VerifyOTP = lazy(() => import("./pages/Auth/VerifyOTP"));
const CounsilliDashboard = lazy(() => import("./pages/Counsilli/Dashboard"));
const AddSadhana = lazy(() => import("./pages/Counsilli/AddSadhana"));
const MonthlyReport = lazy(() => import("./pages/Counsilli/MonthlyReport"));
const CounsellorDashboard = lazy(() => import("./pages/Counsellor/Dashboard"));
const CounsilliList = lazy(() => import("./pages/Counsellor/CounsilliList"));
const CounsilliReport = lazy(() =>
  import("./pages/Counsellor/CounsilliReport")
);

// Protected route component (uses context)
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

// New: role-aware dashboard redirect
function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "counsilli")
    return <Navigate to="/counsilli/dashboard" replace />;
  if (user.role === "counsellor")
    return <Navigate to="/counsellor/dashboard" replace />;
  return <Navigate to="/" replace />;
}

// New: Responsive Navbar with role-based links
function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const linkCls = ({ isActive }) =>
    `px-3 py-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-900" : ""}`;

  return (
    <header className="bg-gray-800 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="font-bold tracking-wide">
            VIT VOICE Sadhana
          </Link>
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded hover:bg-gray-700"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <nav className="hidden md:flex items-center gap-2">
            {!user && (
              <>
                <NavLink to="/register" className={linkCls}>
                  Register
                </NavLink>
                <NavLink to="/login" className={linkCls}>
                  Login
                </NavLink>
              </>
            )}
            {user?.role === "counsilli" && (
              <>
                <NavLink to="/dashboard" className={linkCls}>
                  Dashboard
                </NavLink>
                <NavLink to="/counsilli/add-sadhana" className={linkCls}>
                  Add Sadhana
                </NavLink>
                <NavLink to="/counsilli/monthly-report" className={linkCls}>
                  Monthly Report
                </NavLink>
              </>
            )}
            {user?.role === "counsellor" && (
              <>
                <NavLink to="/dashboard" className={linkCls}>
                  Dashboard
                </NavLink>
                <NavLink to="/counsellor/counsilli-list" className={linkCls}>
                  Counsilli List
                </NavLink>
              </>
            )}
            {user && (
              <button
                onClick={logout}
                className="ml-2 bg-red-600 px-3 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-3 space-y-1">
          {!user && (
            <>
              <NavLink
                to="/register"
                className={linkCls}
                onClick={() => setOpen(false)}
              >
                Register
              </NavLink>
              <NavLink
                to="/login"
                className={linkCls}
                onClick={() => setOpen(false)}
              >
                Login
              </NavLink>
            </>
          )}
          {user?.role === "counsilli" && (
            <>
              <NavLink
                to="/dashboard"
                className={linkCls}
                onClick={() => setOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/counsilli/add-sadhana"
                className={linkCls}
                onClick={() => setOpen(false)}
              >
                Add Sadhana
              </NavLink>
              <NavLink
                to="/counsilli/monthly-report"
                className={linkCls}
                onClick={() => setOpen(false)}
              >
                Monthly Report
              </NavLink>
            </>
          )}
          {user?.role === "counsellor" && (
            <>
              <NavLink
                to="/dashboard"
                className={linkCls}
                onClick={() => setOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/counsellor/counsilli-list"
                className={linkCls}
                onClick={() => setOpen(false)}
              >
                Counsilli List
              </NavLink>
            </>
          )}
          {user && (
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full bg-red-600 px-3 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}

function AppShell() {
  return (
    <BrowserRouter>
      <Helmet>
        <title>VIT VOICE Sadhana</title>
        <meta
          name="description"
          content="A web application to track sadhana for VIT VOICE members."
        />
      </Helmet>
      {/* replace old inline nav with Navbar */}
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route
            path="/"
            element={
              <div className="p-8 text-2xl">Welcome to VIT VOICE Sadhana</div>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          {/* Counsilli routes */}
          <Route
            path="/counsilli/dashboard"
            element={
              <ProtectedRoute role="counsilli">
                <CounsilliDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counsilli/add-sadhana"
            element={
              <ProtectedRoute role="counsilli">
                <AddSadhana />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counsilli/monthly-report"
            element={
              <ProtectedRoute role="counsilli">
                <MonthlyReport />
              </ProtectedRoute>
            }
          />
          {/* Counsellor routes */}
          <Route
            path="/counsellor/dashboard"
            element={
              <ProtectedRoute role="counsellor">
                <CounsellorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counsellor/counsilli-list"
            element={
              <ProtectedRoute role="counsellor">
                <CounsilliList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counsellor/counsilli/:id/report"
            element={
              <ProtectedRoute role="counsellor">
                <CounsilliReport />
              </ProtectedRoute>
            }
          />
          {/* Shared dashboard route */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="p-8 text-red-600">404 - Page Not Found</div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
