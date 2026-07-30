import { useEffect, useState, useContext, useRef} from "react";
import { LayoutContext } from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import toast from "react-hot-toast";
import api from "../services/api";
import ImageCropModal from "../components/ImageCropModal";
import getCroppedImg from "../utils/cropImage";
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

import {
  FaSave,
  FaKey,
  FaSignOutAlt,
  FaTrashAlt,
  FaUpload,
  FaCog, 
  FaUserCircle, 
  FaPenFancy,
  FaLock,
  FaEnvelope,
  FaAt,
  FaIdCard,
  FaUser,
  FaUserShield,
  FaCalendarAlt, 
} from "react-icons/fa";

function Profile() {

const {
user,
logout,
setUser:setAuthUser
}=useContext(AuthContext);

const navigate=useNavigate();
const confirm=useConfirm();
const { isMobile } = useContext(LayoutContext);
const darkMode=user?.theme==="dark";

const formBackground=
darkMode
?profileDarkBg
:profileLightBg;

const [profile,setProfile]=useState(null);
const [avatar,setAvatar]=useState("");
const [bio,setBio]=useState("");
const [fullName, setFullName] = useState("");
const [username,setUsername]=useState("");
const [email,setEmail]=useState("");
const [currentPassword,setCurrentPassword]=useState("");
const [newPassword,setNewPassword]=useState("");
const [confirmPassword,setConfirmPassword]=useState("");
const [error,setError]=useState("");
const [uploading, setUploading] = useState(false);
const [selectedImage, setSelectedImage] = useState(null);
const [previewImage, setPreviewImage] = useState("");

const fileInputRef = useRef(null);

const [cropModalOpen, setCropModalOpen] = useState(false);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
const [croppedBlob, setCroppedBlob] = useState(null);


const avatars=[
{id:"avatar1",image:avatar1},
{id:"avatar2",image:avatar2},
{id:"avatar3",image:avatar3},
{id:"avatar4",image:avatar4},
{id:"avatar5",image:avatar5},
{id:"avatar6",image:avatar6},
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
    setFullName(res.data.fullName || "");
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
  return () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
  };
}, [previewImage]);


useEffect(() => {
  fetchProfile();
}, []);


const handleProfileUpdate = async () => {
  try {
    setUploading(true);
    let avatarToSave = avatar;

    if (croppedBlob) {
      avatarToSave =
        await uploadCroppedAvatar();
    }

    await api.put("/auth/profile", {
      avatar: avatarToSave,
      bio,
    });
    
    await fetchProfile();
    
    setSelectedImage(null);
    setCroppedBlob(null);
    setPreviewImage("");
    setCroppedAreaPixels(null);
    
    toast.success("Profile updated.");

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to update profile."
    );
  }
  finally {
    setUploading(false);
  }
};

const handleCropSave = async () => {
  const blob = await getCroppedImg(
    selectedImage,
    croppedAreaPixels
  );

  setCroppedBlob(blob);

  if (previewImage) {
    URL.revokeObjectURL(previewImage);
  }
  setPreviewImage(URL.createObjectURL(blob));

  setCropModalOpen(false);
};

const uploadCroppedAvatar = async () => {
  if (!croppedBlob) return avatar;

  const formData = new FormData();

  formData.append(
    "image",
    croppedBlob,
    "avatar.jpg"
  );

  const res = await api.put(
    "/auth/profile-picture",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return res.data.avatar;
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    setSelectedImage(reader.result);
    setCropModalOpen(true);
  };

  reader.readAsDataURL(file);

  e.target.value = "";
};
const handleFullNameUpdate = async () => {
  if (!fullName.trim()) {
    return toast.error("Full name is required.");
  }

  try {
    await api.put("/auth/fullname", {
      fullName,
    });

    await fetchProfile();

    toast.success("Full name updated.");

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to update full name."
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
      position: isMobile ? "static" : "fixed",
      top: isMobile ? undefined : "15%",
      left: isMobile ? undefined : "2%",
      width: isMobile ? "100%" : "20%",
      minHeight: isMobile ? "auto" : "75%",
      padding: "24px",
      borderRadius: "22px",
    }}
  >
    <img
      src={
        previewImage
          ? previewImage
          : avatar?.startsWith("/uploads/")
          ? `${import.meta.env.VITE_API_URL.replace(
              "/api",
              ""
            )}${avatar}`
          : avatars.find((a) => a.id === avatar)
              ?.image || defaultAvatar
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
    
    <p><FaUser color="#00be9f"/> <strong> Full Name:</strong> {profile.fullName}</p>
    
    <p><FaAt color="#00be9f"/> <strong> Username:</strong> {profile.username}</p>

    <p><FaEnvelope color="#00be9f"/> <strong> Email:</strong> {profile.email}</p>

    <p><FaUserShield color="#00be9f"/> <strong> Role:</strong> {profile.role}</p>

    <p>
      <FaCalendarAlt color="#00be9f"/> <strong> Joined:</strong>{" "}
      {new Date(profile.createdAt).toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )}
    </p>

    <p>
      <FaPenFancy color="#00be9f"/> <strong> Bio:</strong>
      {" "}
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
        maxWidth: "800px",
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />


        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "35px",
          }}
        >
          <FaCog />
          Account Settings
        </h2>

        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "18px",
          }}
        >
          <FaUserCircle />
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
              onClick={() => {
                if (uploading) return;

                setAvatar(item.id);
                setPreviewImage("");
                setSelectedImage(null);
                setCroppedBlob(null);
              }}
              style={{
                width: "82px",
                height: "82px",
                borderRadius: "50%",
                objectFit: "cover",
                cursor: "pointer",

                opacity: uploading ? 0.6 : 1,
                pointerEvents: uploading ? "none" : "auto",

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
          <div
            
            onClick={() => {
              if (uploading) return;
              fileInputRef.current?.click()
            }}
            style={{
              width: "82px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.6 : 1,
              pointerEvents: uploading ? "none" : "auto",
            }}
          >
            <div
              style={{
                width: "82px",
                height: "82px",
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: previewImage || croppedBlob || avatar?.startsWith("/uploads/")
                  ? "3px solid #38bdf8"
                  : darkMode
                  ? "2px dashed rgba(255,255,255,.25)"
                  : "2px dashed rgba(0,0,0,.18)",
              }}
            >
              {previewImage || avatar?.startsWith("/uploads/") ? (
                <img
                  src={
                    previewImage
                      ? previewImage
                      : avatar?.startsWith("/uploads/")
                        ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${avatar}`
                        : avatars.find(a => a.id === avatar)?.image || defaultAvatar
                  }
                  alt="Uploaded Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                "+"
              )}
            </div>

            <span
              style={{
                marginTop: "10px",
                fontSize: "13px",
                textAlign: "center",
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <FaUpload size={12} />
              Upload
            </span>
          </div>
        </div>

        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaPenFancy />
          Bio
        </h3>

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
            disabled={
              uploading ||
              (
                !croppedBlob &&
                bio === (profile?.bio || "") &&
                avatar === (profile?.avatar || "")
              )
            }
            style={{
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.7 : 1,
            }}
          >
            <FaSave size={14} style={{ marginRight: "6px" }} />
              {uploading ? "Updating..." : "Update Profile"}
          </button>
        </div>
          <hr style={{ margin: "35px 0" }} />

          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaIdCard />
            Full Name
          </h3>

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
              value={fullName}
              placeholder="Enter your full name"
              onChange={(e) =>
                setFullName(e.target.value)
              }
              style={inputStyle}
            />

            <button
              className="glow-top"
              onClick={handleFullNameUpdate}
            ><FaIdCard size={14} style={{ marginRight: "6px" }} />
              Update Name
            </button>
          </div>

        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaAt />
          Username
        </h3>
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
          ><FaAt size={14} style={{ marginRight: "6px" }} />
            Update Username
          </button>
        </div>

        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaEnvelope />
          Email
        </h3>
        
        
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
          ><FaEnvelope size={14} style={{ marginRight: "6px" }} />
             Update Email 
          </button>
        </div>

          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaLock />
            Password
          </h3>
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
          ><FaKey size={14} style={{ marginRight: "6px" }} />
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
        ><FaSignOutAlt size={14} style={{ marginRight: "6px" }} />
          Logout
        </button>

        {profile.role === "user" && (
          <button
            className="glow-top delete"
            onClick={handleDeleteAccount}
          ><FaTrashAlt size={14} style={{ marginRight: "6px" }} />
            Delete Account
          </button>
        )}
      </div>

    </div>
    <ImageCropModal
      open={cropModalOpen}
      image={selectedImage}
      darkMode={darkMode}
      onCancel={() => {
        setCropModalOpen(false);
        setSelectedImage(null);
        setCroppedAreaPixels(null);
        setCroppedBlob(null);

        if (previewImage) {
          URL.revokeObjectURL(previewImage);
        }

        setPreviewImage("");
      }}
      onCropComplete={(_, pixels) =>
        setCroppedAreaPixels(pixels)
      }
      onSave={handleCropSave}
    />
  </Layout>
);

}

export default Profile;