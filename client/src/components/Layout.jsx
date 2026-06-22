import Navbar from "./Navbar";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

function Layout({ children }) {
  const { user } = useContext(AuthContext);

  const darkMode =
    user?.theme === "dark";

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    return () => {
      document.body.classList.remove("dark");
    };
  }, [darkMode]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor:
          darkMode
            ? "#111827"
            : "#f8fafc",
        color:
          darkMode
            ? "#f9fafb"
            : "#111827",
        transition: "0.3s"
      }}
    >
      <Navbar />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
          overflow: "visible",
          position: "relative",
          zIndex: 1
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Layout;