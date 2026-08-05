import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1200;

/**
 * Returns the current viewport width together with
 * responsive breakpoint helpers.
 */
export default function useBreakpoint() {
  const getWidth = () =>
    typeof window === "undefined"
      ? DESKTOP_BREAKPOINT
      : window.innerWidth;

  const [width, setWidth] = useState(getWidth);

  useEffect(() => {
    let frameId = null;

    const handleResize = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const nextWidth = window.innerWidth;

        setWidth((current) =>
          current === nextWidth
            ? current
            : nextWidth
        );
      });
    };

    window.addEventListener(
      "resize",
      handleResize,
      { passive: true }
    );

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  return {
    width,
    isMobile: width < MOBILE_BREAKPOINT,
    isTablet:
      width >= MOBILE_BREAKPOINT &&
      width < DESKTOP_BREAKPOINT,
    isDesktop:
      width >= DESKTOP_BREAKPOINT,
  };
}