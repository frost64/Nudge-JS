import logo from "../assets/Logo.svg";

function LoadingSpinner({
  text = "Loading...",
  size = 90,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        gap: "22px",
      }}
    >
      <div
        className="nudge-loader"
        style={{
          width: size,
          height: size,
        }}
      >
        <div className="nudge-loader-ring"></div>

        <div className="nudge-loader-center">
          <img
            src={logo}
            alt="Nudge"
            style={{
                width: "80%",
                height: "80%",
                objectFit: "contain",
                animation: "nudgePulse 1.8s ease-in-out infinite",
            }}
            />
        </div>
      </div>

      <p
        style={{
          opacity: .75,
          fontWeight: 600,
          letterSpacing: ".5px",
          userSelect: "none",
        }}
      >
        {text}
      </p>
    </div>
  );
}

export default LoadingSpinner;