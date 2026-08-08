import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaAt,
  FaCalendarAlt,
  FaCog,
  FaEnvelope,
  FaIdCard,
  FaKey,
  FaLock,
  FaPenFancy,
  FaSave,
  FaSignOutAlt,
  FaTrashAlt,
  FaUpload,
  FaUser,
  FaUserCircle,
  FaUserShield,
} from "react-icons/fa";

import defaultAvatar from "../assets/avatars/defaultAvatar.png";
import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar6 from "../assets/avatars/avatar6.png";

import profileDarkBg from "../assets/backgrounds/dashboard-dark.png";
import profileLightBg from "../assets/backgrounds/dashboard-light.png";

import Card from "../components/Card";
import ImageCropModal from "../components/ImageCropModal";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";

import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";
import getCroppedImg from "../utils/cropImage";

const AVATARS = [
  {
    id: "avatar1",
    image: avatar1,
  },
  {
    id: "avatar2",
    image: avatar2,
  },
  {
    id: "avatar3",
    image: avatar3,
  },
  {
    id: "avatar4",
    image: avatar4,
  },
  {
    id: "avatar5",
    image: avatar5,
  },
  {
    id: "avatar6",
    image: avatar6,
  },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ACTIONS = {
  PROFILE: "profile",
  FULL_NAME: "fullName",
  USERNAME: "username",
  EMAIL: "email",
  PASSWORD: "password",
  DELETE: "delete",
};

/**
 * Returns the base backend URL used for uploaded profile images.
 */
function getUploadBaseUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || "";

  return apiUrl.replace(/\/api\/?$/, "");
}

/**
 * Returns the correct image source for a stored avatar value.
 */
function resolveAvatarSource(
  avatar,
  previewImage = ""
) {
  if (previewImage) {
    return previewImage;
  }

  if (avatar?.startsWith("/uploads/")) {
    return `${getUploadBaseUrl()}${avatar}`;
  }

  return (
    AVATARS.find((item) => item.id === avatar)
      ?.image || defaultAvatar
  );
}

/**
 * Formats the user's account creation date.
 */
function formatJoinedDate(date) {
  if (!date) return "Unknown";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return parsedDate.toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

/**
 * Displays and manages profile information, account settings,
 * avatars, password updates, logout, and account deletion.
 */
function Profile() {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const {
    user,
    logout,
    setUser: setAuthUser,
  } = useContext(AuthContext);

  const {
    isMobile,
    isTablet,
  } = useBreakpoint();

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

  const [profile, setProfile] =
    useState(null);

  const [avatar, setAvatar] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [activeAction, setActiveAction] =
    useState("");

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    previewImage,
    setPreviewImage,
  ] = useState("");

  const [
    cropModalOpen,
    setCropModalOpen,
  ] = useState(false);

  const [
    croppedAreaPixels,
    setCroppedAreaPixels,
  ] = useState(null);

  const [
    croppedBlob,
    setCroppedBlob,
  ] = useState(null);

  const darkMode =
    user?.theme === "dark";

  const formBackground = darkMode
    ? profileDarkBg
    : profileLightBg;

  const isBusy = Boolean(activeAction);

  const avatarSource = useMemo(
    () =>
      resolveAvatarSource(
        avatar,
        previewImage
      ),
    [
      avatar,
      previewImage,
    ]
  );

  const uploadedAvatarSource = useMemo(
    () =>
      resolveAvatarSource(
        avatar,
        previewImage
      ),
    [
      avatar,
      previewImage,
    ]
  );

  const profileChanged =
    Boolean(croppedBlob) ||
    bio !== (profile?.bio || "") ||
    avatar !== (profile?.avatar || "");

  const rowDirection = isMobile
    ? "column"
    : "row";

  const sectionPadding = isMobile
    ? "20px"
    : isTablet
      ? "28px"
      : "35px";

  /**
   * Releases the current object URL used for cropped-image preview.
   */
  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );

      previewUrlRef.current = "";
    }
  }, []);

  /**
   * Clears temporary crop and upload state.
   */
  const clearImageSelection = useCallback(
    ({
      clearPreview = true,
    } = {}) => {
      setSelectedImage(null);
      setCroppedBlob(null);
      setCroppedAreaPixels(null);
      setCropModalOpen(false);

      if (clearPreview) {
        revokePreviewUrl();
        setPreviewImage("");
      }
    },
    [revokePreviewUrl]
  );

  /**
   * Synchronizes local profile state with data returned by the API.
   */
  const applyProfileData = useCallback(
    (profileData) => {
      setProfile(profileData);

      setAvatar(
        profileData.avatar || ""
      );

      setBio(
        profileData.bio || ""
      );

      setFullName(
        profileData.fullName || ""
      );

      setUsername(
        profileData.username || ""
      );

      setEmail(
        profileData.email || ""
      );

      setAuthUser(profileData);
    },
    [setAuthUser]
  );

  /**
   * Loads the current authenticated user's profile.
   */
  const fetchProfile = useCallback(
    async (signal) => {
      try {
        const response = await api.get(
          "/auth/me",
          {
            signal,
          }
        );

        applyProfileData(
          response.data
        );

        setError("");

        return response.data;
      } catch (requestError) {
        if (
          requestError.name ===
            "CanceledError" ||
          requestError.code ===
            "ERR_CANCELED"
        ) {
          return null;
        }

        console.error(requestError);

        const message =
          requestError.response?.data
            ?.message ||
          "Failed to load profile.";

        setError(message);
        toast.error(message);

        return null;
      }
    },
    [applyProfileData]
  );

  useEffect(() => {
    const controller =
      new AbortController();

    fetchProfile(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchProfile]);

  useEffect(
    () => () => {
      revokePreviewUrl();
    },
    [revokePreviewUrl]
  );

  /**
   * Uploads the currently cropped avatar and returns its stored path.
   */
  const uploadCroppedAvatar =
    useCallback(async () => {
      if (!croppedBlob) {
        return avatar;
      }

      const formData = new FormData();

      formData.append(
        "image",
        croppedBlob,
        "avatar.jpg"
      );

      const response = await api.put(
        "/auth/profile-picture",
        formData
      );

      return response.data.avatar;
    }, [
      avatar,
      croppedBlob,
    ]);

  /**
   * Saves avatar and bio changes.
   */
  const handleProfileUpdate =
    useCallback(async () => {
      if (
        activeAction ||
        !profileChanged
      ) {
        return;
      }

      try {
        setActiveAction(
          ACTIONS.PROFILE
        );

        const avatarToSave =
          croppedBlob
            ? await uploadCroppedAvatar()
            : avatar;

        const response = await api.put(
          "/auth/profile",
          {
            avatar: avatarToSave,
            bio: bio.trim(),
          }
        );

        const updatedProfile =
          response.data?.user ||
          response.data;

        if (
          updatedProfile?._id ||
          updatedProfile?.email
        ) {
          applyProfileData(
            updatedProfile
          );
        } else {
          await fetchProfile();
        }

        clearImageSelection();

        toast.success(
          "Profile updated."
        );
      } catch (requestError) {
        console.error(requestError);

        toast.error(
          requestError.response?.data
            ?.message ||
            "Failed to update profile."
        );
      } finally {
        setActiveAction("");
      }
    }, [
      activeAction,
      applyProfileData,
      avatar,
      bio,
      clearImageSelection,
      croppedBlob,
      fetchProfile,
      profileChanged,
      uploadCroppedAvatar,
    ]);

  /**
   * Generates a cropped preview from the cropper selection.
   */
  const handleCropSave =
    useCallback(async () => {
      if (
        !selectedImage ||
        !croppedAreaPixels
      ) {
        toast.error(
          "Select a crop area first."
        );

        return;
      }

      try {
        const blob =
          await getCroppedImg(
            selectedImage,
            croppedAreaPixels
          );

        revokePreviewUrl();

        const nextPreviewUrl =
          URL.createObjectURL(blob);

        previewUrlRef.current =
          nextPreviewUrl;

        setCroppedBlob(blob);
        setPreviewImage(
          nextPreviewUrl
        );

        setCropModalOpen(false);
      } catch (cropError) {
        console.error(cropError);

        toast.error(
          "Failed to crop image."
        );
      }
    }, [
      croppedAreaPixels,
      revokePreviewUrl,
      selectedImage,
    ]);

  /**
   * Validates a selected image before opening the crop modal.
   */
  const handleImageUpload =
    useCallback((event) => {
      const file =
        event.target.files?.[0];

      event.target.value = "";

      if (!file) return;

      if (
        !file.type.startsWith("image/")
      ) {
        toast.error(
          "Please select an image file."
        );

        return;
      }

      if (
        file.size > MAX_IMAGE_SIZE
      ) {
        toast.error(
          "Image must be smaller than 5 MB."
        );

        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        setSelectedImage(
          reader.result
        );

        setCroppedAreaPixels(null);
        setCropModalOpen(true);
      };

      reader.onerror = () => {
        toast.error(
          "Failed to read image."
        );
      };

      reader.readAsDataURL(file);
    }, []);

  /**
   * Selects a predefined avatar and clears custom-image state.
   */
  const handleAvatarSelect =
    useCallback(
      (avatarId) => {
        if (isBusy) return;

        revokePreviewUrl();

        setAvatar(avatarId);
        setPreviewImage("");
        setSelectedImage(null);
        setCroppedBlob(null);
        setCroppedAreaPixels(null);
      },
      [
        isBusy,
        revokePreviewUrl,
      ]
    );

  /**
   * Updates the user's full name.
   */
  const handleFullNameUpdate =
    useCallback(async () => {
      const normalizedFullName =
        fullName.trim();

      if (!normalizedFullName) {
        toast.error(
          "Full name is required."
        );

        return;
      }

      if (
        normalizedFullName ===
        (profile?.fullName || "")
      ) {
        toast.error(
          "Full name has not changed."
        );

        return;
      }

      try {
        setActiveAction(
          ACTIONS.FULL_NAME
        );

        await api.put(
          "/auth/fullname",
          {
            fullName:
              normalizedFullName,
          }
        );

        await fetchProfile();

        toast.success(
          "Full name updated."
        );
      } catch (requestError) {
        console.error(requestError);

        toast.error(
          requestError.response?.data
            ?.message ||
            "Failed to update full name."
        );
      } finally {
        setActiveAction("");
      }
    }, [
      fetchProfile,
      fullName,
      profile?.fullName,
    ]);

  /**
   * Updates the user's username.
   */
  const handleUsernameUpdate =
    useCallback(async () => {
      const normalizedUsername =
        username.trim();

      if (!normalizedUsername) {
        toast.error(
          "Username is required."
        );

        return;
      }

      if (
        normalizedUsername ===
        (profile?.username || "")
      ) {
        toast.error(
          "Username has not changed."
        );

        return;
      }

      try {
        setActiveAction(
          ACTIONS.USERNAME
        );

        await api.put(
          "/auth/username",
          {
            username:
              normalizedUsername,
          }
        );

        await fetchProfile();

        toast.success(
          "Username updated."
        );
      } catch (requestError) {
        console.error(requestError);

        toast.error(
          requestError.response?.data
            ?.message ||
            "Failed to update username."
        );
      } finally {
        setActiveAction("");
      }
    }, [
      fetchProfile,
      profile?.username,
      username,
    ]);

  /**
   * Updates the user's email address.
   */
  const handleEmailUpdate =
    useCallback(async () => {
      const normalizedEmail = email
        .trim()
        .toLowerCase();

      if (!normalizedEmail) {
        toast.error(
          "Email is required."
        );

        return;
      }

      if (
        normalizedEmail ===
        (profile?.email || "")
          .trim()
          .toLowerCase()
      ) {
        toast.error(
          "Email has not changed."
        );

        return;
      }

      try {
        setActiveAction(
          ACTIONS.EMAIL
        );

        await api.put(
          "/auth/email",
          {
            email: normalizedEmail,
          }
        );

        await fetchProfile();

        toast.success(
          "Email updated."
        );
      } catch (requestError) {
        console.error(requestError);

        toast.error(
          requestError.response?.data
            ?.message ||
            "Failed to update email."
        );
      } finally {
        setActiveAction("");
      }
    }, [
      email,
      fetchProfile,
      profile?.email,
    ]);

  /**
   * Updates the user's account password.
   */
  const handlePasswordUpdate =
    useCallback(async () => {
      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        toast.error(
          "Fill all password fields."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        toast.error(
          "New passwords do not match."
        );

        return;
      }

      if (
        currentPassword ===
        newPassword
      ) {
        toast.error(
          "New password must be different."
        );

        return;
      }

      try {
        setActiveAction(
          ACTIONS.PASSWORD
        );

        await api.put(
          "/auth/password",
          {
            currentPassword,
            newPassword,
            confirmPassword,
          }
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        toast.success(
          "Password updated."
        );
      } catch (requestError) {
        console.error(requestError);

        toast.error(
          requestError.response?.data
            ?.message ||
            "Failed to update password."
        );
      } finally {
        setActiveAction("");
      }
    }, [
      confirmPassword,
      currentPassword,
      newPassword,
    ]);

  /**
   * Confirms and completes logout.
   */
  const handleLogout =
    useCallback(async () => {
      const confirmed =
        await confirm({
          title: "Logout",
          message:
            "Are you sure you want to logout?",
          confirmText: "Logout",
          cancelText: "Cancel",
        });

      if (!confirmed) return;

      logout();

      navigate("/", {
        replace: true,
      });
    }, [
      confirm,
      logout,
      navigate,
    ]);

  /**
   * Permanently deletes the current user's account.
   */
  const handleDeleteAccount =
    useCallback(async () => {
      const confirmed =
        await confirm({
          title: "Delete Account",
          message:
            "This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
        });

      if (!confirmed) return;

      try {
        setActiveAction(
          ACTIONS.DELETE
        );

        await api.delete(
          "/auth/delete-account"
        );

        logout();

        toast.success(
          "Account deleted."
        );

        navigate("/", {
          replace: true,
        });
      } catch (requestError) {
        console.error(requestError);

        toast.error(
          requestError.response?.data
            ?.message ||
            "Failed to delete account."
        );

        setActiveAction("");
      }
    }, [
      confirm,
      logout,
      navigate,
    ]);

  /**
   * Cancels the crop operation and restores the currently saved avatar.
   */
  const handleCropCancel =
    useCallback(() => {
      setCropModalOpen(false);
      setSelectedImage(null);
      setCroppedAreaPixels(null);
    }, []);

  const sidebar = useMemo(
    () =>
      profile ? (
        <Card
          variant="glass"
          style={{
            width: "100%",
            minWidth: 0,
            margin: 0,
            padding: isTablet
              ? "20px"
              : "24px",

            borderRadius: "22px",
          }}
        >
          <img
            src={avatarSource}
            alt={`${profile.fullName || profile.username}'s avatar`}
            style={{
              display: "block",

              width: isTablet
                ? "100px"
                : "120px",

              height: isTablet
                ? "100px"
                : "120px",

              margin: "0 auto 20px",

              objectFit: "cover",
              borderRadius: "50%",
            }}
          />

          <h2
            style={{
              marginTop: 0,
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Profile Overview
          </h2>

          <ProfileDetail
            icon={FaUser}
            label="Full Name"
            value={profile.fullName}
          />

          <ProfileDetail
            icon={FaAt}
            label="Username"
            value={profile.username}
          />

          <ProfileDetail
            icon={FaEnvelope}
            label="Email"
            value={profile.email}
          />

          <ProfileDetail
            icon={FaUserShield}
            label="Role"
            value={profile.role}
          />

          <ProfileDetail
            icon={FaCalendarAlt}
            label="Joined"
            value={formatJoinedDate(
              profile.createdAt
            )}
          />

          <ProfileDetail
            icon={FaPenFancy}
            label="Bio"
            value={
              bio || "No bio yet"
            }
          />
        </Card>
      ) : null,
    [
      avatarSource,
      bio,
      isTablet,
      profile,
    ]
  );

  if (!profile) {
    return (
      <Layout
        backgroundImage={
          formBackground
        }
        cardVariant="glass"
      >
        {error ? (
          <Card
            variant="glass"
            style={{
              width: "100%",
              maxWidth: "600px",
              margin: "40px auto",
              textAlign: "center",
            }}
          >
            <h2>
              Unable to load profile
            </h2>

            <p>
              {error}
            </p>
          </Card>
        ) : (
          <LoadingSpinner
            text="Loading Profile..."
          />
        )}
      </Layout>
    );
  }

  return (
    <Layout
      backgroundImage={formBackground}
      sidebar={sidebar}
      sidebarTitle="Profile Details"
      cardVariant="glass"
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          minWidth: 0,

          margin: "0 auto",

          paddingBottom: isMobile
            ? "30px"
            : "50px",

          boxSizing: "border-box",
        }}
      >
        <Card
          variant="glass"
          style={{
            width: "100%",
            minWidth: 0,
            margin: 0,

            padding: sectionPadding,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-label="Upload profile picture"
            style={{
              display: "none",
            }}
            onChange={
              handleImageUpload
            }
          />

          <h2
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",

              gap: "10px",

              marginTop: 0,
              marginBottom: isMobile
                ? "26px"
                : "35px",
            }}
          >
            <FaCog aria-hidden="true" />
            Account Settings
          </h2>

          <ProfileSectionHeading
            icon={FaUserCircle}
          >
            Choose Avatar
          </ProfileSectionHeading>

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                isMobile
                  ? "repeat(3, minmax(0, 1fr))"
                  : "repeat(auto-fit, minmax(82px, 1fr))",

              justifyItems: "center",

              gap: isMobile
                ? "18px 10px"
                : "18px",

              marginBottom: "35px",
            }}
          >
            {AVATARS.map(
              (item) => {
                const selected =
                  avatar === item.id &&
                  !previewImage;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Select ${item.id}`}
                    aria-pressed={
                      selected
                    }
                    disabled={isBusy}
                    onClick={() =>
                      handleAvatarSelect(
                        item.id
                      )
                    }
                    style={{
                      width: "82px",
                      height: "82px",

                      margin: 0,
                      padding: 0,

                      overflow: "hidden",

                      background:
                        "transparent",

                      border: selected
                        ? "3px solid #38bdf8"
                        : darkMode
                          ? "2px solid rgba(255,255,255,.18)"
                          : "2px solid rgba(0,0,0,.12)",

                      borderRadius: "50%",

                      cursor: isBusy
                        ? "not-allowed"
                        : "pointer",

                      opacity: isBusy
                        ? 0.6
                        : 1,

                      transform: selected
                        ? "translateY(-4px) scale(1.08)"
                        : "translateY(0) scale(1)",

                      boxShadow: selected
                        ? "0 18px 35px rgba(56,189,248,.55)"
                        : "0 10px 20px rgba(0,0,0,.18)",

                      transition:
                        "transform .28s ease, box-shadow .28s ease, border-color .28s ease",
                    }}
                  >
                    <img
                      src={item.image}
                      alt=""
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit:
                          "cover",
                      }}
                    />
                  </button>
                );
              }
            )}

            <button
              type="button"
              aria-label="Upload custom avatar"
              disabled={isBusy}
              onClick={() =>
                fileInputRef.current?.click()
              }
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",

                width: "82px",
                margin: 0,
                padding: 0,

                color: "inherit",

                background:
                  "transparent",
                border: "none",

                cursor: isBusy
                  ? "not-allowed"
                  : "pointer",

                opacity: isBusy
                  ? 0.6
                  : 1,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",

                  width: "82px",
                  height: "82px",

                  overflow: "hidden",

                  border:
                    previewImage ||
                    croppedBlob ||
                    avatar?.startsWith(
                      "/uploads/"
                    )
                      ? "3px solid #38bdf8"
                      : darkMode
                        ? "2px dashed rgba(255,255,255,.25)"
                        : "2px dashed rgba(0,0,0,.18)",

                  borderRadius: "50%",

                  fontSize: "1.8rem",
                }}
              >
                {previewImage ||
                avatar?.startsWith(
                  "/uploads/"
                ) ? (
                  <img
                    src={
                      uploadedAvatarSource
                    }
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit:
                        "cover",
                    }}
                  />
                ) : (
                  "+"
                )}
              </span>

              <span
                style={{
                  display: "flex",
                  alignItems: "center",

                  gap: "5px",

                  marginTop: "10px",

                  fontSize: "13px",
                  textAlign: "center",
                  userSelect: "none",
                }}
              >
                <FaUpload
                  aria-hidden="true"
                  size={12}
                />
                Upload
              </span>
            </button>
          </div>

          <ProfileSectionHeading
            icon={FaPenFancy}
          >
            Bio
          </ProfileSectionHeading>

          <textarea
            className="input-glow"
            rows="4"
            maxLength={500}
            placeholder="Tell us about yourself..."
            value={bio}
            disabled={
              activeAction ===
              ACTIONS.PROFILE
            }
            onChange={(event) =>
              setBio(
                event.target.value
              )
            }
            style={{
              width: "100%",
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
              type="button"
              className="glow-top"
              disabled={
                isBusy ||
                !profileChanged
              }
              onClick={
                handleProfileUpdate
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent:
                  "center",

                width: isMobile
                  ? "100%"
                  : "auto",

                cursor: isBusy
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              <FaSave
                aria-hidden="true"
                size={14}
                style={{
                  marginRight: "6px",
                }}
              />

              {activeAction ===
              ACTIONS.PROFILE
                ? "Updating..."
                : "Update Profile"}
            </button>
          </div>

          <hr
            style={{
              margin: "35px 0",
            }}
          />

          <SettingsRow
            title="Full Name"
            icon={FaIdCard}
            isMobile={isMobile}
          >
            <input
              className="input-glow"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={fullName}
              disabled={isBusy}
              onChange={(event) =>
                setFullName(
                  event.target.value
                )
              }
            />

            <ActionButton
              icon={FaIdCard}
              label={
                activeAction ===
                ACTIONS.FULL_NAME
                  ? "Updating..."
                  : "Update Name"
              }
              disabled={isBusy}
              onClick={
                handleFullNameUpdate
              }
            />
          </SettingsRow>

          <SettingsRow
            title="Username"
            icon={FaAt}
            isMobile={isMobile}
          >
            <input
              className="input-glow"
              type="text"
              autoComplete="username"
              placeholder="Enter new username"
              value={username}
              disabled={isBusy}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
            />

            <ActionButton
              icon={FaAt}
              label={
                activeAction ===
                ACTIONS.USERNAME
                  ? "Updating..."
                  : "Update Username"
              }
              disabled={isBusy}
              onClick={
                handleUsernameUpdate
              }
            />
          </SettingsRow>

          <SettingsRow
            title="Email"
            icon={FaEnvelope}
            isMobile={isMobile}
          >
            <input
              className="input-glow"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Enter new email"
              value={email}
              disabled={isBusy}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
            />

            <ActionButton
              icon={FaEnvelope}
              label={
                activeAction ===
                ACTIONS.EMAIL
                  ? "Updating..."
                  : "Update Email"
              }
              disabled={isBusy}
              onClick={
                handleEmailUpdate
              }
            />
          </SettingsRow>

          <ProfileSectionHeading
            icon={FaLock}
          >
            Password
          </ProfileSectionHeading>

          <div
            style={{
              display: "flex",
              flexDirection:
                rowDirection,
              alignItems: isMobile
                ? "stretch"
                : "center",

              gap: "12px",

              width: "100%",
              marginBottom: "14px",
            }}
          >
            <input
              className="input-glow"
              type="password"
              autoComplete="current-password"
              placeholder="Current Password"
              value={currentPassword}
              disabled={isBusy}
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value
                )
              }
            />

            <ActionButton
              icon={FaKey}
              label={
                activeAction ===
                ACTIONS.PASSWORD
                  ? "Updating..."
                  : "Update Password"
              }
              disabled={isBusy}
              fullWidth={isMobile}
              onClick={
                handlePasswordUpdate
              }
            />
          </div>

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                isMobile
                  ? "minmax(0, 1fr)"
                  : "repeat(2, minmax(0, 1fr))",

              gap: "14px",
            }}
          >
            <input
              className="input-glow"
              type="password"
              autoComplete="new-password"
              placeholder="New Password"
              value={newPassword}
              disabled={isBusy}
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
            />

            <input
              className="input-glow"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              disabled={isBusy}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
            />
          </div>
        </Card>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile
              ? "column"
              : "row",

            justifyContent: "center",
            alignItems: "stretch",
            flexWrap: "wrap",

            gap: "18px",

            marginTop: "28px",
          }}
        >
          <button
            type="button"
            className="glow-top delete"
            disabled={isBusy}
            onClick={handleLogout}
            style={{
              width: isMobile
                ? "100%"
                : "auto",
            }}
          >
            <FaSignOutAlt
              aria-hidden="true"
              size={14}
              style={{
                marginRight: "6px",
              }}
            />
            Logout
          </button>

          {profile.role === "user" && (
            <button
              type="button"
              className="glow-top delete"
              disabled={isBusy}
              onClick={
                handleDeleteAccount
              }
              style={{
                width: isMobile
                  ? "100%"
                  : "auto",
              }}
            >
              <FaTrashAlt
                aria-hidden="true"
                size={14}
                style={{
                  marginRight: "6px",
                }}
              />

              {activeAction ===
              ACTIONS.DELETE
                ? "Deleting..."
                : "Delete Account"}
            </button>
          )}
        </div>
      </div>

      <ImageCropModal
        open={cropModalOpen}
        image={selectedImage}
        darkMode={darkMode}
        onCancel={handleCropCancel}
        onCropComplete={(
          _,
          pixels
        ) => {
          setCroppedAreaPixels(
            pixels
          );
        }}
        onSave={handleCropSave}
      />
    </Layout>
  );
}

/**
 * Displays a heading used by profile settings sections.
 */
function ProfileSectionHeading({
  icon: Icon,
  children,
}) {
  return (
    <h3
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",

        gap: "8px",

        marginTop: 0,
        marginBottom: "18px",
      }}
    >
      <Icon aria-hidden="true" />
      {children}
    </h3>
  );
}

/**
 * Displays one label and value inside the profile sidebar.
 */
function ProfileDetail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <p
      style={{
        display: "flex",
        alignItems: "flex-start",

        gap: "7px",

        marginBottom: "10px",

        overflowWrap: "anywhere",
      }}
    >
      <Icon
        aria-hidden="true"
        color="#00be9f"
        style={{
          flexShrink: 0,
          marginTop: "4px",
        }}
      />

      <span>
        <strong>{label}:</strong>{" "}
        {value || "Not provided"}
      </span>
    </p>
  );
}

/**
 * Provides consistent layout for editable account fields.
 */
function SettingsRow({
  title,
  icon,
  isMobile,
  children,
}) {
  return (
    <section
      style={{
        marginBottom: "24px",
      }}
    >
      <ProfileSectionHeading
        icon={icon}
      >
        {title}
      </ProfileSectionHeading>

      <div
        style={{
          display: "flex",
          flexDirection: isMobile
            ? "column"
            : "row",

          alignItems: isMobile
            ? "stretch"
            : "center",

          gap: "12px",

          width: "100%",
        }}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Reusable profile update button.
 */
function ActionButton({
  icon: Icon,
  label,
  disabled,
  onClick,
  fullWidth = false,
}) {
  return (
    <button
      type="button"
      className="glow-top"
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",

        width: fullWidth
          ? "100%"
          : "auto",

        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      <Icon
        aria-hidden="true"
        size={14}
        style={{
          marginRight: "6px",
        }}
      />

      {label}
    </button>
  );
}

export default Profile;