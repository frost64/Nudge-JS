import {
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaAt,
  FaEnvelope,
  FaLock,
  FaUser,
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
 * Safely retrieves the stored user preferences.
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
 * Registers a new user and sends an OTP
 * before completing account creation.
 */
function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } =
    useContext(AuthContext);

  const {
    isMobile,
    isTablet,
  } = useBreakpoint();

  const registrationData =
    location.state?.registrationData ||
    location.state ||
    {};

  const [
    fullName,
    setFullName,
  ] = useState(
    registrationData.fullName || ""
  );

  const [
    username,
    setUsername,
  ] = useState(
    registrationData.username || ""
  );

  const [
    email,
    setEmail,
  ] = useState(
    registrationData.email || ""
  );

  const [
    password,
    setPassword,
  ] = useState(
    registrationData.password || ""
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);

  const storedUser = useMemo(
    () => getStoredUser(),
    []
  );

  const darkMode =
    storedUser?.theme === "dark";

  const backgroundImage = darkMode
    ? loginDarkBg
    : loginLightBg;

  const isBusy =
    loading || googleLoading;

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

  /**
   * Validates registration fields
   * and requests an OTP.
   */
  const handleSubmit =
    useCallback(
      async (event) => {
        event.preventDefault();

        if (isBusy) {
          return;
        }

        const normalizedFullName =
          fullName.trim();

        const normalizedUsername =
          username.trim();

        const normalizedEmail =
          email
            .trim()
            .toLowerCase();

        if (
          !normalizedFullName ||
          !normalizedUsername ||
          !normalizedEmail ||
          !password
        ) {
          toast.error(
            "Please fill all fields."
          );

          return;
        }

        try {
          setLoading(true);

          await api.post(
            "/auth/register/send-otp",
            {
              fullName:
                normalizedFullName,

              username:
                normalizedUsername,

              email:
                normalizedEmail,

              password,
            }
          );

          toast.success(
            "OTP sent to your email."
          );

          navigate(
            "/verify-registration",
            {
              state: {
                registrationData: {
                  fullName:
                    normalizedFullName,

                  username:
                    normalizedUsername,

                  email:
                    normalizedEmail,

                  password,
                },
              },
            }
          );
        } catch (error) {
          console.error(error);

          toast.error(
            error.response?.data?.errors && error.response?.data?.errors.length > 0
              ? error.response?.data?.errors[0]?.message
              : "Cannot connect to backend server."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        email,
        fullName,
        isBusy,
        navigate,
        password,
        username,
      ]
    );

  /**
   * Handles Google account
   * registration and login.
   */
  const handleGoogleSuccess =
    useCallback(
      async (
        credentialResponse
      ) => {
        if (
          isBusy ||
          !credentialResponse
            ?.credential
        ) {
          return;
        }

        try {
          setGoogleLoading(
            true
          );

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
            error.response?.data?.errors && error.response?.data?.errors.length > 0
              ? error.response?.data?.errors[0]?.message
              : "Google sign up failed."
          );
        } finally {
          setGoogleLoading(
            false
          );
        }
      },
      [
        completeLogin,
        isBusy,
      ]
    );

  const handleGoogleError =
    useCallback(() => {
      toast.error(
        "Google signup failed."
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

          maxHeight:
            isMobile
              ? "calc(100dvh - 24px)"
              : isTablet
                ? "calc(100dvh - 48px)"
                : "none",

          margin: 0,

          padding: isMobile
            ? "18px 16px"
            : isTablet
              ? "30px"
              : "40px",

          boxSizing:
            "border-box",

          overflowX:
            "hidden",

          overflowY:
            isMobile ||
            isTablet
              ? "auto"
              : "visible",

          overscrollBehavior:
            isMobile ||
            isTablet
              ? "contain"
              : "auto",

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
              ? "12px"
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
                    ? "68px"
                    : "100px",

                height:
                  isMobile
                    ? "68px"
                    : "100px",

                objectFit:
                  "contain",
              }}
            />

            <h1
              style={{
                marginTop:
                  isMobile
                    ? "2px"
                    : "8px",

                marginBottom:
                  "4px",

                fontSize:
                  isMobile
                    ? "1.8rem"
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
              Create your account
            </p>
          </header>

          <div
            className="input-icon-wrapper"
            style={{
              width: "100%",
              minWidth: 0,
            }}
          >
            <FaUser
              className="input-icon"
              aria-hidden="true"
            />

            <input
              id="register-full-name"
              className="input-glow"
              type="text"
              name="fullName"
              autoComplete="name"
              placeholder="Full Name"
              aria-label="Full name"
              value={fullName}
              disabled={isBusy}
              onChange={(
                event
              ) =>
                setFullName(
                  event.target
                    .value
                )
              }
              style={{
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,

                boxSizing:
                  "border-box",
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
            <FaAt
              className="input-icon"
              aria-hidden="true"
            />

            <input
              id="register-username"
              className="input-glow"
              type="text"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="Username"
              aria-label="Username"
              value={username}
              disabled={isBusy}
              onChange={(
                event
              ) =>
                setUsername(
                  event.target
                    .value
                )
              }
              style={{
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,

                boxSizing:
                  "border-box",
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
            <FaEnvelope
              className="input-icon"
              aria-hidden="true"
            />

            <input
              id="register-email"
              className="input-glow"
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="Email"
              aria-label="Email address"
              value={email}
              disabled={isBusy}
              onChange={(
                event
              ) =>
                setEmail(
                  event.target
                    .value
                )
              }
              style={{
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,

                boxSizing:
                  "border-box",
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
              id="register-password"
              className="input-glow"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Password"
              aria-label="Password"
              value={password}
              disabled={isBusy}
              onChange={(
                event
              ) =>
                setPassword(
                  event.target
                    .value
                )
              }
              style={{
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,

                boxSizing:
                  "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            className="glow-top"
            disabled={isBusy}
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
            <FaUserPlus
              aria-hidden="true"
              size={14}
              style={{
                marginRight:
                  "6px",
              }}
            />

            {loading
              ? "Creating Account..."
              : "Register"}
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
                isBusy
                  ? "none"
                  : "auto",

              overflow:
                "hidden",

              transition:
                "opacity .2s ease",
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
              text="signup_with"
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
              Signing up with
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
            Already have an
            account?{" "}

            <Link
              to="/"
              style={{
                color:
                  darkMode
                    ? "#7dd3fc"
                    : "#0284c7",

                textDecoration:
                  "none",
              }}
            >
              Login here
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}

export default Register;