import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Toaster } from "react-hot-toast";

import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";

import Footer from "./Footer";
import Navbar from "./Navbar";
import TopScroll from "./TopScroll";

export const LayoutContext = createContext({
  cardVariant: "solid",
  width: 0,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
});

/**
 * Main application layout.
 *
 * Provides responsive breakpoint information, page background,
 * navigation, optional sidebar, footer, and global toast styling.
 */
function Layout({
  children,
  sidebar = null,
  backgroundImage = null,
  blurBackground = false,
  cardVariant = "solid",
}) {
  const { user } = useContext(AuthContext);
  const {
    width,
    isMobile,
    isTablet,
    isDesktop,
  } = useBreakpoint();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);
  const [footerVisible, setFooterVisible] =
    useState(false);

  const darkMode = user?.theme === "dark";

  const contextValue = useMemo(
    () => ({
      cardVariant,
      width,
      isMobile,
      isTablet,
      isDesktop,
    }),
    [
      cardVariant,
      width,
      isMobile,
      isTablet,
      isDesktop,
    ]
  );

  const toasterStyle = useMemo(
    () => ({
      borderRadius: "18px",
      padding: "14px 18px",

      background: darkMode
        ? `
            linear-gradient(
              160deg,
              rgba(255,255,255,.14),
              rgba(255,255,255,.04) 35%,
              rgba(255,255,255,0)
            ),
            linear-gradient(
              135deg,
              rgba(255,90,90,.10),
              rgba(0,158,129,.10),
              rgba(6,126,169,.10)
            )
          `
        : `
            linear-gradient(
              160deg,
              rgba(255,255,255,.40),
              rgba(255,255,255,.08) 35%,
              rgba(255,255,255,0)
            ),
            linear-gradient(
              135deg,
              rgba(255,90,90,.08),
              rgba(0,158,129,.08),
              rgba(6,126,169,.08)
            )
          `,

      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",

      border: darkMode
        ? "1px solid rgba(255,255,255,.12)"
        : "1px solid rgba(255,255,255,.35)",

      color: darkMode
        ? "#f9fafb"
        : "#111827",

      boxShadow: darkMode
        ? `
            0 0 20px rgba(0,255,204,.16),
            0 0 45px rgba(0,140,255,.10),
            0 18px 45px rgba(0,0,0,.45)
          `
        : `
            0 0 18px rgba(0,180,255,.16),
            0 0 40px rgba(0,255,200,.10),
            0 18px 40px rgba(0,0,0,.15)
          `,

      fontWeight: 500,
      letterSpacing: ".2px",
    }),
    [darkMode]
  );

  useEffect(() => {
    document.body.classList.toggle(
      "dark",
      darkMode
    );

    return () => {
      document.body.classList.remove("dark");
    };
  }, [darkMode]);

  return (
    <LayoutContext.Provider value={contextValue}>
      <div
        style={{
          position: "relative",

          display: "flex",
          flexDirection: "column",

          width: "100%",
          minWidth: 0,
          minHeight: "100dvh",
          boxSizing: "border-box",

          backgroundColor: backgroundImage
            ? undefined
            : darkMode
              ? "#111827"
              : "#f8fafc",

          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : undefined,

          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: isMobile
            ? "scroll"
            : "fixed",

          color: darkMode
            ? "#f9fafb"
            : "#111827",

          transition:
            "background-color .3s ease, color .3s ease",
        }}
      >
        <Navbar
          isMobile={isMobile}
          isTablet={isTablet}
          isDesktop={isDesktop}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <Toaster
          position="center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: toasterStyle,

            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },

            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />

        <div
          id="layout-content"
          style={{
            position: "relative",

            flexGrow: 1,
            flexShrink: 1,
            flexBasis: "auto",

            width: "100%",
            minWidth: 0,
          }}
        >
          {blurBackground && (
            <div
              aria-hidden="true"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,

                background: darkMode
                  ? "rgba(0,0,0,.18)"
                  : "rgba(255,255,255,.08)",

                backdropFilter: "blur(12px)",
                WebkitBackdropFilter:
                  "blur(12px)",

                pointerEvents: "none",

                transition:
                  "background .35s ease, backdrop-filter .35s ease",
              }}
            />
          )}

          <div
            style={{
              position: "relative",

              display: "flex",
              flexDirection: isMobile
                ? "column"
                : "row",
              alignItems: "flex-start",

              width: "100%",
              maxWidth: "1400px",
              minWidth: 0,

              margin: "0 auto",

              padding: isMobile
                ? "12px"
                : isTablet
                  ? "16px"
                  : "20px",

              gap: isMobile
                ? "16px"
                : isTablet
                  ? "22px"
                  : "30px",

              boxSizing: "border-box",
            }}
          >
            {sidebar && !isMobile && (
              <aside
                style={{
                  position: "sticky",
                  top: isTablet
                    ? "90px"
                    : "100px",

                  width: isTablet
                    ? "220px"
                    : "260px",

                  minWidth: isTablet
                    ? "220px"
                    : "260px",

                  flexShrink: 0,

                  display: "flex",
                  alignItems: "stretch",

                  overflow: "visible",

                  zIndex: 900,

                  opacity: footerVisible
                    ? 0
                    : 1,

                  visibility: footerVisible
                    ? "hidden"
                    : "visible",

                  pointerEvents: footerVisible
                    ? "none"
                    : "auto",

                  transition:
                    "opacity .45s ease, visibility .45s ease",
                }}
              >
                {sidebar}
              </aside>
            )}

            <main
              style={{
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: 0,

                width: isMobile
                  ? "100%"
                  : "auto",

                maxWidth: "none",
                minWidth: 0,

                margin: 0,

                padding: isMobile
                  ? "0 0 100px"
                  : "0 0 40px",

                boxSizing: "border-box",
              }}
            >
              {children}
            </main>
          </div>
        </div>

        <TopScroll />

        <Footer
          onVisibilityChange={setFooterVisible}
        />
      </div>
    </LayoutContext.Provider>
  );
}

export default Layout;