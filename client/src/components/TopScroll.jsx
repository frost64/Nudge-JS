import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { IoChevronUp } from "react-icons/io5";

const VISIBILITY_OFFSET = 220;

/**
 * Displays a floating button after the user scrolls
 * beyond the configured vertical offset.
 */
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow =
        window.scrollY > VISIBILITY_OFFSET;

      setVisible((current) =>
        current === shouldShow
          ? current
          : shouldShow
      );
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scroll-top-btn"
      aria-label="Scroll to top"
      title="Scroll to top"
      onClick={scrollToTop}
    >
      <IoChevronUp
        aria-hidden="true"
        size={24}
      />
    </button>
  );
}

export default ScrollToTopButton;