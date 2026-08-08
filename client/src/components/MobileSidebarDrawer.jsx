import {
  useCallback,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

function MobileSidebarDrawer({
  open,
  title = "Page Menu",
  darkMode = false,
  children,
  onClose,
  closeOnAction = true,
}) {
  const closeButtonRef = useRef(null);
  const drawerRef = useRef(null);

  const previousFocusedElementRef =
    useRef(null);

  const handleDrawerAction = useCallback(
    (event) => {
      if (!closeOnAction) {
        return;
      }

      const actionElement =
        event.target.closest?.(
          [
            "button",
            "a",
            '[role="button"]',
            '[role="link"]',
          ].join(",")
        );

      if (!actionElement) {
        return;
      }

      /*
       * Add data-drawer-keep-open="true"
       * to controls that should not close the drawer.
       */
      if (
        actionElement.dataset
          .drawerKeepOpen === "true"
      ) {
        return;
      }

      /*
       * The close button already handles its
       * own click through onClose.
       */
      if (
        actionElement ===
        closeButtonRef.current
      ) {
        return;
      }

      onClose();
    },
    [
      closeOnAction,
      onClose,
    ]
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previousFocusedElementRef.current =
      document.activeElement;

    const previousBodyOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const focusTimeout =
      window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.clearTimeout(
        focusTimeout
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousBodyOverflow;

      previousFocusedElementRef.current
        ?.focus?.();
    };
  }, [
    onClose,
    open,
  ]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,

        display: "flex",
        justifyContent: "flex-end",

        background:
          "rgba(0, 0, 0, 0.48)",

        backdropFilter: "blur(5px)",
        WebkitBackdropFilter:
          "blur(5px)",

        animation:
          "nudge-sidebar-overlay-in 0.22s ease",
      }}
    >
      <aside
        ref={drawerRef}
        className="nudge-mobile-sidebar-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          display: "flex",
          flexDirection: "column",

          width: "min(86vw, 350px)",
          height: "100dvh",
          minWidth: 0,

          padding: `
            calc(
              16px +
              env(safe-area-inset-top)
            )
            14px
            calc(
              16px +
              env(safe-area-inset-bottom)
            )
          `,

          boxSizing: "border-box",

          color: darkMode
            ? "#f8fafc"
            : "#0f172a",

          background: darkMode
            ? "rgba(15, 23, 42, 0.96)"
            : "rgba(241, 245, 249, 0.96)",

          borderLeft: darkMode
            ? "1px solid rgba(255, 255, 255, 0.15)"
            : "1px solid rgba(15, 23, 42, 0.12)",

          /*
           * The drawer itself has no outer glow.
           * The nested sidebar Card receives an
           * inner glow through the CSS below.
           */
          boxShadow: "none",

          backdropFilter: "blur(22px)",
          WebkitBackdropFilter:
            "blur(22px)",

          overflow: "hidden",

          animation:
            "nudge-sidebar-drawer-in 0.24s ease",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",

            flexShrink: 0,

            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <h2
            style={{
              minWidth: 0,
              margin: 0,

              fontSize: "1.25rem",
              lineHeight: 1.3,

              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h2>

          <button
            ref={closeButtonRef}
            type="button"
            className="glow-top delete"
            aria-label={`Close ${title}`}
            title="Close"
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",

              width: "40px",
              height: "40px",
              minWidth: "40px",

              flexShrink: 0,

              margin: 0,
              padding: 0,

              borderRadius: "12px",
            }}
          >
            <FaTimes
              aria-hidden="true"
              size={15}
            />
          </button>
        </header>

        <div
          onClick={handleDrawerAction}
          style={{
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,

            overflowX: "hidden",
            overflowY: "auto",

            overscrollBehavior:
              "contain",

            WebkitOverflowScrolling:
              "touch",
          }}
        >
          {children}
        </div>
      </aside>
    </div>,
    document.body
  );
}

export default MobileSidebarDrawer;