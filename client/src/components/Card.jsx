import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Card({ children, style }) {
  const { user } = useContext(AuthContext);
  const darkMode = user?.theme === "dark";

  return (
    <div
      style={{
        backgroundColor:
          darkMode
            ? "#1f2937"
            : "#ffffff",
        color:
          darkMode
            ? "#f9fafb"
            : "#111827",
        border:
          darkMode
            ? "1px solid #374151"
            : "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        margin: "15px 0",
        
        boxShadow:
          darkMode
            ? "0 0 15px rgba(1, 129, 88, 0.25),0 0 35px rgba(0, 38, 100, 0.2)"
            : "0 0 15px rgba(115, 255, 192, 0.35),0 0 35px rgba(146, 188, 255, 0.45)",
        overflowWrap: "break-word",
        transition: "all 0.3s ease",
        ...style
      }}
    >
      {children}
    </div>
  );
}

export default Card;