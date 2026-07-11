import { createContext, useContext, useState } from "react";
import GlassModal from "../components/GlassModal";
import Card from "../components/Card";

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null);

  const confirm = (config) => {
    return new Promise((resolve) => {
      setOptions({
        ...config,
        resolve,
      });
    });
  };

  const close = (result) => {
    options?.resolve(result);
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {options && (
        <>
          {/* Blurred Background */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1999,

              background:
                "linear-gradient(135deg, rgba(255,0,80,.08), rgba(0,180,255,.08), rgba(0,255,170,.08))",

              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",

              transition: "all .25s ease",

              pointerEvents: "auto",
            }}
          />

          <GlassModal>
            <Card
              variant="glass"
              style={{
                width: "100%",
                maxWidth: "420px",
                borderRadius: "24px",
                zIndex: 2000,

                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "12px",
                }}
              >
                {options.title}
              </h2>

              <p
                style={{
                  lineHeight: 1.6,
                  opacity: 0.9,
                }}
              >
                {options.message}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "28px",
                }}
              >
                <button
                  className="glow-top"
                  onClick={() => close(false)}
                >
                  {options.cancelText || "Cancel"}
                </button>

                <button
                  className="glow-top delete"
                  onClick={() => close(true)}
                >
                  {options.confirmText || "Delete"}
                </button>
              </div>
            </Card>
          </GlassModal>
        </>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}