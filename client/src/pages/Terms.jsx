import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";

import profileLightBg from "../assets/backgrounds/dashboard-light.png";
import profileDarkBg from "../assets/backgrounds/dashboard-dark.png";

function Terms() {
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
              marginBottom: "10px",
            }}
          >
            📄 Terms of Service
          </h1>

          <p
            style={{
                opacity: 0.7,
                marginBottom: "40px",
            }}
            >
            Last Updated: {LAST_UPDATED}
        </p>

        <div style={sectionStyle}>
            <h2>Acceptance of Terms</h2>

            <p>
                By accessing or using Nudge, you agree to comply with these
                Terms of Service. If you do not agree with any part of these
                terms, please discontinue use of the application.
            </p>
        </div>

        <div style={sectionStyle}>
            <h2>Use of the Service</h2>

            <p>
                Nudge is a productivity application designed to help users
                organize notes, reminders, useful links, and personal
                information in one secure workspace.
            </p>

            <p>
                You agree to use the application responsibly and in
                accordance with all applicable laws and regulations.
            </p>
        </div>

        <div style={sectionStyle}>
            <h2>User Accounts</h2>

            <ul style={{marginLeft: "15px"}}>
                <li>Keep your account credentials secure.</li>
                <li>Provide accurate account information.</li>
                <li>Notify us if you believe your account has been compromised.</li>
            </ul>
        </div>

        <div style={sectionStyle}>
            <h2>User Content</h2>

            <p>
                You retain ownership of all content you create within Nudge,
                including notes, reminders, saved links, and profile
                information. You are solely responsible for the content you
                choose to store in your account.
            </p>
        </div>

        <div style={sectionStyle}>
            <h2>Prohibited Activities</h2>

            <ul style={{marginLeft: "15px"}}>
                <li>Attempting unauthorized access to the application.</li>
                <li>Distributing malicious software or harmful code.</li>
                <li>Using the service for unlawful or fraudulent purposes.</li>
                <li>Interfering with the normal operation of the platform.</li>
            </ul>
        </div>

        <div style={sectionStyle}>
            <h2>Intellectual Property</h2>

            <p>
                The Nudge application, including its branding, design,
                interface, and source code, is the intellectual property of
                its developer unless otherwise stated. Unauthorized copying,
                redistribution, or modification is prohibited.
            </p>
        </div>

        <div style={sectionStyle}>
            <h2>Limitation of Liability</h2>

            <p>
                Nudge is provided on an "as is" and "as available" basis.
                While every effort is made to provide a reliable experience,
                the developer is not responsible for any loss of data,
                service interruptions, or damages resulting from the use of
                the application.
            </p>
        </div>

        <div style={sectionStyle}>
            <h2>Termination</h2>

            <p>
                Users may permanently delete their account at any time using
                the Delete Account feature. We reserve the right to suspend
                or terminate accounts that violate these Terms of Service or
                misuse the platform.
            </p>
        </div>

        <div style={sectionStyle}>
            <h2>Changes to These Terms</h2>

            <p>
                These Terms of Service may be updated periodically to reflect
                improvements or legal requirements. Continued use of Nudge
                after any changes constitutes acceptance of the revised
                terms.
            </p>
        </div>

        <div>
            <h2>Contact</h2>

            <p>
                If you have any questions regarding these Terms of Service,
                you can contact us at:
            </p>

            <strong>asjidahmed6@gmail.com</strong>
        </div>


        </Card>
      </div>
    </Layout>
  );
}

export default Terms;