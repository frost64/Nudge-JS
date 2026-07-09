import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LayoutContext } from "./Layout";
import { forwardRef } from "react";

const Card = forwardRef(function Card({
  children,
  style = {},
  variant,
}, ref) {
  const {
    boxShadow: customBoxShadow,
    ...restStyle
  } = style;

  const { user } = useContext(AuthContext);
  const { cardVariant } = useContext(LayoutContext);

  const darkMode = user?.theme === "dark";

  const variants = {
    solid: {
      background: darkMode
        ? "#1f2937"
        : "#ffffff",

      border: darkMode
        ? "1px solid #374151"
        : "1px solid #e5e7eb",
    },

    glass: {
      background: darkMode
        ? "rgba(17,24,39,.38)"
        : "rgba(255,255,255,.18)",

      backgroundImage: darkMode
        ? "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.04) 35%, rgba(255,255,255,0))"
        : "linear-gradient(160deg, rgba(255,255,255,.40), rgba(255,255,255,.08) 35%, rgba(255,255,255,0))",

      border: darkMode
        ? "1px solid rgba(255,255,255,.12)"
        : "1px solid rgba(255,255,255,.35)",

      outline: darkMode
        ? "1px solid rgba(255,255,255,.04)"
        : "1px solid rgba(255,255,255,.12)",

      boxSizing: "border-box",

      backdropFilter: "none",
      WebkitBackdropFilter: "none",
    },
  };

  const activeVariant = variant || cardVariant || "solid";
  const currentVariant = variants[activeVariant];

  const defaultShadow =
    activeVariant === "glass"
      ? darkMode
        ? `
            0 0 20px rgba(0,255,204,.16),
            0 0 45px rgba(0,140,255,.10),
            0 18px 45px rgba(0,0,0,.45)
          `
        : `
            0 0 18px rgba(0,180,255,.16),
            0 0 40px rgba(0,255,200,.10),
            0 18px 40px rgba(0,0,0,.15)
          `
      : darkMode
        ? "0 12px 30px rgba(0,0,0,.35)"
        : "0 10px 25px rgba(0,0,0,.12)";

  return (
    <div
      ref={ref}
      style={{
        background:
          style.background ??
          currentVariant.background,

        backgroundImage:
          style.backgroundImage ??
          currentVariant.backgroundImage,

        border:
          style.border ??
          currentVariant.border,

        outline:
          style.outline ??
          currentVariant.outline,

        boxSizing:
          style.boxSizing ??
          currentVariant.boxSizing,

        backdropFilter:
          style.backdropFilter ??
          currentVariant.backdropFilter,

        WebkitBackdropFilter:
          style.WebkitBackdropFilter ??
          currentVariant.WebkitBackdropFilter,

        color:
          darkMode
            ? "#f9fafb"
            : "#111827",

        borderRadius: "18px",
        padding: "20px",
        margin: "15px 0",

        boxShadow:
          customBoxShadow ??
          defaultShadow,

        position: "relative",

        overflow: "visible",

        overflowWrap: "break-word",

        transition:
          "background .25s ease, border .25s ease, box-shadow .25s ease",

        ...restStyle,
      }}
    >
      {children}
    </div>
  );
});

export default Card;