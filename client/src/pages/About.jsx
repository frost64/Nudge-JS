import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import logo from "../assets/Logo.svg";
import profileLightBg from "../assets/backgrounds/dashboard-light.png";
import profileDarkBg from "../assets/backgrounds/dashboard-dark.png";

import {
  FiFileText,
  FiLink,
  FiClock,
  FiGift,
  FiZap,
  FiShield,
} from "react-icons/fi";

import { HiOutlineSparkles } from "react-icons/hi2";
import { IoRocketOutline } from "react-icons/io5";

function About() {
  const { user } = useContext(AuthContext);

  const darkMode = user?.theme === "dark";

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
          maxWidth: "900px",
          margin: "0 auto",
          paddingBottom: "40px",
        }}
      >
        <Card
            variant="glass"
            style={{
                padding: "45px",
                marginBottom: "30px",
                cursor: "default"
            }}
            >
            <div
                style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
                }}
            >
                <img
                src={logo}
                alt="Nudge Logo"
                style={{
                    width: "130px",
                    height: "130px",
                }}
                />

                <div>
                <h1
                    style={{
                    margin: 0,
                    fontSize: "3rem",
                    }}
                >
                    About Nudge
                </h1>

                <p
                    style={{
                    marginTop: "12px",
                    opacity: 0.8,
                    fontSize: "1.1rem",
                    lineHeight: 1.7,
                    maxWidth: "650px",
                    }}
                >
                    A modern productivity workspace built to help you
                    capture ideas, organize knowledge, and stay focused
                    on what matters most.
                </p>
                </div>
            </div>
            </Card>

            <Card
                variant="glass"
                style={{
                    padding: "35px",
                    marginBottom: "30px",
                    cursor: "default"
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
                    lineHeight: 1.9,
                    opacity: 0.85,
                    fontSize: "1.05rem",
                    }}
                >
                    Nudge is an all-in-one productivity application
                    designed to simplify everyday organization. Instead of
                    switching between multiple apps for notes, bookmarks,
                    reminders, and account management, Nudge brings
                    everything together in one elegant workspace.

                    <br /><br />

                    Built with the MERN stack, Nudge focuses on speed,
                    simplicity, and a modern user experience with responsive
                    layouts, glassmorphism-inspired design, and useful
                    productivity features that help you stay organized.
                </p>
                </Card>

                <Card
                    variant="glass"
                    style={{
                        padding: "35px",
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
                        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                        gap: "22px",
                        }}
                    >
                        {[
                        {
                            icon: <FiFileText size={40} />,
                            title: "Notes",
                            description:
                            "Capture ideas, organize thoughts, pin important notes, and categorize everything with tags.",
                        },
                        {
                            icon: <FiLink size={40} />,
                            title: "Links",
                            description:
                            "Save websites with categories, descriptions, favorites, and export them whenever needed.",
                        },
                        {
                            icon: <FiClock size={40} />,
                            title: "Reminders",
                            description:
                            "Never miss important events by scheduling reminders with dates and categories.",
                        },
                        {
                            icon: <FiGift size={40} />,
                            title: "Birthdays",
                            description:
                            "Never miss birthdays of your loved ones by scheduling birthdays on your personal calendar.",
                        },
                        ].map((feature) => (
                        <Card
                            key={feature.title}
                            variant="glass"
                            style={{
                            padding: "24px",
                            borderRadius: "18px",
                            textAlign: "center",
                            transition: ".3s",
                            cursor: "default",
                            }}
                            onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                                "translateY(-6px)";
                            e.currentTarget.style.boxShadow =
                                "0 20px 40px rgba(56,189,248,.18)";
                            }}
                            onMouseLeave={(e) => {
                            e.currentTarget.style.transform =
                                "translateY(0)";
                            e.currentTarget.style.boxShadow = "";
                            }}
                        >
                            <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: "15px",
                            }}
                            >
                            {feature.icon}
                            </div>

                            <h3
                            style={{
                                marginBottom: "12px",
                            }}
                            >
                            {feature.title}
                            </h3>

                            <p
                            style={{
                                opacity: .8,
                                lineHeight: 1.7,
                                fontSize: ".95rem",
                            }}
                            >
                            {feature.description}
                            </p>
                        </Card>
                        ))}
                    </div>
                    </Card>

                    <Card
                        variant="glass"
                        style={{
                            padding: "35px",
                            marginBottom: "30px",
                            cursor: "default"
                        }}
                        >
                        <h2
                            style={{
                            textAlign: "center",
                            marginBottom: "30px",
                            }}
                        >
                            Why Choose Nudge?
                        </h2>

                        <div
                            style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(190px,1fr))",
                            gap: "22px",
                            }}
                        >
                            {[
                            {
                                icon: <FiZap size={38} />,
                                title: "Fast & Responsive",
                                text:
                                "Built with React for a smooth, responsive experience across desktop and mobile devices.",
                            },
                            {
                                icon: <FiShield size={38} />,
                                title: "Secure",
                                text:
                                "JWT authentication and protected routes keep your account and personal data secure.",
                            },
                            {
                                icon: <HiOutlineSparkles size={38} />,
                                title: "Modern Design",
                                text:
                                "A clean glassmorphism interface with dark and light themes makes productivity enjoyable.",
                            },
                            {
                                icon: <IoRocketOutline size={38} />,
                                title: "Built for Productivity",
                                text:
                                "Everything you need—notes, links, reminders, and profile management—in one organized workspace.",
                            },
                            ].map((item) => (
                            <Card
                                key={item.title}
                                variant="glass"
                                style={{
                                padding: "24px",
                                textAlign: "center",
                                transition: ".3s",
                                }}
                                onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(-5px)";
                                }}
                                onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(0)";
                                }}
                            >
                                <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    marginBottom: "15px",
                                }}
                                >
                                {item.icon}
                                </div>

                                <h3
                                style={{
                                    marginBottom: "12px",
                                }}
                                >
                                {item.title}
                                </h3>

                                <p
                                style={{
                                    opacity: 0.8,
                                    lineHeight: 1.7,
                                }}
                                >
                                {item.text}
                                </p>
                            </Card>
                            ))}
                        </div>
            </Card>

            <Card
                variant="glass"
                style={{
                    padding: "35px",
                    marginBottom: "30px",
                }}
                >
                <h2
                    style={{
                    textAlign: "center",
                    marginBottom: "28px",
                    }}
                >
                    Technologies Used
                </h2>

                <p
                    style={{
                    textAlign: "center",
                    opacity: 0.8,
                    marginBottom: "30px",
                    lineHeight: 1.8,
                    cursor: "default"
                    }}
                >
                    Nudge is built using modern web technologies focused on
                    performance, scalability, and user experience.
                </p>

                <div
                    style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "15px",
                    }}
                >
                    {[
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
                    ].map((tech) => (
                    <div
                        key={tech}
                        style={{
                            padding: "8px 14px",
                            borderRadius: "999px",
                            fontSize: ".9rem",
                            fontWeight: 500,

                            background: darkMode
                                ? "rgba(4, 4, 4, 0.31)"
                                : "rgba(255, 255, 255, 0.7)",

                            border: darkMode
                                ? "1px solid rgba(255,255,255,.15)"
                                : "1px solid rgba(255,255,255,.9)",

                            color: darkMode ? "#fff" : "#111",

                            boxShadow: darkMode
                                ? "inset 0 0 14px rgba(56,189,248,.28), 0 4px 12px rgba(0,0,0,.18)"
                                : "inset 0 0 12px rgba(0, 229, 255, 0.2), 0 4px 10px rgba(0, 0, 0, 0.08)",

                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            }}
                    >
                        {tech}
                    </div>
                    ))}
                </div>
                </Card>
            <Card
                variant="glass"
                style={{
                    padding: "45px",
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
                    lineHeight: 1.9,
                    opacity: 0.85,
                    fontSize: "1.05rem",
                    cursor: "default"
                    }}
                >
                    Nudge was created as a full-stack MERN application to
                    combine practical productivity tools with modern web
                    development practices. Every feature—from note
                    management and reminders to profile customization and
                    PDF export—was designed with simplicity, performance,
                    and user experience in mind.
                </p>

                <div
                    style={{
                    marginTop: "35px",
                    fontSize: "1.2rem",
                    opacity: 0.9,
                    fontStyle: "italic",
                    cursor: "default"
                    }}
                >
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                        >
                        <HiOutlineSparkles size={22} />
                        Remember less. Focus more.
                    </span>
                </div>
                </Card>
      </div>
    </Layout>
  );
}

export default About;