import { useContext } from "react";
import {
  FiClock,
  FiFileText,
  FiGift,
  FiLink,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { IoRocketOutline } from "react-icons/io5";

import logo from "../assets/Logo.svg";
import profileDarkBg from "../assets/backgrounds/dashboard-dark.png";
import profileLightBg from "../assets/backgrounds/dashboard-light.png";

import Card from "../components/Card";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";

const CORE_FEATURES = [
  {
    icon: FiFileText,
    title: "Notes",
    description:
      "Capture ideas, organize thoughts, pin important notes, and categorize everything with tags.",
  },
  {
    icon: FiLink,
    title: "Links",
    description:
      "Save websites with categories, descriptions, favorites, and export them whenever needed.",
  },
  {
    icon: FiClock,
    title: "Reminders",
    description:
      "Never miss important events by scheduling reminders with dates and categories.",
  },
  {
    icon: FiGift,
    title: "Birthdays",
    description:
      "Never miss birthdays of your loved ones by scheduling birthdays on your personal calendar.",
  },
];

const BENEFITS = [
  {
    icon: FiZap,
    title: "Fast & Responsive",
    text:
      "Built with React for a smooth, responsive experience across desktop and mobile devices.",
  },
  {
    icon: FiShield,
    title: "Secure",
    text:
      "JWT authentication and protected routes keep your account and personal data secure.",
  },
  {
    icon: HiOutlineSparkles,
    title: "Modern Design",
    text:
      "A clean glassmorphism interface with dark and light themes makes productivity enjoyable.",
  },
  {
    icon: IoRocketOutline,
    title: "Built for Productivity",
    text:
      "Everything you need—notes, links, reminders, and profile management—in one organized workspace.",
  },
];

const TECHNOLOGIES = [
  "React",
  "React Router",
  "Context API",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Mongoose",
  "JWT Authentication",
  "Axios",
  "React Hot Toast",
  "jsPDF",
  "PapaParse",
  "Vite",
  "Glassmorphism UI",
];

/**
 * Displays information about Nudge, its features,
 * technology stack, and design goals.
 */
function About() {
  const { user } = useContext(AuthContext);
  const { isMobile, isTablet } = useBreakpoint();

  const darkMode = user?.theme === "dark";

  const sectionPadding = isMobile
    ? "22px"
    : isTablet
      ? "28px"
      : "35px";

  const heroPadding = isMobile
    ? "24px"
    : isTablet
      ? "34px"
      : "45px";

  return (
    <Layout
      backgroundImage={
        darkMode
          ? profileDarkBg
          : profileLightBg
      }
      cardVariant="glass"
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          minWidth: 0,

          margin: "0 auto",

          paddingInline: isMobile
            ? "6px"
            : 0,

          paddingBottom: isMobile
            ? "24px"
            : "40px",

          boxSizing: "border-box",
        }}
      >
        <Card
          variant="glass"
          style={{
            padding: heroPadding,
            marginBottom: "30px",
            cursor: "default",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isMobile
                ? "column"
                : "row",

              alignItems: "center",
              flexWrap: "wrap",

              gap: "20px",

              textAlign: isMobile
                ? "center"
                : "left",
            }}
          >
            <img
              src={logo}
              alt="Nudge"
              style={{
                width: isMobile
                  ? "90px"
                  : "130px",

                height: isMobile
                  ? "90px"
                  : "130px",

                flexShrink: 0,
                objectFit: "contain",
              }}
            />

            <div
              style={{
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: "300px",
                minWidth: 0,
              }}
            >
              <h1
                style={{
                  margin: 0,

                  fontSize: isMobile
                    ? "2rem"
                    : isTablet
                      ? "2.5rem"
                      : "3rem",

                  overflowWrap: "anywhere",
                }}
              >
                About Nudge
              </h1>

              <p
                style={{
                  maxWidth: "650px",

                  marginTop: "12px",
                  marginBottom: 0,

                  fontSize: isMobile
                    ? "1rem"
                    : "1.1rem",

                  lineHeight: 1.7,
                  opacity: 0.8,
                }}
              >
                A modern productivity workspace built to
                help you capture ideas, organize knowledge,
                and stay focused on what matters most.
              </p>
            </div>
          </div>
        </Card>

        <Card
          variant="glass"
          style={{
            padding: sectionPadding,
            marginBottom: "30px",
            cursor: "default",
          }}
        >
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            What is Nudge?
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: isMobile
                ? "1rem"
                : "1.05rem",

              lineHeight: 1.9,
              opacity: 0.85,
            }}
          >
            Nudge is an all-in-one productivity application
            designed to simplify everyday organization.
            Instead of switching between multiple apps for
            notes, bookmarks, reminders, and account
            management, Nudge brings everything together in
            one elegant workspace.
            <br />
            <br />
            Built with the MERN stack, Nudge focuses on
            speed, simplicity, and a modern user experience
            with responsive layouts, glassmorphism-inspired
            design, and useful productivity features that
            help you stay organized.
          </p>
        </Card>

        <Card
          variant="glass"
          style={{
            padding: sectionPadding,
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              marginBottom: "28px",
              textAlign: "center",
            }}
          >
            Core Features
          </h2>

          <div
            style={{
              display: "grid",

              gridTemplateColumns: isMobile
                ? "minmax(0, 1fr)"
                : "repeat(auto-fit, minmax(190px, 1fr))",

              gap: "22px",
            }}
          >
            {CORE_FEATURES.map(
              ({
                icon: Icon,
                title,
                description,
              }) => (
                <Card
                  key={title}
                  variant="glass"
                  style={{
                    height: "100%",
                    margin: 0,
                    padding: "24px",

                    borderRadius: "18px",
                    textAlign: "center",
                    cursor: "default",

                    transition:
                      "transform .3s ease, box-shadow .3s ease",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.transform =
                      "translateY(-6px)";

                    event.currentTarget.style.boxShadow =
                      "0 20px 40px rgba(56,189,248,.18)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform =
                      "translateY(0)";

                    event.currentTarget.style.boxShadow = "";
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <Icon size={40} />
                  </div>

                  <h3
                    style={{
                      marginBottom: "12px",
                    }}
                  >
                    {title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      fontSize: ".95rem",
                      lineHeight: 1.7,
                      opacity: 0.8,
                    }}
                  >
                    {description}
                  </p>
                </Card>
              )
            )}
          </div>
        </Card>

        <Card
          variant="glass"
          style={{
            padding: sectionPadding,
            marginBottom: "30px",
            cursor: "default",
          }}
        >
          <h2
            style={{
              marginBottom: "30px",
              textAlign: "center",
            }}
          >
            Why Choose Nudge?
          </h2>

          <div
            style={{
              display: "grid",

              gridTemplateColumns: isMobile
                ? "minmax(0, 1fr)"
                : "repeat(auto-fit, minmax(190px, 1fr))",

              gap: "22px",
            }}
          >
            {BENEFITS.map(
              ({
                icon: Icon,
                title,
                text,
              }) => (
                <Card
                  key={title}
                  variant="glass"
                  style={{
                    height: "100%",
                    margin: 0,
                    padding: "24px",

                    textAlign: "center",
                    cursor: "default",

                    transition:
                      "transform .3s ease",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.transform =
                      "translateY(-5px)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform =
                      "translateY(0)";
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <Icon size={38} />
                  </div>

                  <h3
                    style={{
                      marginBottom: "12px",
                    }}
                  >
                    {title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      lineHeight: 1.7,
                      opacity: 0.8,
                    }}
                  >
                    {text}
                  </p>
                </Card>
              )
            )}
          </div>
        </Card>

        <Card
          variant="glass"
          style={{
            padding: sectionPadding,
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              marginBottom: "28px",
              textAlign: "center",
            }}
          >
            Technologies Used
          </h2>

          <p
            style={{
              marginBottom: "30px",

              textAlign: "center",
              lineHeight: 1.8,

              opacity: 0.8,
              cursor: "default",
            }}
          >
            Nudge is built using modern web technologies
            focused on performance, scalability, and user
            experience.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",

              gap: "15px",
            }}
          >
            {TECHNOLOGIES.map((technology) => (
              <div
                key={technology}
                style={{
                  padding: isMobile
                    ? "7px 12px"
                    : "8px 14px",

                  borderRadius: "999px",

                  fontSize: isMobile
                    ? ".82rem"
                    : ".9rem",

                  fontWeight: 500,

                  color: darkMode
                    ? "#ffffff"
                    : "#111111",

                  background: darkMode
                    ? "rgba(4,4,4,.31)"
                    : "rgba(255,255,255,.70)",

                  border: darkMode
                    ? "1px solid rgba(255,255,255,.15)"
                    : "1px solid rgba(255,255,255,.90)",

                  boxShadow: darkMode
                    ? "inset 0 0 14px rgba(56,189,248,.28), 0 4px 12px rgba(0,0,0,.18)"
                    : "inset 0 0 12px rgba(0,229,255,.20), 0 4px 10px rgba(0,0,0,.08)",

                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",

                  cursor: "default",
                  whiteSpace: "nowrap",
                }}
              >
                {technology}
              </div>
            ))}
          </div>
        </Card>

        <Card
          variant="glass"
          style={{
            padding: heroPadding,
            marginBottom: 0,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            A Project Built with Passion
          </h2>

          <p
            style={{
              maxWidth: "760px",

              margin: "0 auto",

              fontSize: isMobile
                ? "1rem"
                : "1.05rem",

              lineHeight: 1.9,
              opacity: 0.85,
              cursor: "default",
            }}
          >
            Nudge was created as a full-stack MERN
            application to combine practical productivity
            tools with modern web development practices.
            Every feature—from note management and
            reminders to profile customization and PDF
            export—was designed with simplicity,
            performance, and user experience in mind.
          </p>

          <div
            style={{
              marginTop: "35px",

              fontSize: isMobile
                ? "1.05rem"
                : "1.2rem",

              fontStyle: "italic",
              opacity: 0.9,
              cursor: "default",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",

                gap: "8px",
              }}
            >
              <HiOutlineSparkles
                aria-hidden="true"
                size={22}
              />
              Remember less. Focus more.
            </span>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default About;