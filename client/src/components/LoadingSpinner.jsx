import logo from "../assets/Logo.svg";
import useBreakpoint from "../hooks/useBreakpoint";

/**
 * Responsive Nudge loading indicator.
 *
 * @param {string} text - Loading message displayed below the spinner.
 * @param {number} size - Spinner size in pixels.
 * @param {boolean} fullscreen - Whether the spinner fills the viewport.
 */
function LoadingSpinner({
  text = "Loading...",
  size = 90,
  fullscreen = false,
}) {
  const { isMobile } = useBreakpoint();

  const responsiveSize = isMobile
    ? Math.min(size, 70)
    : size;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={text}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        width: "100%",
        minWidth: 0,
        minHeight: fullscreen
          ? "100dvh"
          : "auto",

        padding: isMobile
          ? "40px 16px"
          : "60px 20px",

        boxSizing: "border-box",
        gap: "22px",
      }}
    >
      <div
        className="nudge-loader"
        aria-hidden="true"
        style={{
          width: responsiveSize,
          height: responsiveSize,
          flexShrink: 0,
        }}
      >
        <div className="nudge-loader-ring" />

        <div className="nudge-loader-center">
          <img
            src={logo}
            alt=""
            style={{
              width: "80%",
              height: "80%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      <p
        style={{
          margin: 0,
          opacity: 0.75,
          fontSize: isMobile
            ? ".9rem"
            : "1rem",

          textAlign: "center",
          letterSpacing: ".5px",
          userSelect: "none",
          overflowWrap: "anywhere",
        }}
      >
        {text}
      </p>
    </div>
  );
}

export default LoadingSpinner;