import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Card from "../components/Card";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

import logo from "../assets/Logo.svg";
import loginLightBg from "../assets/backgrounds/loginLight.png";
import loginDarkBg from "../assets/backgrounds/loginDark.png";

import {
  FaKey,
  FaEnvelope,
  FaPaperPlane,
  FaArrowLeft,
} from "react-icons/fa";

function ForgotPassword() {
  const { user } = useContext(AuthContext);

  const savedUser =
    user ||
    JSON.parse(localStorage.getItem("user") || "null");

  const darkMode = savedUser?.theme === "dark";

  const backgroundImage = darkMode
    ? loginDarkBg
    : loginLightBg;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      return toast.error("Please enter your email.");
    }

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", {
        email,
      });

      toast.success(
        "Password reset link sent."
      );

      setEmail("");

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",

        background: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed", 
      }}
    >
      <Card
        variant="glass"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "42px",
          borderRadius: "28px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "90px",
                marginBottom: "15px",
              }}
            />

            <h1
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <FaKey />
              Forgot Password
            </h1>

            <p
              style={{
                opacity: .7,
              }}
            >
              Enter your registered email and
              we'll send you a password reset link.
            </p>
          </div>

          <div
            style={{
              position: "relative",
            }}
          >
            <FaEnvelope
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.7,
                pointerEvents: "none",
              }}
            />

            <input
              className="input-glow"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                paddingLeft: "46px",
              }}
            />
          </div>

          <button
            className="glow-top"
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
            }}
          >
            <>
              <FaPaperPlane
                size={14}
                style={{ marginRight: "8px" }}
              />
              {loading ? "Sending..." : "Send Reset Link"}
            </>
          </button>

          <p
            style={{
              textAlign: "center",
              margin: 0,
            }}
          >
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FaArrowLeft size={13} />
              Back to Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

export default ForgotPassword;