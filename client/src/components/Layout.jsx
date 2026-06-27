import Navbar from "./Navbar";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

function Layout({ children, sidebar }) {
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
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "20px",

          display: "flex",
          gap: "30px",
          alignItems: "flex-start"
        }}
      >

        {/* Sidebar */}
        {sidebar && (
          <aside
            style={{
              width: "250px",
              flexShrink: 0
            }}
          >
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            minWidth: 0
          }}
        >
          {children}
        </main>

      </div>
    </div>
  );
}

export default Layout;