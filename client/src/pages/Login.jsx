import {
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaEnvelope,
  FaKey,
  FaLock,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

import logo from "../assets/Logo.svg";
import loginDarkBg from "../assets/backgrounds/loginDark.png";
import loginLightBg from "../assets/backgrounds/loginLight.png";

import Card from "../components/Card";
import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";

/**
 * Safely retrieves the saved user
 * from localStorage.
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
 * Renders the standard and
 * Google authentication page.
 */
function Login() {
  const navigate = useNavigate();

  const { login } =
    useContext(AuthContext);

  const {
    isMobile,
    isTablet,
  } = useBreakpoint();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loginError,
    setLoginError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);

  const savedUser = useMemo(
    () => getStoredUser(),
    []
  );

  const darkMode =
    savedUser?.theme === "dark";

  const backgroundImage = darkMode
    ? loginDarkBg
    : loginLightBg;

  const clearLoginError =
    useCallback(() => {
      if (loginError) {
        setLoginError("");
      }
    }, [loginError]);

  const handleEmailChange =
    useCallback(
      (event) => {
        setEmail(
          event.target.value
        );

        clearLoginError();
      },
      [clearLoginError]
    );

  const handlePasswordChange =
    useCallback(
      (event) => {
        setPassword(
          event.target.value
        );

        clearLoginError();
      },
      [clearLoginError]
    );

  const completeLogin =
    useCallback(
      (responseData) => {
        login(
          responseData.token,
          responseData.user
        );

        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );
      },
      [
        login,
        navigate,
      ]
    );

  const handleSubmit =
    useCallback(
      async (event) => {
        event.preventDefault();

        if (
          loading ||
          googleLoading
        ) {
          return;
        }

        const normalizedEmail =
          email
            .trim()
            .toLowerCase();

        if (!normalizedEmail) {
          setLoginError(
            "Please enter your email address."
          );

          return;
        }

        if (!password) {
          setLoginError(
            "Please enter your password."
          );

          return;
        }

        try {
          setLoading(true);
          setLoginError("");

          const response =
            await api.post(
              "/auth/login",
              {
                email:
                  normalizedEmail,
                password,
              }
            );

          completeLogin(
            response.data
          );
        } catch (error) {
          console.error(error);

          setLoginError(
            error.response?.data
              ?.message ||
              "Invalid email or password."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        completeLogin,
        email,
        googleLoading,
        loading,
        password,
      ]
    );

  const handleGoogleSuccess =
    useCallback(
      async (
        credentialResponse
      ) => {
        if (
          googleLoading ||
          loading ||
          !credentialResponse
            ?.credential
        ) {
          return;
        }

        try {
          setGoogleLoading(true);
          setLoginError("");

          const response =
            await api.post(
              "/auth/google",
              {
                credential:
                  credentialResponse
                    .credential,
              }
            );

          completeLogin(
            response.data
          );
        } catch (error) {
          console.error(error);

          toast.error(
            error.response?.data
              ?.message ||
              "Google login failed."
          );
        } finally {
          setGoogleLoading(
            false
          );
        }
      },
      [
        completeLogin,
        googleLoading,
        loading,
      ]
    );

  const handleGoogleError =
    useCallback(() => {
      toast.error(
        "Google login failed."
      );
    }, []);

  return (
    <main
      style={{
        position: "relative",

        display: "flex",
        alignItems: "center",
        justifyContent:
          "center",

        width: "100%",
        minWidth: 0,

        height: "100dvh",
        minHeight: 0,

        margin: 0,

        padding: isMobile
          ? "12px"
          : isTablet
            ? "24px"
            : "40px 20px",

        boxSizing:
          "border-box",

        backgroundImage:
          `url(${backgroundImage})`,

        backgroundSize:
          "cover",

        backgroundPosition:
          "center",

        backgroundRepeat:
          "no-repeat",

        backgroundAttachment:
          isMobile
            ? "scroll"
            : "fixed",

        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position:
            "absolute",

          inset: 0,

          background:
            darkMode
              ? "rgba(0,0,0,.20)"
              : "rgba(255,255,255,.08)",

          backdropFilter:
            "blur(2px)",

          WebkitBackdropFilter:
            "blur(2px)",

          pointerEvents:
            "none",
        }}
      />

      <Card
        variant="glass"
        style={{
          position:
            "relative",

          zIndex: 1,

          width: "100%",
          maxWidth: "450px",

          minWidth: 0,
          minHeight: 0,

          maxHeight: isMobile
            ? "calc(100dvh - 24px)"
            : isTablet
              ? "calc(100dvh - 48px)"
              : "calc(100dvh - 80px)",

          margin: 0,

          padding: isMobile
            ? "20px 18px"
            : isTablet
              ? "32px"
              : "40px",

          boxSizing:
            "border-box",

          overflowX:
            "hidden",

          overflowY: "auto",

          overscrollBehavior:
            "contain",

          WebkitOverflowScrolling:
            "touch",

          borderRadius:
            isMobile
              ? "22px"
              : "28px",
        }}
      >
        <form
          noValidate
          onSubmit={
            handleSubmit
          }
          style={{
            display: "flex",

            flexDirection:
              "column",

            width: "100%",
            minWidth: 0,

            gap: isMobile
              ? "14px"
              : "18px",
          }}
        >
          <header
            style={{
              textAlign:
                "center",
            }}
          >
            <img
              src={logo}
              alt="Nudge"
              style={{
                width:
                  isMobile
                    ? "72px"
                    : "100px",

                height:
                  isMobile
                    ? "72px"
                    : "100px",

                objectFit:
                  "contain",
              }}
            />

            <h1
              style={{
                marginTop:
                  isMobile
                    ? "4px"
                    : "8px",

                marginBottom:
                  "4px",

                fontSize:
                  isMobile
                    ? "1.9rem"
                    : "2.4rem",

                lineHeight: 1.2,
              }}
            >
              Nudge
            </h1>

            <p
              style={{
                margin: 0,

                color:
                  darkMode
                    ? "#d1d5db"
                    : "#6b7280",
              }}
            >
              Remember Everything
            </p>
          </header>

          <div
            className="input-icon-wrapper"
            style={{
              width: "100%",
              minWidth: 0,
            }}
          >
            <FaEnvelope
              className="input-icon"
              aria-hidden="true"
            />

            <input
              id="login-email"
              className="input-glow"
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="Email"
              aria-label="Email address"
              aria-invalid={
                Boolean(
                  loginError
                )
              }
              aria-describedby={
                loginError
                  ? "login-error"
                  : undefined
              }
              value={email}
              disabled={
                loading ||
                googleLoading
              }
              onChange={
                handleEmailChange
              }
              style={{
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,

                boxSizing:
                  "border-box",

                borderColor:
                  loginError
                    ? "#ef4444"
                    : undefined,

                boxShadow:
                  loginError
                    ? "0 0 0 2px rgba(239,68,68,.20)"
                    : undefined,
              }}
            />
          </div>

          <div
            className="input-icon-wrapper"
            style={{
              width: "100%",
              minWidth: 0,
            }}
          >
            <FaLock
              className="input-icon"
              aria-hidden="true"
            />

            <input
              id="login-password"
              className="input-glow"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              aria-label="Password"
              aria-invalid={
                Boolean(
                  loginError
                )
              }
              aria-describedby={
                loginError
                  ? "login-error"
                  : undefined
              }
              value={password}
              disabled={
                loading ||
                googleLoading
              }
              onChange={
                handlePasswordChange
              }
              style={{
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,

                boxSizing:
                  "border-box",

                borderColor:
                  loginError
                    ? "#ef4444"
                    : undefined,

                boxShadow:
                  loginError
                    ? "0 0 0 2px rgba(239,68,68,.20)"
                    : undefined,
              }}
            />
          </div>

          {loginError && (
            <p
              id="login-error"
              role="alert"
              style={{
                margin:
                  "-6px 0 0",

                color:
                  "#ef4444",

                fontSize:
                  ".9rem",

                lineHeight: 1.5,

                textAlign:
                  "center",
              }}
            >
              {loginError}
            </p>
          )}

          <div
            style={{
              display: "flex",

              justifyContent:
                "flex-end",

              marginTop:
                "-4px",
            }}
          >
            <Link
              to="/forgot-password"
              style={{
                display:
                  "inline-flex",

                alignItems:
                  "center",

                gap: "6px",

                color:
                  darkMode
                    ? "#7dd3fc"
                    : "#0284c7",

                fontSize:
                  ".9rem",

                textDecoration:
                  "none",

                transition:
                  "text-decoration-color .25s ease",
              }}
            >
              <FaKey
                aria-hidden="true"
                style={{
                  fontSize:
                    ".8rem",
                }}
              />

              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="glow-top"
            disabled={
              loading ||
              googleLoading
            }
            aria-busy={
              loading
            }
            style={{
              display:
                "inline-flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              width: "100%",
              margin: 0,
            }}
          >
            <FaSignInAlt
              aria-hidden="true"
              size={14}
              style={{
                marginRight:
                  "6px",
              }}
            />

            {loading
              ? "Logging in..."
              : "Login"}
          </button>

          <div
            aria-hidden="true"
            style={{
              display: "flex",

              alignItems:
                "center",

              gap: "12px",
            }}
          >
            <div
              style={{
                flexGrow: 1,

                height: "1px",

                background:
                  darkMode
                    ? "rgba(255,255,255,.20)"
                    : "rgba(0,0,0,.12)",
              }}
            />

            <span
              style={{
                color:
                  darkMode
                    ? "#9ca3af"
                    : "#6b7280",

                fontSize:
                  ".9rem",
              }}
            >
              OR
            </span>

            <div
              style={{
                flexGrow: 1,

                height: "1px",

                background:
                  darkMode
                    ? "rgba(255,255,255,.20)"
                    : "rgba(0,0,0,.12)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",

              justifyContent:
                "center",

              width: "100%",
              maxWidth: "100%",
              minWidth: 0,

              opacity:
                googleLoading
                  ? 0.65
                  : 1,

              pointerEvents:
                googleLoading ||
                loading
                  ? "none"
                  : "auto",

              transition:
                "opacity .2s ease",

              overflow:
                "hidden",
            }}
          >
            <GoogleLogin
              onSuccess={
                handleGoogleSuccess
              }
              onError={
                handleGoogleError
              }
              theme={
                darkMode
                  ? "filled_black"
                  : "outline"
              }
              shape="pill"
              text="signin_with"
              width={
                isMobile
                  ? "300"
                  : "360"
              }
            />
          </div>

          {googleLoading && (
            <p
              role="status"
              style={{
                margin:
                  "-6px 0 0",

                fontSize:
                  ".9rem",

                textAlign:
                  "center",

                opacity: 0.75,
              }}
            >
              Signing in with
              Google...
            </p>
          )}

          <p
            style={{
              marginTop:
                isMobile
                  ? "2px"
                  : "8px",

              marginBottom: 0,

              lineHeight: 1.6,

              textAlign:
                "center",
            }}
          >
            Don&apos;t have an
            account?{" "}

            <Link
              to="/register"
              style={{
                display:
                  "inline-flex",

                alignItems:
                  "center",

                gap: "5px",
              }}
            >
              <FaUserPlus
                aria-hidden="true"
                style={{
                  fontSize:
                    ".8rem",
                }}
              />

              Register here
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}

export default Login;