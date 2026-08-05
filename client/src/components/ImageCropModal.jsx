import {
  useEffect,
  useState,
} from "react";
import Cropper from "react-easy-crop";

import useBreakpoint from "../hooks/useBreakpoint";

const INITIAL_CROP = {
  x: 0,
  y: 0,
};

/**
 * Responsive modal for cropping a profile image.
 *
 * Supports circular cropping, zoom control,
 * keyboard dismissal, and mobile-safe scrolling.
 */
function ImageCropModal({
  image,
  darkMode = false,
  open,
  onCancel,
  onSave,
  onCropComplete,
}) {
  const { isMobile, isTablet } = useBreakpoint();

  const [crop, setCrop] = useState(INITIAL_CROP);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!open) return;

    setCrop(INITIAL_CROP);
    setZoom(1);
  }, [image, open]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onCancel, open]);

  if (!open) return null;

  const cropAreaHeight = isMobile
    ? "min(280px, 42dvh)"
    : isTablet
      ? "min(340px, 48dvh)"
      : "min(420px, 55dvh)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-crop-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,

        display: "flex",
        justifyContent: "center",
        alignItems: isMobile
          ? "flex-start"
          : "center",

        width: "100%",
        height: "100dvh",
        minWidth: 0,
        boxSizing: "border-box",

        padding: isMobile
          ? "16px 12px calc(40px + env(safe-area-inset-bottom))"
          : isTablet
            ? "24px"
            : "30px",

        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",

        background: "rgba(0,0,0,.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "650px",
          minWidth: 0,
          margin: 0,
          boxSizing: "border-box",

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
            padding: isMobile
              ? "18px"
              : isTablet
                ? "22px"
                : "25px",
          }}
        >
          <h2
            id="image-crop-title"
            style={{
              marginTop: 0,
              textAlign: "center",
              fontSize: isMobile
                ? "1.3rem"
                : "1.6rem",
            }}
          >
            Crop Profile Picture
          </h2>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: cropAreaHeight,
              minHeight: isMobile
                ? "220px"
                : "280px",

              marginTop: "25px",
              borderRadius: "18px",
              overflow: "hidden",
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
              marginTop: "25px",
            }}
          >
            <label
              htmlFor="image-crop-zoom"
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: 600,
              }}
            >
              Zoom
            </label>

            <input
              id="image-crop-zoom"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              aria-label="Image zoom"
              onChange={(event) => {
                setZoom(
                  Number(event.target.value)
                );
              }}
              style={{
                width: "100%",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile
                ? "column-reverse"
                : "row",

              justifyContent: isMobile
                ? "stretch"
                : "flex-end",

              gap: isMobile
                ? "10px"
                : "15px",

              marginTop: "30px",
            }}
          >
            <button
              type="button"
              className="glow-top delete"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="button"
              className="glow-top"
              onClick={onSave}
            >
              Crop &amp; Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;