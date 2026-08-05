import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Card from "../components/Card";
import GlassModal from "../components/GlassModal";
import useBreakpoint from "../hooks/useBreakpoint";

const ConfirmContext = createContext(null);

/**
 * Provides promise-based confirmation dialogs.
 *
 * Usage:
 * const confirmed = await confirm({
 *   title: "Delete item",
 *   message: "This action cannot be undone.",
 * });
 */
export function ConfirmProvider({ children }) {
  const { isMobile } = useBreakpoint();

  const [options, setOptions] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback(
    (config = {}) =>
      new Promise((resolve) => {
        // Resolve any existing confirmation before replacing it.
        resolverRef.current?.(false);

        resolverRef.current = resolve;

        setOptions({
          title: config.title || "Confirm Action",
          message:
            config.message ||
            "Are you sure you want to continue?",
          confirmText:
            config.confirmText || "Confirm",
          cancelText:
            config.cancelText || "Cancel",
        });
      }),
    []
  );

  useEffect(() => {
    if (!options) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        close(false);
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
  }, [close, options]);

  useEffect(
    () => () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
    },
    []
  );

  const contextValue = useMemo(
    () => confirm,
    [confirm]
  );

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}

      {options && (
        <GlassModal ariaLabel={options.title}>
          <Card
            variant="glass"
            style={{
              width: "100%",
              maxWidth: "420px",
              minWidth: 0,
              margin: 0,

              borderRadius: "24px",

              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "12px",
                overflowWrap: "anywhere",
              }}
            >
              {options.title}
            </h2>

            <p
              style={{
                margin: 0,
                lineHeight: 1.6,
                opacity: 0.9,
                overflowWrap: "anywhere",
              }}
            >
              {options.message}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: isMobile
                  ? "column-reverse"
                  : "row",

                justifyContent: isMobile
                  ? "stretch"
                  : "flex-end",

                gap: "12px",

                marginTop: isMobile
                  ? "22px"
                  : "28px",
              }}
            >
              <button
                type="button"
                className="glow-top"
                onClick={() => close(false)}
              >
                {options.cancelText}
              </button>

              <button
                type="button"
                className="glow-top delete"
                onClick={() => close(true)}
              >
                {options.confirmText}
              </button>
            </div>
          </Card>
        </GlassModal>
      )}
    </ConfirmContext.Provider>
  );
}

/**
 * Returns the global promise-based confirmation function.
 */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);

  if (!confirm) {
    throw new Error(
      "useConfirm must be used inside ConfirmProvider."
    );
  }

  return confirm;
}