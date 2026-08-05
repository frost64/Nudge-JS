import {
  useEffect,
  useRef,
  useState,
} from "react";
import { IoClose } from "react-icons/io5";

import useBreakpoint from "../hooks/useBreakpoint";

const ANIMATION_DURATION = 300;

/**
 * Responsive slide-in navigation drawer.
 *
 * Preserves its closing animation before unmounting and
 * supports keyboard dismissal and focus management.
 */
function MobileDrawer({
  open,
  onClose,
  children,
  darkMode = false,
}) {
  const { isMobile } = useBreakpoint();
  const closeButtonRef = useRef(null);

  const [shouldRender, setShouldRender] =
    useState(open);
  const [isVisible, setIsVisible] =
    useState(false);

  useEffect(() => {
    let animationFrame;
    let closeTimer;

    if (open) {
      setShouldRender(true);

      animationFrame = requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);

      closeTimer = window.setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_DURATION);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(closeTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose, open]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Background overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 3000,

          background: "rgba(0,0,0,.45)",

          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible
            ? "auto"
            : "none",

          transition: `opacity ${ANIMATION_DURATION}ms ease`,
        }}
      />

      {/* Navigation drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        style={{
          position: "fixed",
          inset: "0 auto 0 0",
          zIndex: 3001,

          width: isMobile
            ? "85vw"
            : "320px",
          maxWidth: "360px",
          height: "100dvh",
          minWidth: 0,
          boxSizing: "border-box",

          padding: isMobile
            ? "18px"
            : "22px",

          paddingTop:
            "max(18px, env(safe-area-inset-top))",

          paddingBottom:
            "max(18px, env(safe-area-inset-bottom))",

          overflowX: "hidden",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",

          background: darkMode
            ? "rgba(17,24,39,.95)"
            : "rgba(255,255,255,.95)",

          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",

          borderRight: darkMode
            ? "1px solid rgba(255,255,255,.08)"
            : "1px solid rgba(255,255,255,.45)",

          boxShadow: darkMode
            ? "12px 0 40px rgba(0,0,0,.55)"
            : "10px 0 35px rgba(0,0,0,.15)",

          transform: isVisible
            ? "translateX(0)"
            : "translateX(-100%)",

          transition: `transform ${ANIMATION_DURATION}ms ease`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "12px",
          }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className="glow-top"
            aria-label="Close navigation menu"
            onClick={onClose}
            style={{
              width: "42px",
              height: "42px",
              margin: 0,
              padding: 0,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IoClose size={22} />
          </button>
        </div>

        {children}
      </aside>
    </>
  );
}

export default MobileDrawer;