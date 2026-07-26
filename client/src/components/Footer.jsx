import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Card from "./Card";
import logo from "../assets/Logo.svg";

function Footer({ onVisibilityChange }) {
  const { user } = useContext(AuthContext);
  const footerRef = useRef(null);

  const darkMode = user?.theme === "dark";

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Profile", to: "/profile" },
      ],
    },

    {
      title: "Features",
      links: [
        { label: "Birthdays", to: "/birthdays" },
        { label: "Notes", to: "/notes" },
        { label: "Links", to: "/links" },
        { label: "Reminders", to: "/reminders" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "About", to: "/about" },
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms of Service", to: "/terms" },
        { label: "Contact", to: "/contact" },
      ],
    },
  ];

  useEffect(() => {
    if (!footerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        onVisibilityChange(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(footerRef.current);

    return () => observer.disconnect();
  }, [onVisibilityChange]);

  return (
    <footer
      ref={footerRef}
      id="app-footer"
      style={{
        marginTop: "50px",
        marginBottom: "10px",
      }}
    >
      <Card
        variant="glass"
        style={{
          padding: "10px 46px",
          borderRadius: "24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "20px",
            alignItems: "flex-start",
          }}
        >
          {/* Brand */}
          <div
            style={{
              maxWidth: "380px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "18px",
              }}
            >
              <img
                src={logo}
                alt="Nudge Logo"
                style={{
                  width: "55px",
                  height: "55px",
                }}
              />

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "2rem",
                  }}
                >
                  Nudge
                </h2>

                <span
                  style={{
                    opacity: 0.75,
                    fontSize: ".95rem",
                  }}
                >
                  Productivity Reimagined
                </span>
              </div>
            </div>

            <p
              style={{
                lineHeight: 1.8,
                opacity: 0.8,
                margin: 0,
              }}
            >
              Capture ideas, organize notes, save useful links,
              and stay on top of reminders—all in one beautiful,
              modern workspace.
            </p>
          </div>

          {/* Product / Resources */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "5px",
                }}
              >
                {section.title}
              </h3>

              {section.links.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  style={{
                    display: "block",
                    marginBottom: "1px",
                    color: "inherit",
                    textDecoration: "none",
                    opacity: 0.85,
                    transition: ".25s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateX(6px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = ".85";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <hr
          style={{
            margin: "26px 0 18px",
            opacity: 0.15,
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span>
            © {new Date().getFullYear()} Nudge. All rights reserved.
          </span>

          <span>Nudge. Remember Everything</span>
        </div>
      </Card>
    </footer>
  );
}

export default Footer;