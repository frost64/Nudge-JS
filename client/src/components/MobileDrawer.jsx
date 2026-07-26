import { IoClose } from "react-icons/io5";
function MobileDrawer({
  open,
  onClose,
  children,
  darkMode,
}) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.45)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .3s ease",
          zIndex: 3000,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "320px",
          maxWidth: "85vw",
          height: "100vh",

          padding: "20px",
          overflowY: "auto",

          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",

          background: darkMode
            ? "rgba(17,24,39,.95)"
            : "rgba(255,255,255,.95)",

          transform: open
            ? "translateX(0)"
            : "translateX(-100%)",

          transition: "transform .3s ease",

          zIndex: 3001,

          boxShadow: darkMode
            ? "0 0 40px rgba(0,0,0,.6)"
            : "0 0 35px rgba(0,0,0,.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <button
            className="glow-top"
            onClick={onClose}
          >
            <IoClose size={22} />
          </button>
        </div>

        {children}
      </div>
    </>
  );
}

export default MobileDrawer;