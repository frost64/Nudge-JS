import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import { FaArrowLeft } from "react-icons/fa";

import logo from "../assets/Logo.svg";
import loginDarkBg from "../assets/backgrounds/loginDark.png";
import loginLightBg from "../assets/backgrounds/loginLight.png";

import Card from "../components/Card";
import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";

const OTP_LENGTH = 6;
const RESEND_DELAY = 60;

/**
 * Safely reads stored user preferences.
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
 * Verifies the registration OTP and completes
 * the user registration process.
 */
function VerifyRegistration() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } =
    useContext(AuthContext);

  const {
    isMobile,
    isTablet,
  } = useBreakpoint();

  const inputRefs = useRef([]);
  const verificationRef = useRef(false);

  const registrationData =
    location.state?.registrationData ||
    location.state ||
    null;

  const [otp, setOtp] = useState(() =>
    Array(OTP_LENGTH).fill("")
  );

  const [loading, setLoading] =
    useState(false);

  const [
    resendLoading,
    setResendLoading,
  ] = useState(false);

  const [seconds, setSeconds] =
    useState(RESEND_DELAY);

  const storedUser = useMemo(
    () => getStoredUser(),
    []
  );

  const darkMode =
    storedUser?.theme === "dark";

  const backgroundImage = darkMode
    ? loginDarkBg
    : loginLightBg;

  const canResend =
    seconds === 0 &&
    !loading &&
    !resendLoading;

  const otpCode = otp.join("");

  /**
   * Clears the OTP and focuses the first field.
   */
  const resetOtp = useCallback(() => {
    setOtp(
      Array(OTP_LENGTH).fill("")
    );

    window.requestAnimationFrame(() => {
      inputRefs.current[0]?.focus();
    });
  }, []);

  /**
   * Sends the completed OTP to the backend.
   */
  const verifyOtp = useCallback(
    async (code) => {
      if (
        verificationRef.current ||
        loading ||
        code.length !== OTP_LENGTH ||
        !registrationData
      ) {
        return;
      }

      try {
        verificationRef.current = true;
        setLoading(true);

        const response = await api.post(
          "/auth/register/verify",
          {
            ...registrationData,
            otp: code,
          }
        );

        login(
          response.data.token,
          response.data.user
        );

        toast.success(
          "Registration successful!"
        );

        navigate("/dashboard", {
          replace: true,
        });
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "OTP verification failed."
        );

        resetOtp();
      } finally {
        verificationRef.current = false;
        setLoading(false);
      }
    },
    [
      loading,
      login,
      navigate,
      registrationData,
      resetOtp,
    ]
  );

  /**
   * Updates one OTP field and advances focus.
   */
  const handleChange = useCallback(
    (value, index) => {
      if (!/^\d?$/.test(value)) {
        return;
      }

      const nextOtp = [...otp];
      nextOtp[index] = value;

      setOtp(nextOtp);

      if (
        value &&
        index < OTP_LENGTH - 1
      ) {
        inputRefs.current[
          index + 1
        ]?.focus();
      }

      const completedCode =
        nextOtp.join("");

      if (
        completedCode.length ===
        OTP_LENGTH
      ) {
        verifyOtp(completedCode);
      }
    },
    [otp, verifyOtp]
  );

  /**
   * Supports backspace navigation and arrow-key movement.
   */
  const handleKeyDown = useCallback(
    (event, index) => {
      if (
        event.key === "Backspace" &&
        !otp[index] &&
        index > 0
      ) {
        inputRefs.current[
          index - 1
        ]?.focus();

        return;
      }

      if (
        event.key === "ArrowLeft" &&
        index > 0
      ) {
        event.preventDefault();

        inputRefs.current[
          index - 1
        ]?.focus();
      }

      if (
        event.key === "ArrowRight" &&
        index < OTP_LENGTH - 1
      ) {
        event.preventDefault();

        inputRefs.current[
          index + 1
        ]?.focus();
      }
    },
    [otp]
  );

  /**
   * Distributes pasted digits across all OTP fields.
   */
  const handlePaste = useCallback(
    (event) => {
      event.preventDefault();

      const pastedCode =
        event.clipboardData
          .getData("text")
          .replace(/\D/g, "")
          .slice(0, OTP_LENGTH);

      if (!pastedCode) return;

      const nextOtp =
        Array(OTP_LENGTH).fill("");

      pastedCode
        .split("")
        .forEach((digit, index) => {
          nextOtp[index] = digit;
        });

      setOtp(nextOtp);

      const focusIndex = Math.min(
        pastedCode.length,
        OTP_LENGTH - 1
      );

      inputRefs.current[
        focusIndex
      ]?.focus();

      if (
        pastedCode.length ===
        OTP_LENGTH
      ) {
        verifyOtp(pastedCode);
      }
    },
    [verifyOtp]
  );

  /**
   * Verifies the manually entered OTP.
   */
  const handleVerify = useCallback(() => {
    if (
      otpCode.length !== OTP_LENGTH
    ) {
      toast.error(
        "Please enter the 6-digit OTP."
      );

      return;
    }

    verifyOtp(otpCode);
  }, [otpCode, verifyOtp]);

  /**
   * Requests a new registration OTP.
   */
  const handleResend = useCallback(
    async () => {
      if (
        !canResend ||
        !registrationData
      ) {
        return;
      }

      try {
        setResendLoading(true);

        await api.post(
          "/auth/register/send-otp",
          registrationData
        );

        toast.success(
          "OTP sent again."
        );

        resetOtp();
        setSeconds(RESEND_DELAY);
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Failed to resend OTP."
        );
      } finally {
        setResendLoading(false);
      }
    },
    [
      canResend,
      registrationData,
      resetOtp,
    ]
  );

  /**
   * Returns to registration while preserving entered details.
   */
  const handleBack = useCallback(() => {
    navigate("/register", {
      state: {
        registrationData,
      },
    });
  }, [
    navigate,
    registrationData,
  ]);

  useEffect(() => {
    if (!registrationData) {
      navigate("/register", {
        replace: true,
      });
    }
  }, [
    navigate,
    registrationData,
  ]);

  useEffect(() => {
    if (!registrationData) return;

    inputRefs.current[0]?.focus();
  }, [registrationData]);

  useEffect(() => {
    if (seconds <= 0) return undefined;

    const timerId = window.setTimeout(
      () => {
        setSeconds((current) =>
          Math.max(current - 1, 0)
        );
      },
      1000
    );

    return () => {
      window.clearTimeout(timerId);
    };
  }, [seconds]);

  if (!registrationData) {
    return null;
  }

  return (
    <main
      style={{
        position: "relative",

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
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,

          background: darkMode
            ? "rgba(0,0,0,.20)"
            : "rgba(255,255,255,.08)",

          backdropFilter: "blur(2px)",
          WebkitBackdropFilter:
            "blur(2px)",

          pointerEvents: "none",
        }}
      />

      <Card
        variant="glass"
        style={{
          position: "relative",
          zIndex: 1,

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
        <header
          style={{
            marginBottom: "25px",
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
                ? "1.75rem"
                : "2rem",
            }}
          >
            Email Verification
          </h1>

          <p
            style={{
              marginTop: 0,
              marginBottom: "8px",

              color: darkMode
                ? "#d1d5db"
                : "#6b7280",

              lineHeight: 1.6,
            }}
          >
            Enter the 6-digit verification
            code sent to
          </p>

          <strong
            style={{
              display: "block",
              overflowWrap: "anywhere",
            }}
          >
            {registrationData.email}
          </strong>
        </header>

        <div
          role="group"
          aria-label="Six-digit verification code"
          style={{
            display: "grid",

            gridTemplateColumns:
              "repeat(6, minmax(0, 1fr))",

            gap: isMobile
              ? "6px"
              : "10px",

            width: "100%",

            marginTop: "25px",
            marginBottom: "25px",
          }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] =
                  element;
              }}
              className="input-glow"
              type="text"
              inputMode="numeric"
              autoComplete={
                index === 0
                  ? "one-time-code"
                  : "off"
              }
              maxLength={1}
              aria-label={`OTP digit ${
                index + 1
              }`}
              value={digit}
              disabled={
                loading ||
                resendLoading
              }
              onPaste={handlePaste}
              onChange={(event) =>
                handleChange(
                  event.target.value,
                  index
                )
              }
              onKeyDown={(event) =>
                handleKeyDown(
                  event,
                  index
                )
              }
              style={{
                width: "100%",
                minWidth: 0,

                height: isMobile
                  ? "50px"
                  : "60px",

                padding: 0,

                borderRadius: isMobile
                  ? "12px"
                  : "16px",

                fontSize: isMobile
                  ? "1.25rem"
                  : "1.6rem",

                fontWeight: 600,
                textAlign: "center",
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile
              ? "column"
              : "row",

            alignItems: isMobile
              ? "stretch"
              : "center",

            justifyContent:
              "space-between",

            gap: "12px",

            marginTop: "20px",
          }}
        >
          <p
            style={{
              margin: 0,

              color: darkMode
                ? "#d1d5db"
                : "#6b7280",

              textAlign: isMobile
                ? "center"
                : "left",
            }}
          >
            Didn&apos;t receive the code?
          </p>

          <button
            type="button"
            className="glow-top"
            disabled={!canResend}
            onClick={handleResend}
            style={{
              width: isMobile
                ? "100%"
                : "auto",

              margin: 0,

              cursor: canResend
                ? "pointer"
                : "not-allowed",
            }}
          >
            {resendLoading
              ? "Sending..."
              : canResend
                ? "Resend OTP"
                : `Resend OTP (${seconds}s)`}
          </button>
        </div>

        <button
          type="button"
          className="glow-top"
          disabled={
            loading ||
            resendLoading
          }
          aria-busy={loading}
          onClick={handleVerify}
          style={{
            width: "100%",
            margin: "25px 0 0",
          }}
        >
          {loading
            ? "Verifying..."
            : "Verify OTP"}
        </button>

        <button
          type="button"
          className="glow-top"
          disabled={
            loading ||
            resendLoading
          }
          onClick={handleBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",

            width: "100%",
            margin: "18px 0 0",
          }}
        >
          <FaArrowLeft
            aria-hidden="true"
            size={13}
            style={{
              marginRight: "6px",
            }}
          />

          Back to Registration
        </button>
      </Card>
    </main>
  );
}

export default VerifyRegistration;