import { useState } from "react";
import Cropper from "react-easy-crop";

function ImageCropModal({
  image,
  darkMode,
  open,
  onCancel,
  onSave,
  onCropComplete,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,

        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "min(92vw,650px)",
          borderRadius: "24px",
          overflow: "hidden",

          background: darkMode
            ? "rgba(17,24,39,.82)"
            : "rgba(255,255,255,.72)",

          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",

          border: darkMode
            ? "1px solid rgba(255,255,255,.10)"
            : "1px solid rgba(255,255,255,.55)",

          boxShadow: darkMode
            ? "0 25px 60px rgba(0,0,0,.45)"
            : "0 20px 50px rgba(0,0,0,.15)",
        }}
      >
        <div
          style={{
            padding: "25px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              textAlign: "center",
            }}
          >
            Crop Profile Picture
          </h2>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: 420,
              borderRadius: 18,
              overflow: "hidden",
              marginTop: 25,
            }}
          >
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div
            style={{
              marginTop: 25,
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: 10,
                fontWeight: 600,
              }}
            >
              Zoom
            </label>

            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) =>
                setZoom(Number(e.target.value))
              }
              style={{
                width: "100%",
              }}
            />
          </div>

          <div
            style={{
              marginTop: 30,
              display: "flex",
              justifyContent: "flex-end",
              gap: 15,
            }}
          >
            <button
              className="glow-top delete"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              className="glow-top"
              onClick={onSave}
            >
              Crop & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;