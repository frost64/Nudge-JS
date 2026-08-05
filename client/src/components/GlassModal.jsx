import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";

/**
 * Responsive glassmorphism modal wrapper.
 *
 * The modal container handles viewport scrolling while allowing
 * the provided children to control their own width and content.
 */
function GlassModal({
  children,
  ariaLabel = "Dialog",
}) {
  const { user } = useContext(AuthContext);
  const { isMobile, isTablet } = useBreakpoint();

  const darkMode = user?.theme === "dark";

  return (
    <>
      {/* Decorative background overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1998,

          background: darkMode
            ? "rgba(0,0,0,.18)"
            : "rgba(255,255,255,.08)",

          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",

          pointerEvents: "none",
          transition:
            "background .25s ease, backdrop-filter .25s ease",
        }}
      />

      {/* Scrollable modal viewport */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,

          display: "flex",
          justifyContent: "center",
          alignItems: isMobile
            ? "flex-start"
            : "center",

          width: "100%",
          height: "100dvh",
          minWidth: 0,
          boxSizing: "border-box",

          padding: isMobile
            ? "16px 12px calc(80px + env(safe-area-inset-bottom))"
            : isTablet
              ? "28px"
              : "40px",

          overflowX: "hidden",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>
    </>
  );
}

export default GlassModal;