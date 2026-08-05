import { forwardRef, useContext, useMemo } from "react";

import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";
import { LayoutContext } from "./Layout";

/**
 * Reusable responsive card component.
 *
 * Supports solid and glass variants while allowing callers
 * to override individual styles and native div properties.
 */
const Card = forwardRef(function Card(
  {
    children,
    style = {},
    variant,
    ...restProps
  },
  ref
) {
  const { user } = useContext(AuthContext);
  const { cardVariant } = useContext(LayoutContext);
  const { isMobile, isTablet } = useBreakpoint();

  const darkMode = user?.theme === "dark";
  const activeVariant = variant || cardVariant || "solid";

  const variantStyles = useMemo(
    () => ({
      solid: {
        background: darkMode
          ? "#1f2937"
          : "#ffffff",

        backgroundImage: "none",

        border: darkMode
          ? "1px solid #374151"
          : "1px solid #e5e7eb",

        outline: "none",

        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      },

      glass: {
        background: darkMode
          ? "rgba(17,24,39,.38)"
          : "rgba(255,255,255,.18)",

        backgroundImage: darkMode
          ? `
              linear-gradient(
                160deg,
                rgba(255,255,255,.14),
                rgba(255,255,255,.04) 35%,
                rgba(255,255,255,0)
              )
            `
          : `
              linear-gradient(
                160deg,
                rgba(255,255,255,.40),
                rgba(255,255,255,.08) 35%,
                rgba(255,255,255,0)
              )
            `,

        border: darkMode
          ? "1px solid rgba(255,255,255,.12)"
          : "1px solid rgba(255,255,255,.35)",

        outline: darkMode
          ? "1px solid rgba(255,255,255,.04)"
          : "1px solid rgba(255,255,255,.12)",

        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      },
    }),
    [darkMode]
  );

  const currentVariant =
    variantStyles[activeVariant] ||
    variantStyles.solid;

  const defaultShadow = useMemo(() => {
    if (activeVariant === "glass") {
      return darkMode
        ? `
            0 0 20px rgba(0,255,204,.16),
            0 0 45px rgba(0,140,255,.10),
            0 18px 45px rgba(0,0,0,.45)
          `
        : `
            0 0 18px rgba(0,180,255,.16),
            0 0 40px rgba(0,255,200,.10),
            0 18px 40px rgba(0,0,0,.15)
          `;
    }

    return darkMode
      ? "0 12px 30px rgba(0,0,0,.35)"
      : "0 10px 25px rgba(0,0,0,.12)";
  }, [activeVariant, darkMode]);

  const {
    boxShadow: customBoxShadow,
    ...customStyles
  } = style;

  return (
    <div
      ref={ref}
      {...restProps}
      style={{
        ...currentVariant,

        width: "auto",
        maxWidth: "100%",
        minWidth: 0,

        boxSizing: "border-box",

        color: darkMode
          ? "#f9fafb"
          : "#111827",

        borderRadius: isMobile
          ? "14px"
          : isTablet
            ? "16px"
            : "18px",

        padding: isMobile
          ? "14px"
          : isTablet
            ? "16px"
            : "20px",

        margin: isMobile
          ? "10px 0"
          : "15px 0",

        position: "relative",
        overflow: "visible",
        overflowWrap: "anywhere",

        boxShadow:
          customBoxShadow ??
          defaultShadow,

        transition:
          "background .25s ease, border .25s ease, box-shadow .25s ease",

        ...customStyles,
      }}
    >
      {children}
    </div>
  );
});

export default Card;