import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

const MAX_SUGGESTIONS = 8;

/**
 * Reusable autocomplete text input.
 *
 * Supports:
 * - Single-value selection
 * - Comma-separated multiple values
 * - Keyboard navigation
 * - Accessible combobox semantics
 */
function AutocompleteInput({
  value,
  onChange,
  options = [],
  placeholder = "",
  multiple = false,
  darkMode = false,
  className = "input-glow",
  emptyMessage = "No matching results",
}) {
  const wrapperRef = useRef(null);
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;

  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  /**
   * Returns the text currently being searched.
   * For multiple values, only the final comma-separated value is used.
   */
  const searchTerm = useMemo(() => {
    const normalizedValue = String(value ?? "");

    if (!multiple) {
      return normalizedValue.trim().toLowerCase();
    }

    const parts = normalizedValue.split(",");
    return parts.at(-1)?.trim().toLowerCase() ?? "";
  }, [multiple, value]);

  /**
   * Returns already selected values when multiple selection is enabled.
   */
  const selectedValues = useMemo(() => {
    if (!multiple) return new Set();

    return new Set(
      String(value ?? "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    );
  }, [multiple, value]);

  /**
   * Normalizes, filters, sorts, and limits available suggestions.
   */
  const visibleOptions = useMemo(() => {
    const uniqueOptions = Array.from(
      new Set(
        options
          .filter((option) => typeof option === "string")
          .map((option) => option.trim())
          .filter(Boolean)
      )
    );

    const availableOptions = multiple
      ? uniqueOptions.filter(
          (option) => !selectedValues.has(option.toLowerCase())
        )
      : uniqueOptions;

    const filtered = searchTerm
      ? availableOptions.filter((option) =>
          option.toLowerCase().includes(searchTerm)
        )
      : availableOptions;

    return filtered
      .sort((a, b) => {
        const normalizedA = a.toLowerCase();
        const normalizedB = b.toLowerCase();

        const aStartsWithSearch =
          searchTerm && normalizedA.startsWith(searchTerm);
        const bStartsWithSearch =
          searchTerm && normalizedB.startsWith(searchTerm);

        if (aStartsWithSearch && !bStartsWithSearch) return -1;
        if (!aStartsWithSearch && bStartsWithSearch) return 1;

        return a.localeCompare(b, undefined, {
          sensitivity: "base",
        });
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [multiple, options, searchTerm, selectedValues]);

  /**
   * Builds the final input value after selecting a suggestion.
   */
  const buildNewValue = useCallback(
    (option) => {
      if (!multiple) return option;

      const parts = String(value ?? "")
        .split(",")
        .map((part) => part.trim());

      if (parts.length === 0) {
        return `${option}, `;
      }

      parts[parts.length - 1] = option;

      return `${parts.filter(Boolean).join(", ")}, `;
    },
    [multiple, value]
  );

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSelectedIndex(-1);
  }, []);

  const selectOption = useCallback(
    (option) => {
      onChange(buildNewValue(option));
      closeDropdown();
    },
    [buildNewValue, closeDropdown, onChange]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();

        if (!open) {
          setOpen(true);
        }

        if (visibleOptions.length > 0) {
          setSelectedIndex((currentIndex) =>
            currentIndex < visibleOptions.length - 1
              ? currentIndex + 1
              : 0
          );
        }

        return;
      }

      if (event.key === "ArrowUp") {
        if (!open || visibleOptions.length === 0) return;

        event.preventDefault();

        setSelectedIndex((currentIndex) =>
          currentIndex > 0
            ? currentIndex - 1
            : visibleOptions.length - 1
        );

        return;
      }

      if (event.key === "Enter") {
        if (
          open &&
          selectedIndex >= 0 &&
          visibleOptions[selectedIndex]
        ) {
          event.preventDefault();
          selectOption(visibleOptions[selectedIndex]);
        }

        return;
      }

      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeDropdown();
      }
    },
    [
      closeDropdown,
      open,
      selectOption,
      selectedIndex,
      visibleOptions,
    ]
  );

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchTerm, options, multiple]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [closeDropdown]);

  const activeOptionId =
    selectedIndex >= 0
      ? `${listboxId}-option-${selectedIndex}`
      : undefined;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
      }}
    >
      <input
        id={inputId}
        className={className}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={`${placeholder || "Autocomplete"} suggestions`}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            width: "100%",
            minWidth: 0,
            maxHeight:
              "min(220px, calc(100dvh - 160px))",
            overflowX: "hidden",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",

            padding: "8px",
            boxSizing: "border-box",
            borderRadius: "18px",

            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",

            background: darkMode
              ? "rgba(18,22,32,.82)"
              : "rgba(255,255,255,.72)",

            border: darkMode
              ? "1px solid rgba(255,255,255,.08)"
              : "1px solid rgba(255,255,255,.45)",

            boxShadow: darkMode
              ? `
                  0 10px 40px rgba(0,0,0,.45),
                  0 0 18px rgba(0,255,204,.08)
                `
              : `
                  0 10px 35px rgba(0,0,0,.12),
                  0 0 15px rgba(0,190,159,.08)
                `,

            zIndex: 9999,
          }}
        >
          {visibleOptions.length === 0 ? (
            <div
              role="status"
              style={{
                padding: "14px",
                textAlign: "center",
                opacity: 0.7,
                fontSize: ".95rem",
              }}
            >
              {emptyMessage}
            </div>
          ) : (
            visibleOptions.map((option, index) => {
              const isSelected = selectedIndex === index;

              return (
                <div
                  id={`${listboxId}-option-${index}`}
                  key={`${option}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  title={option}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    selectOption(option);
                  }}
                  onPointerEnter={() =>
                    setSelectedIndex(index)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",

                    width: "100%",
                    minWidth: 0,
                    padding: "12px 16px",
                    boxSizing: "border-box",
                    borderRadius: "12px",

                    fontSize: ".95rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",

                    cursor: "pointer",
                    touchAction: "manipulation",

                    background: isSelected
                      ? "rgba(0,190,159,.18)"
                      : "transparent",

                    transform: isSelected
                      ? "translateX(4px)"
                      : "translateX(0)",

                    transition:
                      "background .2s ease, transform .15s ease",
                  }}
                >
                  {option}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default AutocompleteInput;