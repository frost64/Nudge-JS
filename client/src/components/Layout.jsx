import Navbar from "./Navbar";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { createContext } from "react";
export const LayoutContext = createContext({
  cardVariant: "solid",
});

function Layout({
  children,
  sidebar,
  backgroundImage = null,
  blurBackground = false,
  cardVariant = "solid",
}) {
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
        backgroundColor: !backgroundImage
          ? (darkMode ? "#111827" : "#f8fafc")
          : undefined,
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundSize: "100% 100%",
        backgroundAttachment: "fixed",
        color:
            darkMode
                ? "#f9fafb"
                : "#111827",
        transition: "0.3s",
        position: "relative",
      }}
    >
      <Navbar />
      <div
        id="layout-content"
        inert={blurBackground ? "" : undefined}
        aria-hidden={blurBackground}
      >
        {blurBackground && (
          <div
            style={{
              display: "flex",
              gap: "30px",
              alignItems: "flex-start",
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: darkMode
                ? "rgba(0,0,0,.18)"
                : "rgba(255,255,255,.08)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              pointerEvents: "none",
              transition: "opacity .35s ease",
            }}
          />
        )}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "20px",
          display: "flex",
          gap: "30px",
          alignItems: "flex-start",
          position: "relative",
        }}
      >
    <LayoutContext.Provider value={{ cardVariant }}>
        {/* Sidebar */}
        {sidebar && (
          <aside
            style={{
              position: "sticky",
              width: "18%",
              flexShrink: 0,
              top: "10%",
              display: "flex",
              alignItems: "center",
              flexWrap: "nowrap",
              overflow: "visible",
              justifyContent: "space-between",
              gap: "20px",
              zIndex: 900
            }}
          >
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
          <main
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            {children}
          </main>
        </LayoutContext.Provider>
      </div>
    </div>
    </div>
  );
}

export default Layout;