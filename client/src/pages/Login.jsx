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

function Login() {

const navigate = useNavigate();
const { login } = useContext(AuthContext);
const savedUser = JSON.parse(
  localStorage.getItem("user") || "null"
);
const darkMode = savedUser?.theme === "dark";
const backgroundImage = darkMode
  ? loginDarkBg
  : loginLightBg;
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loginError, setLoginError] = useState(false);

const handleSubmit =
async (e) => {

 
  e.preventDefault();

  try {

    const res =
      await api.post(
        "/auth/login",
        {
          email,
          password
        }
      );

    login(
      res.data.token,
      res.data.user
    );
    navigate("/dashboard");

  } catch (error) {
    setLoginError(true);
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
          alt="Nudge Logo"
          style={{
            width: "100px",
            height: "100px",
          }}
        />

        <h1>Nudge</h1>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          Remember Everything
        </p>
      </div>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>{
          setEmail(e.target.value);
          setLoginError(false);
        }}
        style={{
          borderColor: loginError ? "#ef4444" : undefined,
          boxShadow: loginError
            ? "0 0 0 2px rgba(239,68,68,.2)"
            : undefined,
        }}
      />


      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>{
          setPassword(e.target.value);
          setLoginError(false);
        }}
        style={{
          borderColor: loginError ? "#ef4444" : undefined,
          boxShadow: loginError
            ? "0 0 0 2px rgba(239,68,68,.2)"
            : undefined,
        }}
      />
      {loginError && (
        <p
          style={{
            color: "#ef4444",
            fontSize: ".9rem",
            textAlign: "center",
            margin: "-8px 0 2px",
          }}
        >
          Invalid email or password.
        </p>
      )}
      <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-6px",
  }}
>
  <Link
    to="/forgot-password"
    style={{
      fontSize: ".9rem",
      color: darkMode ? "#7dd3fc" : "#0284c7",
      textDecoration: "none",
      transition: ".25s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.textDecoration = "underline";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.textDecoration = "none";
    }}
  >
    Forgot Password?
  </Link>
</div>

      <button
        className="glow-top"
        type="submit"
        style={{
          width: "100%"
        }}
      >
        Login
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
              "Google login failed."
            );
          }
        }}
        onError={() => {
          toast.error("Google login failed.");
        }}
      />
      

      <p
        style={{
          textAlign: "center",
          marginTop: "8px",
          marginBottom: 0,
        }}
      >
        Don't have an account?{" "}
        <Link to="/register">
          Register here
        </Link>
      </p>

    </form>

  </Card>
</div>
 

);

}

export default Login;
