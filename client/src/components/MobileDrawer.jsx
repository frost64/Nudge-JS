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
  header = null,
  darkMode = false,
}) {
  const { isMobile } = useBreakpoint();

  const closeButtonRef = useRef(null);
  const previousFocusedElementRef =
    useRef(null);

  const [shouldRender, setShouldRender] =
    useState(open);

  const [isVisible, setIsVisible] =
    useState(false);

  useEffect(() => {
    let animationFrame;
    let closeTimer;

    if (open) {
      setShouldRender(true);

      animationFrame =
        window.requestAnimationFrame(() => {
          setIsVisible(true);
        });
    } else {
      setIsVisible(false);

      closeTimer = window.setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_DURATION);
    }

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(
          animationFrame
        );
      }

      if (closeTimer) {
        window.clearTimeout(closeTimer);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previousFocusedElementRef.current =
      document.activeElement;

    const focusFrame =
      window.requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });

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
      window.cancelAnimationFrame(
        focusFrame
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      previousFocusedElementRef.current
        ?.focus?.();
    };
  }, [onClose, open]);

  if (!shouldRender) {
    return null;
  }

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

          background:
            "rgba(0,0,0,.45)",

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
        aria-hidden={!isVisible}
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

          WebkitOverflowScrolling:
            "touch",

          background: darkMode
            ? "rgba(17,24,39,.95)"
            : "rgba(255,255,255,.95)",

          backdropFilter: "blur(20px)",
          WebkitBackdropFilter:
            "blur(20px)",

          borderRight: darkMode
            ? "1px solid rgba(255,255,255,.08)"
            : "1px solid rgba(255,255,255,.45)",

          boxShadow: darkMode
          ? `
              inset -1px 0 0 rgba(94,234,212,.30),
              inset -10px 0 28px rgba(14,165,233,.10),
              inset 0 0 32px rgba(45,212,191,.08)
            `
          : `
              inset -1px 0 0 rgba(14,165,233,.28),
              inset -10px 0 26px rgba(14,165,233,.08),
              inset 0 0 28px rgba(20,184,166,.07)
            `,

          transform: isVisible
            ? "translateX(0)"
            : "translateX(-100%)",

          pointerEvents: isVisible
            ? "auto"
            : "none",

          transition: `transform ${ANIMATION_DURATION}ms ease`,
        }}
      >
        {/* Drawer heading row */}
        <header
          style={{
            display: "flex",
            alignItems: "center",

            justifyContent: header
              ? "space-between"
              : "flex-end",

            width: "100%",
            minWidth: 0,

            gap: "12px",

            marginBottom: "18px",
            paddingBottom: "14px",

            borderBottom: darkMode
              ? "1px solid rgba(255,255,255,.08)"
              : "1px solid rgba(0,0,0,.08)",

            boxSizing: "border-box",
          }}
        >
          {header && (
            <div
              style={{
                flexGrow: 1,
                flexShrink: 1,

                minWidth: 0,
              }}
            >
              {header}
            </div>
          )}

          <button
            ref={closeButtonRef}
            type="button"
            className="glow-top delete"
            aria-label="Close navigation menu"
            title="Close"
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",

              width: "42px",
              height: "42px",
              minWidth: "42px",

              flexShrink: 0,

              margin: 0,
              padding: 0,

              borderRadius: "12px",
            }}
          >
            <IoClose
              aria-hidden="true"
              size={22}
            />
          </button>
        </header>

        {children}
      </aside>
    </>
  );
}

export default MobileDrawer;