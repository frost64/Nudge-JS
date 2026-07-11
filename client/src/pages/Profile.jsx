import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import toast from "react-hot-toast";
import api from "../services/api";

import Layout from "../components/Layout";
import Card from "../components/Card";

import profileLightBg from "../assets/backgrounds/dashboard-light.png";
import profileDarkBg from "../assets/backgrounds/dashboard-dark.png";

import defaultAvatar from "../assets/avatars/defaultAvatar.png";
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
setUser:setAuthUser
}=useContext(AuthContext);

const navigate=useNavigate();
const confirm=useConfirm();

const darkMode=user?.theme==="dark";

const formBackground=
darkMode
?profileDarkBg
:profileLightBg;

const [profile,setProfile]=useState(null);

const [avatar,setAvatar]=useState("");
const [bio,setBio]=useState("");

const [username,setUsername]=useState("");
const [email,setEmail]=useState("");

const [currentPassword,setCurrentPassword]=useState("");
const [newPassword,setNewPassword]=useState("");
const [confirmPassword,setConfirmPassword]=useState("");

const [error,setError]=useState("");

const avatars=[
{id:"avatar1",image:avatar1},
{id:"avatar2",image:avatar2},
{id:"avatar3",image:avatar3},
{id:"avatar4",image:avatar4},
{id:"avatar5",image:avatar5},
{id:"avatar6",image:avatar6},
{id:"avatar7",image:avatar7},
];

const inputStyle={
width:"100%",
padding:"12px 15px",
marginTop:"10px",
marginBottom:"18px",
borderRadius:"12px",
background:"rgba(255,255,255,.08)",
backdropFilter:"blur(16px)",
WebkitBackdropFilter:"blur(16px)",
border:darkMode
?"1px solid rgba(255,255,255,.15)"
:"1px solid rgba(255,255,255,.35)",
color:darkMode?"#fff":"#111",
boxSizing:"border-box",
};



const fetchProfile = async () => {
  try {
    const res = await api.get("/auth/me");

    setProfile(res.data);

    setAvatar(res.data.avatar || "");
    setBio(res.data.bio || "");

    setUsername(res.data.username || "");
    setEmail(res.data.email || "");

    // Keep AuthContext in sync
    setAuthUser(res.data);

    localStorage.setItem(
      "user",
      JSON.stringify(res.data)
    );

  } catch (error) {
    console.log(error);

    const message =
      error.response?.data?.message ||
      "Failed to load profile.";

    toast.error(message);

    setError(message);
  }
};

useEffect(() => {
  fetchProfile();
}, []);

const handleProfileUpdate=async()=>{

try{

const res=await api.put("/auth/profile",{

avatar,
bio,

});
await fetchProfile();

toast.success("Profile updated.");

}
catch(error){

toast.error(

error.response?.data?.message||
"Failed to update profile."

);

}

};

const handleUsernameUpdate = async () => {

  if (!username.trim()) {
    return toast.error("Username is required.");
  }

  try {

    await api.put("/auth/username", {
      username,
    });

    await fetchProfile();

    toast.success("Username updated.");

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to update username."
    );

  }

};

const handleEmailUpdate = async () => {

  if (!email.trim()) {
    return toast.error("Email is required.");
  }

  try {

    await api.put("/auth/email", {
      email,
    });

    await fetchProfile();

    toast.success("Email updated.");

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to update email."
    );

  }

};


const handlePasswordUpdate = async () => {

  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    return toast.error("Fill all password fields.");
  }

  try {

    await api.put("/auth/password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    await fetchProfile();

    toast.success("Password updated.");

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to update password."
    );

  }

};

const handleLogout=async()=>{

const confirmed=await confirm({

title:"Logout",
message:"Are you sure you want to logout?",
confirmText:"Logout",
cancelText:"Cancel",

});

if(!confirmed)return;

logout();

toast.success("Logged out.");

navigate("/");

};

const handleDeleteAccount=async()=>{

const confirmed=await confirm({

title:"Delete Account",
message:"This action cannot be undone.",
confirmText:"Delete",
cancelText:"Cancel",

});

if(!confirmed)return;

try{

await api.delete("/auth/delete-account");

logout();

toast.success("Account deleted.");

navigate("/");

}
catch(error){

toast.error(

error.response?.data?.message||
"Failed to delete account."

);

}

};

if(!profile){

return(

<Layout>

<h2>{error||"Loading..."}</h2>

</Layout>

);

}

const sidebar = (
  <Card
    variant="glass"
    style={{
      position: "fixed",
      top: "15%",
      left: "2%",
      width: "20%",
      minHeight: "80%",
      padding: "24px",
      borderRadius: "22px",
    }}
  >
    <img
      src={
        avatars.find((a) => a.id === avatar)?.image ||
        defaultAvatar
      }
      alt="Avatar"
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        display: "block",
        margin: "0 auto 20px",
      }}
    />

    <h2
      style={{
        textAlign: "center",
        marginBottom: "20px",
      }}
    >
      Profile Overview
    </h2>

    <p><strong>Username:</strong> {profile.username}</p>

    <p><strong>Email:</strong> {profile.email}</p>

    <p>
      <strong>Theme:</strong>{" "}
      {darkMode ? "Dark Mode" : "Light Mode"}
    </p>

    <p><strong>Role:</strong> {profile.role}</p>

    <p>
      <strong>Joined:</strong>{" "}
      {new Date(profile.createdAt).toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )}
    </p>

    <p style={{ marginTop: "18px" }}>
      <strong>Bio:</strong>
      <br />
      {bio || "No bio yet"}
    </p>
  </Card>
);

return (
  <Layout
    backgroundImage={formBackground}
    sidebar={sidebar}
    cardVariant="glass"
  >
    <div
      style={{
        width: "100%",
        maxWidth: "760px",
        margin: "0 auto",
        paddingBottom: "50px",
      }}
    >
      <Card
        variant="glass"
        style={{
          padding: "35px",
        }}
      >
        <h2
          style={{
            textAlign: "left",
            marginBottom: "35px",
          }}
        >
          ⚙️ Account Settings
        </h2>

        <h3
          style={{
            textAlign: "left",
            marginBottom: "18px",
          }}
        >
          Choose Avatar
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "18px",
            marginBottom: "35px",
          }}
        >
          {avatars.map((item) => (
            <img
              key={item.id}
              src={item.image}
              alt={item.id}
              onClick={() => setAvatar(item.id)}
              style={{
                width: "82px",
                height: "82px",
                borderRadius: "50%",
                objectFit: "cover",
                cursor: "pointer",

                border:
                  avatar === item.id
                    ? "3px solid #38bdf8"
                    : darkMode
                    ? "2px solid rgba(255,255,255,.18)"
                    : "2px solid rgba(0,0,0,.12)",

                transform:
                  avatar === item.id
                    ? "translateY(-4px) scale(1.08)"
                    : "translateY(0px) scale(1)",

                boxShadow:
                  avatar === item.id
                    ? "0 18px 35px rgba(56,189,248,.55)"
                    : "0 10px 20px rgba(0,0,0,.18)",

                transition: ".28s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-6px) scale(1.1)";
                e.currentTarget.style.boxShadow =
                  "0 20px 35px rgba(56,189,248,.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  avatar === item.id
                    ? "translateY(-4px) scale(1.08)"
                    : "translateY(0px) scale(1)";

                e.currentTarget.style.boxShadow =
                  avatar === item.id
                    ? "0 18px 35px rgba(56,189,248,.55)"
                    : "0 10px 20px rgba(0,0,0,.18)";
              }}
            />
          ))}
        </div>

        <h3>Bio</h3>

        <textarea
          className="input-glow"
          rows="4"
          placeholder="Tell us about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={{
            ...inputStyle,
            maxWidth: "800px",
            minHeight: "130px",
            resize: "vertical",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "18px",
            marginBottom: "40px",
          }}
        >
          <button
            className="glow-top"
            onClick={handleProfileUpdate}
          >
            Update Profile
          </button>
        </div>

        <hr style={{ margin: "35px 0" }} />

        <h3>Username</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            marginBottom: "20px",
          }}
        >
          <input
            className="input-glow"
            type="text"
            value={username}
            placeholder="Enter new username"
            onChange={(e) =>
              setUsername(e.target.value)
            }
            style={inputStyle}
          />
          <button
            className="glow-top"
            onClick={handleUsernameUpdate}
          >
            Update Username
          </button>
        </div>

        <hr style={{ margin: "30px 0" }} />

        <h3>Email</h3>
        
        
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            marginBottom: "20px",
          }}
        >
          <input
            className="input-glow"
            type="email"
            value={email}
            placeholder="Enter new email"
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={inputStyle}
          />

          <button
            className="glow-top"
            onClick={handleEmailUpdate}
          >
             Update Email 
          </button>
        </div>

        <hr style={{ margin: "30px 0" }} />
          <h3>Password</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            marginBottom: "5px",
          }}
        >
          <input
            className="input-glow"
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }
            style={inputStyle}
          />

          <button
            className="glow-top"
            onClick={handlePasswordUpdate}
          >
            Update Password
          </button>
          </div>

          <input
            className="input-glow"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            style={inputStyle}
          />

          <input
            className="input-glow"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            style={inputStyle}
          />


      </Card>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "18px",
          flexWrap: "wrap",
          marginTop: "28px",
        }}
      >
        <button
          className="glow-top delete"
          onClick={handleLogout}
        >
          Logout
        </button>

        {profile.role === "user" && (
          <button
            className="glow-top delete"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        )}
      </div>

    </div>

  </Layout>
);

}

export default Profile;