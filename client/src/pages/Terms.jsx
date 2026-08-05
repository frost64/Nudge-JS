import { useContext } from "react";

import {
  FaBalanceScale,
  FaBan,
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList,
  FaCopyright,
  FaEnvelope,
  FaFileContract,
  FaStickyNote,
  FaSyncAlt,
  FaTimesCircle,
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

const TERMS_SECTIONS = [
  {
    title: "Acceptance of Terms",
    icon: FaCheckCircle,
    content: (
      <p>
        By accessing or using Nudge, you agree to comply with these
        Terms of Service. If you do not agree with any part of these
        terms, please discontinue use of the application.
      </p>
    ),
  },
  {
    title: "Use of the Service",
    icon: FaClipboardList,
    content: (
      <>
        <p>
          Nudge is a productivity application designed to help users
          organize notes, reminders, useful links, and personal
          information in one secure workspace.
        </p>

        <p>
          You agree to use the application responsibly and in
          accordance with all applicable laws and regulations.
        </p>
      </>
    ),
  },
  {
    title: "User Accounts",
    icon: FaUserShield,
    content: (
      <ul>
        <li>Keep your account credentials secure.</li>
        <li>Provide accurate account information.</li>
        <li>
          Notify us if you believe your account has been compromised.
        </li>
      </ul>
    ),
  },
  {
    title: "User Content",
    icon: FaStickyNote,
    content: (
      <p>
        You retain ownership of all content you create within Nudge,
        including notes, reminders, saved links, and profile
        information. You are solely responsible for the content you
        choose to store in your account.
      </p>
    ),
  },
  {
    title: "Prohibited Activities",
    icon: FaBan,
    content: (
      <ul>
        <li>Attempting unauthorized access to the application.</li>
        <li>Distributing malicious software or harmful code.</li>
        <li>Using the service for unlawful or fraudulent purposes.</li>
        <li>Interfering with the normal operation of the platform.</li>
      </ul>
    ),
  },
  {
    title: "Intellectual Property",
    icon: FaCopyright,
    content: (
      <p>
        The Nudge application, including its branding, design,
        interface, and source code, is the intellectual property of
        its developer unless otherwise stated. Unauthorized copying,
        redistribution, or modification is prohibited.
      </p>
    ),
  },
  {
    title: "Limitation of Liability",
    icon: FaBalanceScale,
    content: (
      <p>
        Nudge is provided on an &quot;as is&quot; and
        &quot;as available&quot; basis. While every effort is made to
        provide a reliable experience, the developer is not
        responsible for any loss of data, service interruptions, or
        damages resulting from the use of the application.
      </p>
    ),
  },
  {
    title: "Termination",
    icon: FaTimesCircle,
    content: (
      <p>
        Users may permanently delete their account at any time using
        the Delete Account feature. We reserve the right to suspend or
        terminate accounts that violate these Terms of Service or
        misuse the platform.
      </p>
    ),
  },
  {
    title: "Changes to These Terms",
    icon: FaSyncAlt,
    content: (
      <p>
        These Terms of Service may be updated periodically to reflect
        improvements or legal requirements. Continued use of Nudge
        after any changes constitutes acceptance of the revised terms.
      </p>
    ),
  },
];

/**
 * Displays the Nudge Terms of Service.
 */
function Terms() {
  const { user } = useContext(AuthContext);
  const { isMobile, isTablet } = useBreakpoint();

  const darkMode = user?.theme === "dark";

  const backgroundImage = darkMode
    ? profileDarkBg
    : profileLightBg;

  const cardPadding = isMobile
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
            padding: cardPadding,
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
              <FaFileContract aria-hidden="true" />
              Terms of Service
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
              <FaCalendarAlt aria-hidden="true" />
              Last Updated: {LAST_UPDATED}
            </p>
          </header>

          {TERMS_SECTIONS.map(
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
              If you have any questions regarding these Terms of
              Service, you can contact us at:
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

export default Terms;