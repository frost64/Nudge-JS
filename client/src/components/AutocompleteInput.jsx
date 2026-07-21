import { useState, useRef, useEffect } from "react";

function AutocompleteInput({
  value,
  onChange,
  options = [],
  placeholder = "",
  multiple = false,
  darkMode = false,
  className = "input-glow",
  emptyMessage = "No matching results"
}) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const MAX_SUGGESTIONS = 8;

  // Get current search term
  const getSearchTerm = () => {
    if (!multiple) return value.trim();

    const parts = value.split(",");
    return parts[parts.length - 1].trim();
  };

  const getSelectedValues = () => {
  if (!multiple) return [];

  return value
    .split(",")
    .map(tag => tag.trim().toLowerCase())
    .filter(Boolean);
};

const sortOptions = (options, search) => {
  return [...options].sort((a, b) => {
    const aStarts = a.toLowerCase().startsWith(search);
    const bStarts = b.toLowerCase().startsWith(search);

    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    return a.localeCompare(b);
  });
};

const filterOptions = () => {
  const search = getSearchTerm().toLowerCase();

  const selected = getSelectedValues();

  // Show all options when input is empty
  if (!search) {
    return multiple
      ? options.filter(
          option => !selected.includes(option.toLowerCase())
        )
      : options;
  }

  let filtered = options.filter(option =>
    option.toLowerCase().includes(search)
  );

  filtered = sortOptions(filtered, search);

  if (multiple) {
    filtered = filtered.filter(
      option => !selected.includes(option.toLowerCase())
    );
  }

  return filtered;
};

const buildNewValue = (option) => {
  if (!multiple) return option;

  const parts = value
    .split(",")
    .map(part => part.trim());

  parts[parts.length - 1] = option;

  return `${parts.join(", ")}, `;
};


 const selectOption = (option) => {
  onChange(buildNewValue(option));
  setOpen(false);
};

  const handleKeyDown = (e) => {
    if (!open || filteredOptions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case "Enter":
        if (selectedIndex >= 0) {
          e.preventDefault();
          selectOption(filteredOptions[selectedIndex]);
        }
        break;

      case "Escape":
        setOpen(false);
        break;

      default:
        break;
    }
  };

  // Filter suggestions
  useEffect(() => {
  setFilteredOptions(filterOptions());
  setSelectedIndex(-1);
}, [value, options, multiple]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, []);


  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <input
        className={className}
        type="text"
        value={value}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            maxHeight: "220px",
            overflowY: "auto",

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
            padding: "8px",
          }}
        >
          {filteredOptions.length === 0 ? (
            <div
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
            filteredOptions.slice(0, MAX_SUGGESTIONS).map((option, index) => (
                <div
                key={option}
                onMouseDown={() => selectOption(option)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    cursor: "pointer",

                    display: "flex",
                    alignItems: "center",

                    transition:
                        "background .2s ease, transform .15s ease",

                    background:
                        selectedIndex === index
                        ? "rgba(0,190,159,.18)"
                        : "transparent",

                    transform:
                        selectedIndex === index
                        ? "translateX(4px)"
                        : "translateX(0)",
                    }}
                >
                {option}
                </div>
            ))
            )}
        </div>
      )}
    </div>
  );
}

export default AutocompleteInput;