import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function GlassModal({
  backgroundImage,
  children,
}) {
  const { user } = useContext(AuthContext);

  const darkMode = user?.theme === "dark";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "auto",

        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* blurred overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,

          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",

          background: darkMode
            ? "rgba(0,0,0,.35)"
            : "rgba(255,255,255,.08)",
        }}
      />

      {/* content */}
      <div
        style={{
          position: "relative",
          minHeight: "100vh",

          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          padding: "40px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default GlassModal;