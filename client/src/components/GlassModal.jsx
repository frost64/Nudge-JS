import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function GlassModal({ children }) {
  const { user } = useContext(AuthContext);

  const darkMode = user?.theme === "dark";

  return (
    <>
      {/* Background Blur */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1998,

          background: darkMode
            ? "rgba(0,0,0,.18)"
            : "rgba(255,255,255,.08)",

          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",

          transition: "all .25s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,

          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          padding: "40px",
        }}
      >
        {children}
      </div>
    </>
  );
}

export default GlassModal;