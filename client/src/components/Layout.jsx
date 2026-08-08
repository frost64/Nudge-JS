import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FaSlidersH } from "react-icons/fa";
import { Toaster } from "react-hot-toast";

import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";

import Footer from "./Footer";
import MobileSidebarDrawer from "./MobileSidebarDrawer";
import Navbar from "./Navbar";
import TopScroll from "./TopScroll";

export const LayoutContext = createContext({
  cardVariant: "solid",

  width: 0,
  isMobile: false,
  isTablet: false,
  isDesktop: true,

  hasSidebar: false,
  useSidebarDrawer: false,
  mobileSidebarOpen: false,

  openMobileSidebar: () => {},
  closeMobileSidebar: () => {},
});

/**
 * Main application layout.
 *
 * Provides responsive breakpoint information, page background,
 * navigation, optional contextual sidebar, footer, and global
 * toast styling.
 *
 * Sidebar behavior:
 * - Mobile: sidebar is displayed inside a drawer.
 * - Tablet: sidebar is displayed inside a drawer.
 * - Desktop: sidebar is displayed as a sticky sidebar.
 */
function Layout({
  children,
  sidebar = null,
  sidebarTitle = "Page Menu",
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

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  const [
    footerVisible,
    setFooterVisible,
  ] = useState(false);

  const darkMode =
    user?.theme === "dark";

  const hasSidebar =
    Boolean(sidebar);

  /**
   * Mobile and tablet share the contextual
   * page-sidebar drawer.
   */
  const useSidebarDrawer =
    isMobile || isTablet;

  /**
   * Opens the contextual page-sidebar drawer
   * and closes the main navigation drawer.
   */
  const openMobileSidebar =
    useCallback(() => {
      if (
        !useSidebarDrawer ||
        !hasSidebar
      ) {
        return;
      }

      setMobileMenuOpen(false);
      setMobileSidebarOpen(true);
    }, [
      hasSidebar,
      useSidebarDrawer,
    ]);

  /**
   * Closes the contextual page-sidebar drawer.
   */
  const closeMobileSidebar =
    useCallback(() => {
      setMobileSidebarOpen(false);
    }, []);

  /**
   * Coordinates the main navbar drawer with
   * the contextual page-sidebar drawer.
   *
   * Navbar may pass either a boolean value or
   * a React state-updater function.
   */
  const updateMobileMenuOpen =
    useCallback((nextValue) => {
      setMobileSidebarOpen(false);

      setMobileMenuOpen(
        nextValue
      );
    }, []);

  const contextValue =
    useMemo(
      () => ({
        cardVariant,

        width,
        isMobile,
        isTablet,
        isDesktop,

        hasSidebar,
        useSidebarDrawer,
        mobileSidebarOpen,

        openMobileSidebar,
        closeMobileSidebar,
      }),
      [
        cardVariant,

        width,
        isMobile,
        isTablet,
        isDesktop,

        hasSidebar,
        useSidebarDrawer,
        mobileSidebarOpen,

        openMobileSidebar,
        closeMobileSidebar,
      ]
    );

  const toasterStyle =
    useMemo(
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

        backdropFilter:
          "blur(18px)",

        WebkitBackdropFilter:
          "blur(18px)",

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

  /**
   * Keeps the global body dark-mode class
   * synchronized with the authenticated user theme.
   */
  useEffect(() => {
    document.body.classList.toggle(
      "dark",
      darkMode
    );

    return () => {
      document.body.classList.remove(
        "dark"
      );
    };
  }, [darkMode]);

  /**
   * Close both drawers after switching to
   * desktop mode.
   *
   * Moving between mobile and tablet keeps the
   * same drawer behavior.
   */
  useEffect(() => {
    if (isDesktop) {
      setMobileMenuOpen(false);
      setMobileSidebarOpen(false);
    }
  }, [isDesktop]);

  /**
   * Close the contextual drawer when the
   * current page no longer provides a sidebar.
   */
  useEffect(() => {
    if (!hasSidebar) {
      setMobileSidebarOpen(false);
    }
  }, [hasSidebar]);

  /**
   * Close the contextual drawer if the layout
   * no longer uses drawer-based sidebars.
   */
  useEffect(() => {
    if (!useSidebarDrawer) {
      setMobileSidebarOpen(false);
    }
  }, [useSidebarDrawer]);

  return (
    <LayoutContext.Provider
      value={contextValue}
    >
      <div
        style={{
          position: "relative",

          display: "flex",
          flexDirection: "column",

          width: "100%",
          minWidth: 0,
          minHeight: "100dvh",

          boxSizing: "border-box",

          backgroundColor:
            backgroundImage
              ? undefined
              : darkMode
                ? "#111827"
                : "#f8fafc",

          backgroundImage:
            backgroundImage
              ? `url(${backgroundImage})`
              : undefined,

          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",

          backgroundAttachment:
            isMobile
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
          mobileMenuOpen={
            mobileMenuOpen
          }
          setMobileMenuOpen={
            updateMobileMenuOpen
          }
        />

        {/* Mobile and tablet contextual sidebar drawer */}
        {hasSidebar &&
          useSidebarDrawer && (
            <MobileSidebarDrawer
              open={
                mobileSidebarOpen
              }
              title={sidebarTitle}
              darkMode={darkMode}
              closeOnAction
              onClose={
                closeMobileSidebar
              }
            >
              {sidebar}
            </MobileSidebarDrawer>
          )}

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

                backdropFilter:
                  "blur(12px)",

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

              /*
               * Mobile and tablet have no visible
               * fixed sidebar, so content uses the
               * complete available width.
               */
              flexDirection:
                useSidebarDrawer
                  ? "column"
                  : "row",

              alignItems:
                "flex-start",

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
                  ? "18px"
                  : "30px",

              boxSizing: "border-box",
            }}
          >
            {/* Desktop-only sticky sidebar */}
            {hasSidebar &&
              isDesktop && (
                <aside
                  style={{
                    position:
                      "sticky",

                    top: "100px",

                    width: "260px",
                    minWidth:
                      "260px",

                    flexShrink: 0,

                    display: "flex",
                    alignItems:
                      "stretch",

                    overflow:
                      "visible",

                    zIndex: 900,

                    opacity:
                      footerVisible
                        ? 0
                        : 1,

                    visibility:
                      footerVisible
                        ? "hidden"
                        : "visible",

                    pointerEvents:
                      footerVisible
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

                width:
                  useSidebarDrawer
                    ? "100%"
                    : "auto",

                maxWidth: "none",
                minWidth: 0,

                margin: 0,

                padding: isMobile
                  ? "0 0 100px"
                  : isTablet
                    ? "0 0 60px"
                    : "0 0 40px",

                boxSizing:
                  "border-box",
              }}
            >
              {/* Mobile and tablet page-menu button */}
              {hasSidebar &&
                useSidebarDrawer && (
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "flex-start",

                      width: "100%",
                      minWidth: 0,

                      marginBottom:
                        isMobile
                          ? "12px"
                          : "16px",
                    }}
                  >
                    <button
                      type="button"
                      className="glow-top left"
                      aria-label={`Open ${sidebarTitle}`}
                      aria-haspopup="dialog"
                      aria-expanded={
                        mobileSidebarOpen
                      }
                      onClick={
                        openMobileSidebar
                      }
                      style={{
                        display:
                          "inline-flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        width: "auto",
                        minWidth:
                          "max-content",

                        minHeight:
                          isMobile
                            ? "40px"
                            : "44px",

                        flexShrink: 0,

                        gap: "8px",

                        margin: 0,

                        padding:
                          isMobile
                            ? "8px 14px"
                            : "10px 16px",

                        borderRadius:
                          "12px",

                        fontSize:
                          isMobile
                            ? ".9rem"
                            : ".95rem",

                        fontWeight: 700,
                        lineHeight: 1,

                        whiteSpace:
                          "nowrap",

                        cursor:
                          "pointer",
                      }}
                    >
                      <FaSlidersH
                        aria-hidden="true"
                        size={
                          isMobile
                            ? 15
                            : 16
                        }
                      />

                      <span>
                        {sidebarTitle}
                      </span>
                    </button>
                  </div>
                )}

              {children}
            </main>
          </div>
        </div>

        <TopScroll />

        <Footer
          onVisibilityChange={
            setFooterVisible
          }
        />
      </div>
    </LayoutContext.Provider>
  );
}

export default Layout;