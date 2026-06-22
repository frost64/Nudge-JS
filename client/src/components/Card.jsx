import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Card({ children }) {

  const { user } =
    useContext(AuthContext);

  const darkMode =
    user?.theme === "dark";

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
            ? "0 4px 12px rgba(0,0,0,0.3)"
            : "0 4px 12px rgba(0,0,0,0.08)",

        overflowWrap: "break-word",

        transition: "all 0.3s ease"
      }}
    >
      {children}
    </div>
  );
}

export default Card;