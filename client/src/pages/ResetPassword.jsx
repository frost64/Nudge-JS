import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaKey,
  FaLock,
} from "react-icons/fa";

import logo from "../assets/Logo.svg";
import resetDarkBg from "../assets/backgrounds/loginDark.png";
import resetLightBg from "../assets/backgrounds/loginLight.png";

import Card from "../components/Card";
import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";

/**
 * Safely reads the stored user preferences.
 *
 * @returns {object|null}
 */
function getStoredUser() {
  try {
    const storedUser =
      localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Failed to parse stored user.",
      error
    );

    localStorage.removeItem("user");

    return null;
  }
}

/**
 * Allows a user to set a new password using
 * a reset token supplied in the route.
 */
function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const {
    isMobile,
    isTablet,
  } = useBreakpoint();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const storedUser = useMemo(
    () => getStoredUser(),
    []
  );

  const darkMode =
    storedUser?.theme === "dark";

  const backgroundImage = darkMode
    ? resetDarkBg
    : resetLightBg;

  /**
   * Validates and submits the new password.
   */
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (loading) return;

      if (!token) {
        toast.error(
          "Invalid password reset link."
        );

        return;
      }

      if (
        !password ||
        !confirmPassword
      ) {
        toast.error(
          "Please fill all password fields."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        toast.error(
          "Passwords do not match."
        );

        return;
      }

      try {
        setLoading(true);

        await api.put(
          `/auth/reset-password/${token}`,
          {
            password,
          }
        );

        toast.success(
          "Password reset successfully."
        );

        navigate("/", {
          replace: true,
        });
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Unable to reset password."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      confirmPassword,
      loading,
      navigate,
      password,
      token,
    ]
  );

  return (
    <main
      style={{
        display: "flex",
        alignItems: isMobile
          ? "flex-start"
          : "center",
        justifyContent: "center",

        width: "100%",
        minWidth: 0,
        minHeight: "100dvh",

        margin: 0,

        padding: isMobile
          ? "20px 12px calc(32px + env(safe-area-inset-bottom))"
          : isTablet
            ? "30px"
            : "40px 20px",

        boxSizing: "border-box",

        backgroundImage:
          `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: isMobile
          ? "scroll"
          : "fixed",

        overflowX: "hidden",
      }}
    >
      <Card
        variant="glass"
        style={{
          width: "100%",
          maxWidth: "450px",
          minWidth: 0,

          margin: isMobile
            ? "12px 0 0"
            : 0,

          padding: isMobile
            ? "24px 18px"
            : isTablet
              ? "32px"
              : "40px",

          borderRadius: isMobile
            ? "22px"
            : "28px",
        }}
      >
        <form
          noValidate
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <header
            style={{
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            <img
              src={logo}
              alt="Nudge"
              style={{
                width: isMobile
                  ? "72px"
                  : "90px",

                height: isMobile
                  ? "72px"
                  : "90px",

                marginBottom: "15px",
                objectFit: "contain",
              }}
            />

            <h1
              style={{
                marginTop: 0,
                marginBottom: "10px",

                fontSize: isMobile
                  ? "1.8rem"
                  : "2.1rem",
              }}
            >
              Reset Password
            </h1>

            <p
              style={{
                margin: 0,
                opacity: 0.75,
              }}
            >
              Enter your new password.
            </p>
          </header>

          <div className="input-icon-wrapper">
            <FaLock
              className="input-icon"
              aria-hidden="true"
            />

            <input
              id="reset-password"
              className="input-glow"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="New Password"
              aria-label="New password"
              value={password}
              disabled={loading}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
            />
          </div>

          <div className="input-icon-wrapper">
            <FaKey
              className="input-icon"
              aria-hidden="true"
            />

            <input
              id="reset-confirm-password"
              className="input-glow"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm Password"
              aria-label="Confirm new password"
              value={confirmPassword}
              disabled={loading}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
            />
          </div>

          <button
            type="submit"
            className="glow-top"
            disabled={loading}
            aria-busy={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",

              width: "100%",
              margin: 0,
            }}
          >
            <FaKey
              aria-hidden="true"
              size={14}
              style={{
                marginRight: "6px",
              }}
            />

            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>
      </Card>
    </main>
  );
}

export default ResetPassword;