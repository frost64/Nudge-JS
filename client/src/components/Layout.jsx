import Navbar from "./Navbar";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { createContext } from "react";
import { Toaster } from "react-hot-toast";
import TopScroll from "./TopScroll";

export const LayoutContext = createContext({
  cardVariant: "solid",
  isMobile: false,
});

function Layout({
  children,
  sidebar,
  backgroundImage = null,
  blurBackground = false,
  cardVariant = "solid",
}) {
  const { user } = useContext(AuthContext);
  const darkMode = user?.theme === "dark";
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");

    const update = () => setIsMobile(media.matches);

    update();

    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

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
        <Navbar
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
          <Toaster
            position="center"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,

              style: {
                borderRadius: "18px",
                padding: "14px 18px",

                background: darkMode
                  ? "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.04) 35%, rgba(255,255,255,0)), linear-gradient(135deg, rgba(255,90,90,.10), rgba(0,158,129,.10), rgba(6,126,169,.10))"
                  : "linear-gradient(160deg, rgba(255,255,255,.40), rgba(255,255,255,.08) 35%, rgba(255,255,255,0)), linear-gradient(135deg, rgba(255,90,90,.08), rgba(0,158,129,.08), rgba(6,126,169,.08))",

                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",

                border: darkMode
                  ? "1px solid rgba(255,255,255,.12)"
                  : "1px solid rgba(255,255,255,.35)",

                color: darkMode ? "#f9fafb" : "#111827",

                boxShadow: darkMode
                  ? `
                      0 0 20px rgba(0,255,204,.16),
                      0 0 45px rgba(0,140,255,.10),
                      0 18px 45px rgba(0,0,0,.45)
                    `
                  : `
                      0 0 18px rgba(0,180,255,.16),
                      0 0 40px rgba(0,255,200,.10),
                      0 18px 40px rgba(0,0,0,.15)
                    `,

                fontWeight: 500,
                letterSpacing: ".2px",
              },

              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#ffffff",
                },
              },

              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />
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
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
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
    <LayoutContext.Provider
      value={{
        cardVariant,
        isMobile,
      }}
    >
        {/* Sidebar */}
        {sidebar && !isMobile && (
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
     <TopScroll />
    </div>
  );
}

export default Layout;