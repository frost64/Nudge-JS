import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

import Card from "../components/Card";
import logo from "../assets/Logo.svg";

import { FaLock, FaKey } from "react-icons/fa";

import resetLightBg from "../assets/backgrounds/loginLight.png";
import resetDarkBg from "../assets/backgrounds/loginDark.png";

function ResetPassword() {

  const navigate = useNavigate();
  const { token } = useParams();

  const savedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const darkMode = savedUser?.theme === "dark";

  const backgroundImage = darkMode
    ? resetDarkBg
    : resetLightBg;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {

      await api.put(
        `/auth/reset-password/${token}`,
        { password }
      );

      toast.success("Password reset successfully.");

      navigate("/");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Unable to reset password."
      );

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
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <Card
        variant="glass"
        style={{
          width: "100%",
          maxWidth: "450px",
          padding: "40px",
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
              marginBottom: "10px",
            }}
          >

            <img
              src={logo}
              alt="Logo"
              style={{
                width: 90,
                marginBottom: 15,
              }}
            />

            <h1>Reset Password</h1>

            <p>
              Enter your new password.
            </p>

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
    placeholder="New Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={{ paddingLeft: "42px" }}
  />
</div>

          <div style={{ position: "relative" }}>
  <FaKey
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
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    style={{ paddingLeft: "42px" }}
  />
</div>

          <button
  className="glow-top"
  style={{
    width: "100%",
  }}
>
  <FaKey
    size={14}
    style={{ marginRight: "6px" }}
  />
  Reset Password
</button>

        </form>

      </Card>

    </div>
  );

}

export default ResetPassword;