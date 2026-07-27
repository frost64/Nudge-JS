import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import Card from "../components/Card";
import logo from "../assets/Logo.svg";

import loginLightBg from "../assets/backgrounds/loginLight.png";
import loginDarkBg from "../assets/backgrounds/loginDark.png";
import {
  FaUser,
  FaAt,
  FaEnvelope,
  FaLock,
  FaUserPlus,
} from "react-icons/fa";

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const savedUser = JSON.parse(
  localStorage.getItem("user") || "null"
);

  const darkMode = savedUser?.theme === "dark";

  const backgroundImage = darkMode
    ? loginDarkBg
    : loginLightBg;

  const handleSubmit = async () => {
  if (loading) return;
  if (
    !fullName || 
    !username.trim() ||
    !email.trim() ||
    !password.trim()
  ) {
    toast.error("Please fill all fields.");
    return;
  }

  try {

    setLoading(true);

    await api.post(
      "/auth/register",
      {
        fullName,
        username,
        email,
        password,
      }
    );

    toast.success(
      "Registration successful!"
    );

    navigate("/", {
      state: {
        message:
          "Registration successful. Please login.",
      },
    });

  } catch (error) {

    console.log(error);

    toast.error(
      error.response?.data?.message ||
      "Cannot connect to backend server."
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
        padding: "10px",

        background: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",

        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: darkMode
            ? "rgba(0,0,0,.20)"
            : "rgba(255,255,255,.08)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      />
        <Card
          variant="glass"
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "450px",
            padding: "40px",
            borderRadius: "28px",
          }}
        >

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >

          <div
            style={{
              textAlign:
                "center"
            }}
          >
            <img
              src={logo}
              alt="Nudge Logo"
              style={{
                width: "100px",
                height: "100px",
              }}
            />

            <h1>
              Nudge
            </h1>

            <p
              style={{
                color: "#6b7280",
              }}
            >
              Create your account
            </p>
          </div>

          
            <div style={{ position: "relative" }}>
              <FaUser
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 0.7,
                }}
              />

              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                disabled={loading}
                onChange={(e) => setFullName(e.target.value)}
                style={{ paddingLeft: "42px" }}
              />
            </div>

            <div style={{ position: "relative" }}>
  <FaAt
    style={{
      position: "absolute",
      left: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      opacity: 0.7,
    }}
  />

  <input
    type="text"
    placeholder="Username"
    value={username}
    disabled={loading}
    onChange={(e) => setUsername(e.target.value)}
    style={{ paddingLeft: "42px" }}
  />
</div>

            <div style={{ position: "relative" }}>
  <FaEnvelope
    style={{
      position: "absolute",
      left: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      opacity: 0.7,
    }}
  />

  <input
    type="email"
    placeholder="Email"
    value={email}
    disabled={loading}
    onChange={(e) => setEmail(e.target.value)}
    style={{ paddingLeft: "42px" }}
  />
</div>

            <div style={{ position: "relative" }}>
  <FaLock
    style={{
      position: "absolute",
      left: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      opacity: 0.7,
    }}
  />

  <input
    type="password"
    placeholder="Password"
    value={password}
    disabled={loading}
    onChange={(e) => setPassword(e.target.value)}
    style={{ paddingLeft: "42px" }}
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
  <FaUserPlus
    size={14}
    style={{ marginRight: "6px" }}
  />

  {loading
    ? "Creating Account..."
    : "Register"}
</button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "rgba(255,255,255,.2)",
                }}
              />

              <span
                style={{
                  padding: "0 12px",
                  color: "#888",
                  fontSize: ".9rem",
                }}
              >
                OR
              </span>

              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "rgba(255,255,255,.2)",
                }}
              />
            </div>

            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await api.post("/auth/google", {
                    credential: credentialResponse.credential,
                  });

                  login(
                    res.data.token,
                    res.data.user
                  );

                  navigate("/dashboard");
                } catch (error) {
                  console.error(error);

                  toast.error(
                    error.response?.data?.message ||
                    "Google sign up failed."
                  );
                }
              }}
              onError={() => {
                toast.error("Google signup failed.");
              }}
            />

          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "8px",
              marginBottom: 0,
            }}
          >
            Already have an account?{" "}
            <Link
              to="/"
              style={{
                color: darkMode ? "#7dd3fc" : "#0284c7",
                textDecoration: "none",
              }}
            >
              Login here
            </Link>
          </p>

        </Card>
      </div>
  );
}

export default Register;