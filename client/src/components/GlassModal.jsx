import {
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";

import useBreakpoint from "../hooks/useBreakpoint";

/**
 * Shared full-screen modal wrapper.
 *
 * Mobile and tablet:
 * - Starts below the fixed navbar.
 * - Prevents the underlying page from scrolling.
 * - Keeps the beginning of long forms reachable.
 * - Scrolls inside the modal viewport only when necessary.
 *
 * Desktop:
 * - Centers the modal vertically.
 */
function GlassModal({
  children,
  ariaLabel = "Dialog",
  onClose,
  closeOnBackdrop = false,
}) {
  const {
    isMobile,
    isTablet,
    isDesktop,
  } = useBreakpoint();

  const modalRef = useRef(null);

  const isCompact =
    isMobile || isTablet;

  useEffect(() => {
    const previousBodyOverflow =
      document.body.style.overflow;

    const previousBodyPaddingRight =
      document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    /*
     * Lock the page behind the modal.
     */
    document.body.style.overflow =
      "hidden";

    /*
     * Prevent the layout from shifting when the
     * browser scrollbar disappears.
     */
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        typeof onClose === "function"
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.body.style.paddingRight =
        previousBodyPaddingRight;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  if (
    typeof document === "undefined"
  ) {
    return null;
  }

  return createPortal(
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onMouseDown={(event) => {
        if (
          closeOnBackdrop &&
          typeof onClose === "function" &&
          event.target ===
            event.currentTarget
        ) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,

        /*
         * Higher than the navbar and both drawers.
         */
        zIndex: 6000,

        width: "100%",
        height: "100dvh",
        minWidth: 0,

        boxSizing: "border-box",

        /*
         * Compact screens begin below the fixed navbar.
         *
         * These variables already exist in your global CSS:
         * --navbar-top-offset
         * --navbar-height
         */
        paddingTop: isCompact
          ? `
              calc(
                var(
                  --navbar-top-offset,
                  6px
                ) +
                var(
                  --navbar-height,
                  70px
                ) +
                14px +
                env(
                  safe-area-inset-top
                )
              )
            `
          : "40px",

        paddingRight: isMobile
          ? "12px"
          : isTablet
            ? "20px"
            : "40px",

        paddingBottom: isCompact
          ? `
              calc(
                24px +
                env(
                  safe-area-inset-bottom
                )
              )
            `
          : "40px",

        paddingLeft: isMobile
          ? "12px"
          : isTablet
            ? "20px"
            : "40px",

        overflowX: "hidden",
        overflowY: "auto",

        overscrollBehavior:
          "contain",

        WebkitOverflowScrolling:
          "touch",

        background:
          "rgba(0, 0, 0, 0.5)",

        backdropFilter:
          "blur(12px)",

        WebkitBackdropFilter:
          "blur(12px)",

        animation:
          "nudge-modal-overlay-in 0.2s ease",
      }}
    >
      <div
        onMouseDown={(event) => {
          /*
           * Do not treat clicks inside the modal
           * content as backdrop clicks.
           */
          event.stopPropagation();
        }}
        style={{
          display: "flex",

          alignItems: "center",

          /*
           * Mobile and tablet forms begin at the
           * top of the available area instead of
           * being vertically centered and clipped.
           */
          justifyContent: isCompact
            ? "flex-start"
            : "center",

          flexDirection:
            "column",

          width: "100%",
          minWidth: 0,

          /*
           * Desktop content remains vertically
           * centered. Compact content starts below
           * the navbar.
           */
          minHeight: isDesktop
            ? "calc(100dvh - 80px)"
            : 0,

          margin: 0,

          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            minWidth: 0,

            /*
             * The Card inside each page controls
             * its own maxWidth.
             */
            display: "flex",
            justifyContent:
              "center",

            margin: 0,

            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default GlassModal;