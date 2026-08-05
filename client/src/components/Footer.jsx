import {
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Link } from "react-router-dom";

import logo from "../assets/Logo.svg";
import useBreakpoint from "../hooks/useBreakpoint";
import Card from "./Card";

const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Profile", to: "/profile" },
    ],
  },
  {
    title: "Features",
    hideOnMobile: true,
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

/**
 * Global responsive footer displayed beneath Layout content.
 *
 * Reports its viewport visibility to Layout so sticky sidebars
 * can be hidden while the footer is visible.
 */
function Footer({
  onVisibilityChange = () => {},
}) {
  const footerRef = useRef(null);
  const { isMobile, isTablet } = useBreakpoint();

  const visibleSections = useMemo(
    () =>
      FOOTER_SECTIONS.filter(
        (section) =>
          !(isMobile && section.hideOnMobile)
      ),
    [isMobile]
  );

  useEffect(() => {
    const footerElement = footerRef.current;

    if (
      !footerElement ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        onVisibilityChange(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(footerElement);

    return () => {
      observer.disconnect();
      onVisibilityChange(false);
    };
  }, [onVisibilityChange]);

  return (
    <footer
      ref={footerRef}
      id="app-footer"
      style={{
        width: "100%",
        minWidth: 0,
        flexShrink: 0,
        boxSizing: "border-box",

        marginTop: isMobile
          ? "80px"
          : "150px",

        padding: isMobile
          ? "0 12px calc(24px + env(safe-area-inset-bottom))"
          : "0 20px 20px",
      }}
    >
      <Card
        variant="glass"
        style={{
          width: "100%",
          minWidth: 0,
          margin: 0,

          padding: isMobile
            ? "20px"
            : isTablet
              ? "28px"
              : "18px 46px",

          borderRadius: "24px",
        }}
      >
        <div
          style={{
            display: "grid",

            gridTemplateColumns: isMobile
              ? "minmax(0, 1fr)"
              : isTablet
                ? "repeat(2, minmax(0, 1fr))"
                : "minmax(0, 2fr) repeat(3, minmax(0, 1fr))",

            gap: isMobile
              ? "28px"
              : "20px",

            alignItems: "flex-start",
          }}
        >
          <section
            aria-label="Nudge information"
            style={{
              width: "100%",
              minWidth: 0,
              maxWidth: isMobile
                ? "100%"
                : "380px",
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
                alt="Nudge"
                style={{
                  width: isMobile
                    ? "42px"
                    : isTablet
                      ? "48px"
                      : "55px",

                  height: isMobile
                    ? "42px"
                    : isTablet
                      ? "48px"
                      : "55px",

                  flexShrink: 0,
                  objectFit: "contain",
                }}
              />

              <div style={{ minWidth: 0 }}>
                <h2
                  style={{
                    margin: 0,

                    fontSize: isMobile
                      ? "1.5rem"
                      : isTablet
                        ? "1.7rem"
                        : "2rem",
                  }}
                >
                  Nudge
                </h2>

                <span
                  style={{
                    display: "block",
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
                margin: 0,
                lineHeight: 1.8,
                opacity: 0.8,
                overflowWrap: "anywhere",
              }}
            >
              Capture ideas, organize notes, save useful
              links, and stay on top of reminders—all in one
              beautiful, modern workspace.
            </p>
          </section>

          {visibleSections.map((section) => (
            <nav
              key={section.title}
              aria-label={`${section.title} links`}
              style={{
                minWidth: 0,
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "8px",
                }}
              >
                {section.title}
              </h3>

              {section.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: "block",
                    width: "fit-content",
                    maxWidth: "100%",
                    marginBottom: "3px",

                    color: "inherit",
                    textDecoration: "none",
                    opacity: 0.85,
                    overflowWrap: "anywhere",

                    transition:
                      "opacity .25s ease, transform .25s ease",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.opacity = "1";
                    event.currentTarget.style.transform =
                      "translateX(6px)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.opacity = ".85";
                    event.currentTarget.style.transform =
                      "translateX(0)";
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
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
            flexDirection: isMobile
              ? "column"
              : "row",

            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",

            gap: "12px",
            textAlign: isMobile
              ? "center"
              : "left",

            fontSize: isMobile
              ? ".9rem"
              : "1rem",
          }}
        >
          <span>
            © {new Date().getFullYear()} Nudge. All rights
            reserved.
          </span>

          <span>Nudge. Remember Everything</span>
        </div>
      </Card>
    </footer>
  );
}

export default Footer;