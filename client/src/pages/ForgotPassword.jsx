import {
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaArrowLeft,
  FaEnvelope,
  FaKey,
  FaPaperPlane,
} from "react-icons/fa";

import logo from "../assets/Logo.svg";
import loginDarkBg from "../assets/backgrounds/loginDark.png";
import loginLightBg from "../assets/backgrounds/loginLight.png";

import Card from "../components/Card";
import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";

/**
 * Safely reads the saved user from localStorage.
 *
 * @returns {object|null}
 */
function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Failed to parse stored user.",
      error
    );

    return null;
  }
}

/**
 * Allows users to request a password-reset email.
 */
function ForgotPassword() {
  const { user } = useContext(AuthContext);
  const { isMobile, isTablet } = useBreakpoint();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const savedUser = useMemo(
    () => user || getStoredUser(),
    [user]
  );

  const darkMode = savedUser?.theme === "dark";

  const backgroundImage = darkMode
    ? loginDarkBg
    : loginLightBg;

  const handleEmailChange = useCallback(
    (event) => {
      setEmail(event.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      if (!normalizedEmail) {
        toast.error("Please enter your email.");
        return;
      }

      try {
        setLoading(true);

        await api.post(
          "/auth/forgot-password",
          {
            email: normalizedEmail,
          }
        );

        toast.success(
          "Password reset link sent."
        );

        setEmail("");
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    },
    [email]
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
        minHeight: "100dvh",
        minWidth: 0,

        margin: 0,

        padding: isMobile
          ? "20px 12px calc(32px + env(safe-area-inset-bottom))"
          : isTablet
            ? "30px"
            : "40px 20px",

        boxSizing: "border-box",

        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: isMobile
          ? "scroll"
          : "fixed",
      }}
    >
      <Card
        variant="glass"
        style={{
          width: "100%",
          maxWidth: "460px",
          minWidth: 0,

          margin: isMobile
            ? "12px 0 0"
            : 0,

          padding: isMobile
            ? "24px 18px"
            : isTablet
              ? "34px"
              : "42px",

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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",

                gap: "10px",

                marginTop: 0,
                marginBottom: "12px",

                fontSize: isMobile
                  ? "1.7rem"
                  : "2rem",

                textAlign: "center",
              }}
            >
              <FaKey aria-hidden="true" />
              Forgot Password
            </h1>

            <p
              style={{
                margin: 0,
                lineHeight: 1.7,
                opacity: 0.7,
              }}
            >
              Enter your registered email and
              we&apos;ll send you a password reset
              link.
            </p>
          </header>

          <div
            className="input-icon-wrapper"
            style={{
              width: "100%",
            }}
          >
            <FaEnvelope
              className="input-icon"
              aria-hidden="true"
            />

            <input
              id="forgot-password-email"
              className="input-glow"
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="Email Address"
              aria-label="Email address"
              value={email}
              disabled={loading}
              onChange={handleEmailChange}
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
            <FaPaperPlane
              aria-hidden="true"
              size={14}
              style={{
                marginRight: "8px",
              }}
            />

            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>

          <p
            style={{
              margin: 0,
              textAlign: "center",
            }}
          >
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",

                gap: "6px",

                textDecoration: "none",
              }}
            >
              <FaArrowLeft
                aria-hidden="true"
                size={13}
              />
              Back to Login
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}

export default ForgotPassword;