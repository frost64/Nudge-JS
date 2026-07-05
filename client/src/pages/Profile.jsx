import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";

import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar6 from "../assets/avatars/avatar6.png";
import avatar7 from "../assets/avatars/avatar7.png";

function Profile() {
  const {
    user,
    logout,
    setUser: setAuthUser
  } = useContext(AuthContext);

  const darkMode = user?.theme === "dark";

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [bio, setBio] = useState("");

  const [avatar, setAvatar] = useState("");

  const [theme, setTheme] = useState("light");

  const [error, setError] = useState("");

  const avatars = [
    { id: "avatar1", image: avatar1 },
    { id: "avatar2", image: avatar2 },
    { id: "avatar3", image: avatar3 },
    { id: "avatar4", image: avatar4 },
    { id: "avatar5", image: avatar5 },
    { id: "avatar6", image: avatar6 },
    { id: "avatar7", image: avatar7 }
  ];

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: darkMode
      ? "1px solid #4b5563"
      : "1px solid #d1d5db",
    backgroundColor: darkMode
      ? "#374151"
      : "#ffffff",
    color: darkMode
      ? "#f9fafb"
      : "#111827",
    boxSizing: "border-box"
  };

  const fetchProfile = async () => {
    try {
      const res =
        await api.get("/auth/me");

      setProfile(res.data);

      setBio(
        res.data.bio || ""
      );

      setAvatar(
        res.data.avatar || ""
      );

      setTheme(
        res.data.theme || "light"
      );

    } catch (error) {
      console.log(error);
      setError(
        "Failed to load profile"
      );
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const res =
        await api.put(
          "/auth/profile",
          {
            bio,
            avatar,
            theme
          }
        );

      setProfile(res.data);

      setAuthUser(res.data);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data)
      );

      alert(
        "Profile updated successfully"
      );

    } catch (error) {
      console.log(error);

      alert(
        "Failed to update profile"
      );
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account and all your saved data? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await api.delete("/auth/delete-account");

      logout();

      navigate("/");

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Failed to delete account."
      );
    }
  };

  if (!profile) {
    return (
      <Layout>
        <h2>
          {error || "Loading..."}
        </h2>
      </Layout>
    );
  }

  return (
    <Layout>

      <h1>
        Hello, {profile.username} 👋
      </h1>

      <p>
        Manage your profile and preferences.
      </p>

      <Card>

        <div
          style={{
            textAlign: "center"
          }}
        >
          <img
            src={
              avatars.find(
                (a) =>
                  a.id === avatar
              )?.image || avatar1
            }
            alt="Selected Avatar"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "20px"
            }}
          />
        </div>

        <p>
          <strong>
            Joined:
          </strong>{" "}
          {new Date(
            profile.createdAt
          ).toLocaleDateString()}
        </p>

        <p>
          <strong>
            Username:
          </strong>{" "}
          {profile.username}
        </p>

        <p>
          <strong>
            Email:
          </strong>{" "}
          {profile.email}
        </p>

        <p>
          <strong>
            Role:
          </strong>{" "}
          {profile.role}
        </p>

      </Card>

      <Card>

        <div
          style={{
            maxWidth: "700px"
          }}
        >

          <h2>
            Edit Profile
          </h2>

          <h3>
            Choose Avatar
          </h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              marginBottom: "20px"
            }}
          >
            {avatars.map(
              (item) => (
                <img
                  key={item.id}
                  src={item.image}
                  alt={item.id}
                  title={item.id}
                  onClick={() =>
                    setAvatar(
                      item.id
                    )
                  }
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    objectFit: "cover",
                    border:
                      avatar === item.id
                        ? "4px solid #2563eb"
                        : darkMode
                        ? "2px solid #4b5563"
                        : "2px solid #d1d5db"
                  }}
                />
              )
            )}
          </div>

          <textarea
            rows="4"
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) =>
              setBio(
                e.target.value
              )
            }
            style={{
              ...inputStyle,
              minHeight: "120px",
              resize: "vertical"
            }}
          />

          <br />
          <br />

          <select
            style={inputStyle}
            value={theme}
            onChange={(e) =>
              setTheme(
                e.target.value
              )
            }
          >
            <option value="light">
              Light
            </option>

            <option value="dark">
              Dark
            </option>
          </select>

          <br />
          <br />

          <button
          className="glow-top"
            onClick={handleSave}
          >
            Save Profile
          </button>

          <hr />

          <button
            className="glow-top delete"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>

          {profile.role === "user" && (
            <>
              <hr />

              <button
                className="glow-top delete"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </>
          )}

        </div>

      </Card>

    </Layout>
  );
}

export default Profile;