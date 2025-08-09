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

// New: Public route component to redirect logged-in users
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
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
    `relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
      isActive
        ? "text-white"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    } after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 ${
      isActive
        ? "after:w-1/2 after:-translate-x-1/2"
        : "hover:after:w-1/2 hover:after:-translate-x-1/2"
    }`;

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm text-white shadow-lg sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="font-bold tracking-wide text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
          >
            VIT VOICE Sadhana
          </Link>
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
              <div className="flex items-center gap-4">
                <img
                  className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-gray-800 ring-white"
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt="User avatar"
                />
                <button
                  onClick={logout}
                  className="bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:bg-red-700 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
              className="w-full text-left block bg-red-600 px-3 py-2 rounded-md text-base font-medium hover:bg-red-700"
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
      {/* replace old inline nav with Navbar */}
      <Navbar />
      <main>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route
              path="/"
              element={
                <div className="flex flex-col items-center justify-center text-center p-8 min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-gray-200">
                  <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 tracking-tight">
                    Welcome to{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      VIT VOICE Sadhana
                    </span>
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg text-gray-600">
                    Your dedicated platform to track spiritual progress, connect
                    with your counsellor, and stay consistent on your path.
                  </p>
                  <Link
                    to="/login"
                    className="mt-8 px-8 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </div>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <PublicRoute>
                  <VerifyOTP />
                </PublicRoute>
              }
            />
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
      </main>
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
