import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollTopNew";
import { ConfirmProvider } from "./context/ConfirmContext";
import {
  useContext,
  useMemo,
} from "react";
import { AuthContext } from "./context/AuthContext";

import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import Birthdays from "./pages/Birthdays";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Links from "./pages/Links";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import Privacy from "./pages/Privacy";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Reminders from "./pages/Reminders";
import ResetPassword from "./pages/ResetPassword";
import Search from "./pages/Search";
import Suggestions from "./pages/Suggestions";
import Terms from "./pages/Terms";
import VerifyRegistration from "./pages/VerifyRegistration";

import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

/**
 * Defines the application router, global confirmation provider,
 * scroll restoration, toast notifications, and route protection.
 */
function App() {
  const toasterStyle =
      useMemo(
        () => ({
          borderRadius: "18px",
          padding: "14px 18px",
  
          background: darkMode
            ? `
                linear-gradient(
                  160deg,
                  rgba(255,255,255,.14),
                  rgba(255,255,255,.04) 35%,
                  rgba(255,255,255,0)
                ),
                linear-gradient(
                  135deg,
                  rgba(255,90,90,.10),
                  rgba(0,158,129,.10),
                  rgba(6,126,169,.10)
                )
              `
            : `
                linear-gradient(
                  160deg,
                  rgba(255,255,255,.40),
                  rgba(255,255,255,.08) 35%,
                  rgba(255,255,255,0)
                ),
                linear-gradient(
                  135deg,
                  rgba(255,90,90,.08),
                  rgba(0,158,129,.08),
                  rgba(6,126,169,.08)
                )
              `,
  
          backdropFilter:
            "blur(18px)",
  
          WebkitBackdropFilter:
            "blur(18px)",
  
          border: darkMode
            ? "1px solid rgba(255,255,255,.12)"
            : "1px solid rgba(255,255,255,.35)",
  
          color: darkMode
            ? "#f9fafb"
            : "#111827",
  
          boxShadow: darkMode
            ? `
                0 0 20px rgba(0,255,204,.16),
                0 0 45px rgba(0,140,255,.10),
                0 18px 45px rgba(0,0,0,.45)
              `
            : `
                0 0 18px rgba(0,180,255,.16),
                0 0 40px rgba(0,255,200,.10),
                0 18px 40px rgba(0,0,0,.15)
              `,
  
          fontWeight: 500,
          letterSpacing: ".2px",
        }),
        [darkMode]
      );

      const { user } =
        useContext(AuthContext);

      const darkMode =
        user?.theme === "dark";

  return (
    <ConfirmProvider>
      <BrowserRouter>
      <Toaster
          position="center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,

            style: toasterStyle,

            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },

            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          <Route
            path="/verify-registration"
            element={<VerifyRegistration />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/privacy"
            element={<Privacy />}
          />

          <Route
            path="/terms"
            element={<Terms />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/birthdays"
            element={
              <ProtectedRoute>
                <Birthdays />
              </ProtectedRoute>
            }
          />

          <Route
            path="/links"
            element={
              <ProtectedRoute>
                <Links />
              </ProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/suggestions"
            element={
              <ProtectedRoute>
                <Suggestions />
              </ProtectedRoute>
            }
          />

          {/* Admin route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Fallback route */}
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </ConfirmProvider>
  );
}

export default App;