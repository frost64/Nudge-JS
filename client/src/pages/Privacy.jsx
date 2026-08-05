import { useContext } from "react";

import {
  FaCookieBite,
  FaDatabase,
  FaEnvelope,
  FaHistory,
  FaInfoCircle,
  FaLock,
  FaServer,
  FaShieldAlt,
  FaUserCheck,
  FaUserShield,
} from "react-icons/fa";

import profileDarkBg from "../assets/backgrounds/dashboard-dark.png";
import profileLightBg from "../assets/backgrounds/dashboard-light.png";

import Card from "../components/Card";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";

const LAST_UPDATED = "July 23, 2026";
const CONTACT_EMAIL = "asjidahmed6@gmail.com";

const PRIVACY_SECTIONS = [
  {
    title: "Introduction",
    icon: FaInfoCircle,
    content: (
      <p>
        Your privacy matters. Nudge is designed to help you organize
        your notes, reminders, links, and profile information while
        respecting your privacy and protecting your personal data.
      </p>
    ),
  },
  {
    title: "Information We Collect",
    icon: FaDatabase,
    content: (
      <ul>
        <li>Username and email address</li>
        <li>Profile avatar and bio</li>
        <li>Notes, reminders, and saved links</li>
        <li>Theme preference and application settings</li>
      </ul>
    ),
  },
  {
    title: "How We Use Your Information",
    icon: FaUserShield,
    content: (
      <ul>
        <li>Authenticate your account securely.</li>
        <li>Store and synchronize your data.</li>
        <li>Provide a personalized experience.</li>
        <li>Improve application stability and usability.</li>
      </ul>
    ),
  },
  {
    title: "Data Security",
    icon: FaLock,
    content: (
      <p>
        We take reasonable measures to protect your information.
        Passwords are securely hashed, authentication is handled using
        JSON Web Tokens (JWT), and your personal data is only accessible
        after successful authentication.
      </p>
    ),
  },
  {
    title: "Cookies & Local Storage",
    icon: FaCookieBite,
    content: (
      <p>
        Nudge uses browser storage only to improve your experience,
        such as remembering your login session, theme preference, and
        other interface settings.
      </p>
    ),
  },
  {
    title: "Third-Party Services",
    icon: FaServer,
    content: (
      <p>
        Nudge is built using technologies including React, Express,
        Node.js, and MongoDB. These technologies power the application,
        and no advertising or user-tracking services are used.
      </p>
    ),
  },
  {
    title: "Your Rights",
    icon: FaUserCheck,
    content: (
      <ul>
        <li>Update your profile information.</li>
        <li>Change your username or email.</li>
        <li>Update your password.</li>
        <li>Delete your account and associated data.</li>
      </ul>
    ),
  },
];

/**
 * Displays the Nudge privacy policy and data-handling information.
 */
function Privacy() {
  const { user } = useContext(AuthContext);
  const { isMobile, isTablet } = useBreakpoint();

  const darkMode = user?.theme === "dark";

  const backgroundImage = darkMode
    ? profileDarkBg
    : profileLightBg;

  const pagePadding = isMobile
    ? "22px 18px"
    : isTablet
      ? "32px"
      : "40px";

  return (
    <Layout
      backgroundImage={backgroundImage}
      cardVariant="glass"
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          minWidth: 0,

          margin: "0 auto",

          paddingBottom: isMobile
            ? "24px"
            : "40px",

          boxSizing: "border-box",
          cursor: "default",
        }}
      >
        <Card
          variant="glass"
          style={{
            width: "100%",
            minWidth: 0,

            margin: 0,
            padding: pagePadding,

            borderRadius: isMobile
              ? "20px"
              : "24px",
          }}
        >
          <header>
            <h1
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",

                gap: "10px",

                marginTop: 0,
                marginBottom: "10px",

                fontSize: isMobile
                  ? "2rem"
                  : isTablet
                    ? "2.3rem"
                    : "2.5rem",

                overflowWrap: "anywhere",
              }}
            >
              <FaShieldAlt aria-hidden="true" />
              Privacy Policy
            </h1>

            <p
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",

                gap: "8px",

                marginTop: 0,
                marginBottom: isMobile
                  ? "30px"
                  : "40px",

                opacity: 0.7,
              }}
            >
              <FaHistory aria-hidden="true" />
              Last Updated: {LAST_UPDATED}
            </p>
          </header>

          {PRIVACY_SECTIONS.map(
            ({
              title,
              icon: Icon,
              content,
            }) => (
              <section
                key={title}
                style={{
                  marginBottom: isMobile
                    ? "28px"
                    : "35px",
                }}
              >
                <h2
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",

                    gap: "8px",

                    marginTop: 0,
                    marginBottom: "12px",

                    overflowWrap: "anywhere",
                  }}
                >
                  <Icon aria-hidden="true" />
                  {title}
                </h2>

                <div
                  style={{
                    lineHeight: 1.8,
                    opacity: 0.9,
                  }}
                >
                  {content}
                </div>
              </section>
            )
          )}

          <section>
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",

                gap: "8px",

                marginTop: 0,
                marginBottom: "12px",
              }}
            >
              <FaEnvelope aria-hidden="true" />
              Contact
            </h2>

            <p
              style={{
                marginTop: 0,
                marginBottom: "8px",

                lineHeight: 1.8,
                opacity: 0.9,
              }}
            >
              If you have questions regarding this Privacy Policy,
              you can reach us at:
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={{
                color: "inherit",
                fontWeight: 700,
                overflowWrap: "anywhere",
              }}
            >
              {CONTACT_EMAIL}
            </a>
          </section>
        </Card>
      </div>
    </Layout>
  );
}

export default Privacy;