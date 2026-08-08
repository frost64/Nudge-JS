import {
  APP_VERSION,
} from "../config/appConfig";
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
      {
        label: "Dashboard",
        to: "/dashboard",
      },
      {
        label: "Profile",
        to: "/profile",
      },
    ],
  },
  {
    title: "Features",
    hideOnMobile: true,
    links: [
      {
        label: "Birthdays",
        to: "/birthdays",
      },
      {
        label: "Notes",
        to: "/notes",
      },
      {
        label: "Links",
        to: "/links",
      },
      {
        label: "Reminders",
        to: "/reminders",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "About",
        to: "/about",
      },
      {
        label: "Privacy Policy",
        to: "/privacy",
      },
      {
        label: "Terms of Service",
        to: "/terms",
      },
      {
        label: "Contact",
        to: "/contact",
      },
    ],
  },
];

/**
 * Global responsive footer.
 *
 * The explicit bottom spacer prevents the final section of the
 * footer from being covered by mobile browser controls or a
 * device safe area.
 */
function Footer({
  onVisibilityChange = () => {},
}) {
  const footerRef = useRef(null);

  const {
    isMobile,
    isTablet,
  } = useBreakpoint();

  const visibleSections = useMemo(
    () =>
      FOOTER_SECTIONS.filter(
        (section) =>
          !(
            isMobile &&
            section.hideOnMobile
          )
      ),
    [isMobile]
  );

  useEffect(() => {
    const footerElement =
      footerRef.current;

    if (
      !footerElement ||
      typeof IntersectionObserver ===
        "undefined"
    ) {
      return undefined;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          onVisibilityChange(
            entry.isIntersecting
          );
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
        position: "relative",
        zIndex: 1,

        display: "block",

        width: "100%",
        minWidth: 0,
        height: "auto",
        minHeight: 0,
        maxHeight: "none",

        flexShrink: 0,

        marginTop: isMobile
          ? "70px"
          : "150px",

        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,

        paddingTop: 0,
        paddingRight: isMobile
          ? "12px"
          : "20px",
        paddingBottom: 0,
        paddingLeft: isMobile
          ? "12px"
          : "20px",

        boxSizing: "border-box",

        overflow: "visible",

        scrollMarginBottom:
          "calc(48px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        style={{
          position: "relative",

          width: "100%",
          minWidth: 0,

          height: "auto",
          minHeight: 0,
          maxHeight: "none",

          margin: 0,
          padding: 0,

          boxSizing: "border-box",

          overflow: "visible",
        }}
      >
        <Card
          variant="glass"
          style={{
            position: "relative",

            display: "block",

            width: "100%",
            minWidth: 0,

            height: "auto",
            minHeight: 0,
            maxHeight: "none",

            margin: 0,

            padding: isMobile
              ? "22px 20px 26px"
              : isTablet
                ? "28px"
                : "18px 46px",

            boxSizing: "border-box",

            borderRadius: "24px",

            overflow: "visible",
          }}
        >
          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                isMobile
                  ? "minmax(0, 1fr)"
                  : isTablet
                    ? "repeat(2, minmax(0, 1fr))"
                    : "minmax(0, 2fr) repeat(3, minmax(0, 1fr))",

              width: "100%",
              minWidth: 0,

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

                  minWidth: 0,

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

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,

                      fontSize: isMobile
                        ? "1.5rem"
                        : isTablet
                          ? "1.7rem"
                          : "2rem",

                      lineHeight: 1.25,
                    }}
                  >
                    Nudge
                  </h2>

                  <span
                    style={{
                      display: "block",

                      marginTop: "3px",

                      fontSize: ".95rem",

                      opacity: 0.75,

                      overflowWrap:
                        "anywhere",
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
                Capture ideas, organize notes,
                save useful links, and stay on
                top of reminders—all in one
                beautiful, modern workspace.
              </p>
            </section>

            {visibleSections.map(
              (section) => (
                <nav
                  key={section.title}
                  aria-label={`${section.title} links`}
                  style={{
                    width: "100%",
                    minWidth: 0,
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "10px",

                      lineHeight: 1.3,
                    }}
                  >
                    {section.title}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",

                      alignItems:
                        "flex-start",

                      width: "100%",
                      minWidth: 0,

                      gap: "5px",
                    }}
                  >
                    {section.links.map(
                      (link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          style={{
                            display:
                              "inline-block",

                            width:
                              "fit-content",

                            maxWidth: "100%",

                            margin: 0,

                            color: "inherit",

                            textDecoration:
                              "none",

                            lineHeight: 1.6,

                            opacity: 0.85,

                            overflowWrap:
                              "anywhere",

                            transition:
                              "opacity .25s ease, transform .25s ease",
                          }}
                          onMouseEnter={(
                            event
                          ) => {
                            event.currentTarget.style.opacity =
                              "1";

                            event.currentTarget.style.transform =
                              "translateX(6px)";
                          }}
                          onMouseLeave={(
                            event
                          ) => {
                            event.currentTarget.style.opacity =
                              ".85";

                            event.currentTarget.style.transform =
                              "translateX(0)";
                          }}
                        >
                          {link.label}
                        </Link>
                      )
                    )}
                  </div>
                </nav>
              )
            )}
          </div>

          <hr
            style={{
              width: "100%",

              margin: isMobile
                ? "24px 0 18px"
                : "26px 0 18px",

              opacity: 0.15,
            }}
          />

          <div
            style={{
              display: "flex",

              flexDirection: isMobile
                ? "column"
                : "row",

              justifyContent:
                "space-between",

              alignItems: "center",

              flexWrap: "wrap",

              width: "100%",
              minWidth: 0,

              gap: isMobile
                ? "10px"
                : "12px",

              paddingBottom: isMobile
                ? "4px"
                : 0,

              boxSizing: "border-box",

              fontSize: isMobile
                ? ".9rem"
                : "1rem",

              lineHeight: 1.6,

              textAlign: isMobile
                ? "center"
                : "left",

              overflow: "visible",
            }}
          >
            <span>
              © {new Date().getFullYear()}{" "}
              Nudge. All rights reserved.

              <span
                style={{
                  marginLeft: "8px",
                  fontSize: ".82rem",
                  opacity: 0.65,
                  whiteSpace: "nowrap",
                }}
              >
                v{APP_VERSION}
              </span>
            </span>

            <span
              style={{
                display: "block",

                width: isMobile
                  ? "100%"
                  : "auto",

                minWidth: 0,

                overflowWrap: "anywhere",
              }}
            >
              Nudge. Remember Everything
            </span>
          </div>
        </Card>
      </div>

      {/*
       * Real scrollable space beneath the footer card.
       *
       * This protects the footer from mobile browser toolbars,
       * gesture navigation areas, and iPhone safe-area insets.
       */}
      <div
        aria-hidden="true"
        style={{
          display: "block",

          width: "100%",

          height: isMobile
            ? "calc(56px + env(safe-area-inset-bottom, 0px))"
            : "20px",

          minHeight: isMobile
            ? "calc(56px + env(safe-area-inset-bottom, 0px))"
            : "20px",

          flexShrink: 0,

          pointerEvents: "none",
        }}
      />
    </footer>
  );
}

export default Footer;