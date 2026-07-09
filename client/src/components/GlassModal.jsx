import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function GlassModal({ children }) {
  const { user } = useContext(AuthContext);

  const darkMode = user?.theme === "dark";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        padding: "40px",
      }}
    >
      {children}
    </div>
  );
}

export default GlassModal;