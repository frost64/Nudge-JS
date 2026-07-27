import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";

import profileLightBg from "../assets/backgrounds/dashboard-light.png";
import profileDarkBg from "../assets/backgrounds/dashboard-dark.png";

import {
  FaShieldAlt,
  FaInfoCircle,
  FaDatabase,
  FaUserShield,
  FaLock,
  FaCookieBite,
  FaServer,
  FaUserCheck,
  FaEnvelope,
  FaHistory,
} from "react-icons/fa";

function Privacy() {
  const { user } = useContext(AuthContext);

  const darkMode = user?.theme === "dark";

  const background = darkMode
    ? profileDarkBg
    : profileLightBg;

  const sectionStyle = {
    marginBottom: "35px",
  };
const LAST_UPDATED = "July 23, 2026";
  return (
    <Layout
      backgroundImage={background}
      cardVariant="glass"
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          paddingBottom: "40px",
          cursor: "default"
        }}
      >
        <Card
          variant="glass"
          style={{
            padding: "40px",
          }}
        >
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <FaShieldAlt />
            Privacy Policy
          </h1>

        <p
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: 0.7,
            marginBottom: "40px",
          }}
        >
          <FaHistory />
          Last Updated: {LAST_UPDATED}
        </p>

          <div style={sectionStyle}>
            <h2
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaInfoCircle />
                Introduction
              </h2>

            <p>
              Your privacy matters. Nudge is designed to help you organize your
              notes, reminders, links, and profile information while respecting
              your privacy and protecting your personal data.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FaDatabase />
              Information We Collect
            </h2>

            <ul style={{marginLeft: "15px"}}>
              <li>Username and email address</li>
              <li>Profile avatar and bio</li>
              <li>Notes, reminders, and saved links</li>
              <li>Theme preference and application settings</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FaUserShield />
              How We Use Your Information
            </h2>

            <ul style={{marginLeft: "15px"}}>
              <li>Authenticate your account securely.</li>
              <li>Store and synchronize your data.</li>
              <li>Provide a personalized experience.</li>
              <li>Improve application stability and usability.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FaLock />
              Data Security
            </h2>

            <p>
              We take reasonable measures to protect your information.
              Passwords are securely hashed, authentication is handled using
              JSON Web Tokens (JWT), and your personal data is only accessible
              after successful authentication.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FaCookieBite />
              Cookies & Local Storage
            </h2>

            <p>
              Nudge uses browser storage only to improve your experience, such
              as remembering your login session, theme preference, and other
              interface settings.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FaServer />
              Third-Party Services
            </h2>

            <p>
              Nudge is built using technologies including React, Express,
              Node.js, and MongoDB. These technologies power the application,
              and no advertising or user-tracking services are used.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaUserCheck />
                Your Rights
              </h2>

            <ul style={{marginLeft: "15px"}}>
              <li>Update your profile information.</li>
              <li>Change your username or email.</li>
              <li>Update your password.</li>
              <li>Delete your account and associated data.</li>
            </ul>
          </div>

          <div>
            <h2
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FaEnvelope />
              Contact
            </h2>

            <p>
              If you have questions regarding this Privacy Policy, you can reach
              us at:
            </p>

            <strong>asjidahmed6@gmail.com</strong>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default Privacy;