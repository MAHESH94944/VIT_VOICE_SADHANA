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
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Responsive hook for mobile detection
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

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
  const isMobile = useIsMobile();
  if (isMobile) return null;
  const linkCls = ({ isActive }) =>
    `relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
      isActive
        ? "text-white bg-gradient-to-r from-orange-400 to-yellow-300"
        : "text-orange-900 hover:bg-orange-200 hover:text-orange-900"
    } after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 after:bg-orange-700 after:transition-all after:duration-300 ${
      isActive
        ? "after:w-1/2 after:-translate-x-1/2"
        : "hover:after:w-1/2 hover:after:-translate-x-1/2"
    }`;

  return (
    <header className="bg-gradient-to-r from-orange-200 to-yellow-100/90 backdrop-blur-sm text-orange-900 shadow-lg sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="font-bold tracking-wide text-xl text-orange-700 drop-shadow-sm"
            style={{ letterSpacing: 2 }}
          >
            VIT VOICE Sadhana
          </Link>
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-orange-200 hover:text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
                  className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-orange-200 ring-white"
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=ff9800&color=fff`}
                  alt="User avatar"
                />
                <button
                  onClick={logout}
                  className="bg-orange-700 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:bg-orange-800 shadow-md hover:shadow-lg"
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
            <div className="pt-4 mt-4 border-t border-orange-300">
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full text-left block bg-orange-700 px-3 py-2 rounded-md text-base font-medium hover:bg-orange-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function BottomNav() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  if (!user || !isMobile) return null;
  const navItems =
    user.role === "counsilli"
      ? [
          { to: "/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
          {
            to: "/counsilli/add-sadhana",
            icon: <AddCircleIcon />,
            label: "Add",
          },
          {
            to: "/counsilli/monthly-report",
            icon: <AssessmentIcon />,
            label: "Report",
          },
        ]
      : [
          { to: "/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
          {
            to: "/counsellor/counsilli-list",
            icon: <ListAltIcon />,
            label: "List",
          },
        ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-200 to-yellow-100 border-t border-orange-300 flex justify-around items-center h-16 shadow-2xl">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center text-xs font-semibold px-2 py-1 rounded-md transition-colors duration-200 ${
              isActive
                ? "text-orange-700"
                : "text-orange-500 hover:text-orange-700"
            }`
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
      <button
        onClick={logout}
        className="flex flex-col items-center justify-center text-xs font-semibold px-2 py-1 rounded-md text-orange-500 hover:text-orange-700"
      >
        <LogoutIcon />
        <span>Logout</span>
      </button>
    </nav>
  );
}

function AppShell() {
  const isMobile = useIsMobile();
  return (
    <BrowserRouter>
      <Navbar />
      <BottomNav />
      <main
        className={`bg-gradient-to-br from-orange-50 via-yellow-100 to-orange-100 min-h-screen ${
          isMobile ? "pt-0" : "pt-0"
        }`}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<DashboardRedirect />} />
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
      <HelmetProvider>
        <ErrorBoundary>
          <AppShell />
        </ErrorBoundary>
      </HelmetProvider>
    </AuthProvider>
  );
}
