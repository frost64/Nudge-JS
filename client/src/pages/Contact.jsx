import {
  useCallback,
  useContext,
} from "react";
import toast from "react-hot-toast";

import {
  FaClock,
  FaCopy,
  FaEnvelope,
  FaExternalLinkAlt,
  FaGithub,
  FaHeart,
  FaLinkedin,
} from "react-icons/fa";

import profileDarkBg from "../assets/backgrounds/dashboard-dark.png";
import profileLightBg from "../assets/backgrounds/dashboard-light.png";

import Card from "../components/Card";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";

const CONTACT_EMAIL = "asjidahmed6@gmail.com";

const SOCIAL_LINKS = [
  {
    title: "GitHub",
    description: "Explore the source code and projects.",
    label: "Visit GitHub",
    url: "https://github.com/frost64",
    icon: FaGithub,
  },
  {
    title: "LinkedIn",
    description: "Let's connect professionally.",
    label: "Connect",
    url: "https://www.linkedin.com/in/asjid-ahmed-a1031b2a4/",
    icon: FaLinkedin,
  },
];

/**
 * Displays Nudge contact information, social profiles,
 * response expectations, and feedback information.
 */
function Contact() {
  const { user } = useContext(AuthContext);
  const { isMobile, isTablet } = useBreakpoint();

  const darkMode = user?.theme === "dark";

  const backgroundImage = darkMode
    ? profileDarkBg
    : profileLightBg;

  const pagePadding = isMobile
    ? "20px"
    : isTablet
      ? "30px"
      : "40px";

  const sectionPadding = isMobile
    ? "20px"
    : isTablet
      ? "22px"
      : "25px";

  /**
   * Copies the contact email using the Clipboard API,
   * with a legacy fallback for older browsers.
   */
  const copyEmail = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          CONTACT_EMAIL
        );
      } else {
        const textarea =
          document.createElement("textarea");

        textarea.value = CONTACT_EMAIL;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        const copied =
          document.execCommand("copy");

        document.body.removeChild(textarea);

        if (!copied) {
          throw new Error(
            "Clipboard operation failed."
          );
        }
      }

      toast.success(
        "Email copied to clipboard."
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy email.");
    }
  }, []);

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
        }}
      >
        <Card
          variant="glass"
          style={{
            margin: 0,
            padding: pagePadding,
          }}
        >
          <header>
            <h1
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",

                gap: "12px",

                marginTop: 0,
                marginBottom: "10px",

                fontSize: isMobile
                  ? "2rem"
                  : "2.5rem",
              }}
            >
              <FaEnvelope aria-hidden="true" />
              Contact
            </h1>

            <p
              style={{
                marginTop: 0,
                marginBottom: isMobile
                  ? "28px"
                  : "40px",

                lineHeight: 1.8,
                opacity: 0.8,
              }}
            >
              Have a question, found a bug, or simply
              want to connect? I&apos;d love to hear
              from you.
            </p>
          </header>

          <Card
            variant="glass"
            style={{
              marginTop: 0,
              marginBottom: "25px",
              padding: sectionPadding,
            }}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",

                gap: "10px",

                marginTop: 0,
              }}
            >
              <FaEnvelope aria-hidden="true" />
              Email
            </h2>

            <p
              style={{
                marginTop: "12px",
                marginBottom: "20px",

                opacity: 0.8,
                overflowWrap: "anywhere",
              }}
            >
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                style={{
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                {CONTACT_EMAIL}
              </a>
            </p>

            <button
              type="button"
              className="glow-top"
              onClick={copyEmail}
              style={{
                width: isMobile
                  ? "100%"
                  : "auto",
              }}
            >
              <FaCopy
                aria-hidden="true"
                size={14}
                style={{
                  marginRight: "6px",
                }}
              />
              Copy Email
            </button>
          </Card>

          <div
            style={{
              display: "grid",

              gridTemplateColumns: isMobile
                ? "minmax(0, 1fr)"
                : "repeat(2, minmax(0, 1fr))",

              gap: "20px",
              marginBottom: "25px",
            }}
          >
            {SOCIAL_LINKS.map(
              ({
                title,
                description,
                label,
                url,
                icon: Icon,
              }) => (
                <Card
                  key={title}
                  variant="glass"
                  style={{
                    height: "100%",
                    margin: 0,
                    padding: sectionPadding,

                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h2
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",

                      gap: "10px",

                      marginTop: 0,
                    }}
                  >
                    <Icon aria-hidden="true" />
                    {title}
                  </h2>

                  <p
                    style={{
                      flexGrow: 1,

                      marginTop: "15px",
                      marginBottom: "20px",

                      lineHeight: 1.7,
                      opacity: 0.8,
                    }}
                  >
                    {description}
                  </p>

                  <a
                    className="glow-top"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} — opens in a new tab`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",

                      width: isMobile
                        ? "100%"
                        : "fit-content",

                      boxSizing: "border-box",
                      textDecoration: "none",
                    }}
                  >
                    <FaExternalLinkAlt
                      aria-hidden="true"
                      size={13}
                      style={{
                        marginRight: "6px",
                      }}
                    />
                    {label}
                  </a>
                </Card>
              )
            )}
          </div>
        </Card>

        <Card
          variant="glass"
          style={{
            marginBottom: "25px",
            padding: sectionPadding,
          }}
        >
          <h2
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",

              gap: "10px",

              marginTop: 0,
            }}
          >
            <FaClock aria-hidden="true" />
            Response Time
          </h2>

          <p
            style={{
              marginTop: "15px",
              marginBottom: 0,

              lineHeight: 1.8,
              opacity: 0.8,
            }}
          >
            I usually respond to emails and messages
            within <strong>24–48 hours</strong>. If
            your inquiry is related to a bug report or
            feature request for Nudge, I&apos;ll do my
            best to get back to you as soon as
            possible.
          </p>
        </Card>

        <section
          aria-labelledby="contact-thank-you"
          style={{
            marginTop: isMobile
              ? "30px"
              : "40px",

            paddingInline: isMobile
              ? "8px"
              : "20px",

            textAlign: "center",
          }}
        >
          <h2
            id="contact-thank-you"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",

              gap: "10px",

              marginBottom: "12px",
            }}
          >
            <FaHeart
              aria-hidden="true"
              style={{
                color: "#ff0000",
              }}
            />
            Thank You
          </h2>

          <p
            style={{
              maxWidth: "620px",

              margin: "0 auto",

              lineHeight: 1.8,
              opacity: 0.8,
            }}
          >
            Thank you for using{" "}
            <strong>Nudge</strong>. Your feedback,
            ideas, and support help make the app better
            with every update. Whether you&apos;re
            reporting an issue, suggesting a feature,
            or simply saying hello, I&apos;d love to
            hear from you.
          </p>
        </section>
      </div>
    </Layout>
  );
}

export default Contact;