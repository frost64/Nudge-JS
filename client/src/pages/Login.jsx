import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

import Card from "../components/Card";
import logo from "../assets/Logo.svg";

function Login() {

const navigate = useNavigate();

const { login } =
useContext(AuthContext);

const [email, setEmail] =
useState("");

const [password, setPassword] =
useState("");

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

    if (error.response) {

      alert(
        error.response.data.message ||
        "Login failed"
      );

    } else {

      alert(
        "Cannot connect to backend server"
      );

    }

  }

};
 

return (
<div
style={{
minHeight: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
padding: "20px"
}}
> <Card>

 
    <form
      onSubmit={handleSubmit}
    >

      <div
        style={{
          textAlign: "center"
        }}
      >
        <img
          src={logo}
          alt="Nudge Logo"
          style={{
            width: "100px",
            height: "100px",
            marginBottom: "15px"
          }}
        />

        <h1>Nudge</h1>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "25px"
          }}
        >
          Remember Everything
        </p>
      </div>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <button
        type="submit"
      >
        Login
      </button>

      <br />
      <br />

      <p
        style={{
          textAlign: "center"
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
