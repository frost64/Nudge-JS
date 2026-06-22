import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

import Card from "../components/Card";
import logo from "../assets/Logo.svg";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit =
    async () => {

      if (
        !username.trim() ||
        !email.trim() ||
        !password.trim()
      ) {
        setError(
          "Please fill all fields"
        );
        return;
      }

      try {

        setLoading(true);
        setError("");

        await api.post(
          "/auth/register",
          {
            username,
            email,
            password
          }
        );

        navigate("/", {
          state: {
            message:
              "Registration successful. Please login."
          }
        });

      } catch (error) {

        if (
          error.response
        ) {

          setError(
            error.response
              .data
              .message
          );

        } else {

          setError(
            "Cannot connect to backend server"
          );

        }

      } finally {

        setLoading(false);

      }

    };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent:
          "center",
        alignItems:
          "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px"
        }}
      >
        <Card>

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
                marginBottom:
                  "15px"
              }}
            />

            <h1>
              Nudge
            </h1>

            <p
              style={{
                color:
                  "#6b7280",
                marginBottom:
                  "25px"
              }}
            >
              Create your account
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >

            {error && (
              <p
                style={{
                  color:
                    "#dc2626",
                  marginBottom:
                    "15px"
                }}
              >
                {error}
              </p>
            )}

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
            />

            <br />
            <br />

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
              disabled={
                loading
              }
            >
              {loading
                ? "Creating Account..."
                : "Register"}
            </button>

          </form>

          <br />

          <p
            style={{
              textAlign:
                "center"
            }}
          >
            Already have an account?{" "}
            <Link to="/">
              Login here
            </Link>
          </p>

        </Card>
      </div>
    </div>
  );
}

export default Register;