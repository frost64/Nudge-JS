import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ConfirmProvider } from "./context/ConfirmContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reminders from "./pages/Reminders";
import Notes from "./pages/Notes";
import Birthdays from "./pages/Birthdays";
import Links from "./pages/Links";
import Search from "./pages/Search";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact"
import ScrollToTop from "./components/ScrollTopNew";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Suggestions from "./pages/Suggestions";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";


function App() {
  return (
    <ConfirmProvider>
      <BrowserRouter>
      <ScrollToTop />
        <Toaster
          position="center"
          toastOptions={{
            duration: 3000,
          }}
        />

        <Routes>

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

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
            path="/suggestions"
            element={<Suggestions />}
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
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
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

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

        </Routes>

      </BrowserRouter>
    </ConfirmProvider>
  );
}

export default App;