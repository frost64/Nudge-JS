import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaBirthdayCake,
  FaChartPie,
  FaClock,
  FaCompass,
  FaLightbulb,
  FaLink,
  FaStickyNote,
  FaUserShield,
} from "react-icons/fa";
import {
  FiClock,
  FiFileText,
  FiGift,
  FiLink,
  FiSearch,
} from "react-icons/fi";
import {
  IoClose,
  IoMenu,
  IoMoonOutline,
  IoSunnyOutline,
} from "react-icons/io5";

import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar6 from "../assets/avatars/avatar6.png";
import defaultAvatar from "../assets/avatars/defaultAvatar.png";
import logo from "../assets/Logo.svg";

import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import highlightText from "../utils/highlightText";
import MobileDrawer from "./MobileDrawer";

const SEARCH_DEBOUNCE_DELAY = 300;

const AVATAR_MAP = {
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
};

const PRIMARY_NAVIGATION = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: FaChartPie,
  },
  {
    label: "Birthdays",
    path: "/birthdays",
    icon: FaBirthdayCake,
  },
  {
    label: "Reminders",
    path: "/reminders",
    icon: FaClock,
  },
  {
    label: "Notes",
    path: "/notes",
    icon: FaStickyNote,
  },
  {
    label: "Links",
    path: "/links",
    icon: FaLink,
  },
];

const SEARCH_TYPE_ICONS = {
  note: FiFileText,
  reminder: FiClock,
  birthday: FiGift,
  link: FiLink,
};

/**
 * Main responsive navigation bar.
 *
 * Provides desktop navigation, mobile drawer navigation,
 * global search suggestions, theme switching, and profile access.
 */
function Navbar({
  isMobile,
  isTablet,
  isDesktop,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const { user, setUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const searchRef = useRef(null);

  const [searchQuery, setSearchQuery] =
    useState("");
  const [suggestions, setSuggestions] =
    useState([]);
  const [showSuggestions, setShowSuggestions] =
    useState(false);
  const [highlightedIndex, setHighlightedIndex] =
    useState(-1);
  const [themeUpdating, setThemeUpdating] =
    useState(false);

  const darkMode = user?.theme === "dark";

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, [setMobileMenuOpen]);

  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  }, []);

  const linkStyle = useCallback(
    (path) => {
      const active = isActive(path);

      return {
        position: "relative",
        display: "block",

        width: "100%",
        padding: "10px 16px",
        boxSizing: "border-box",
        borderRadius: "15px",

        color: active
          ? darkMode
            ? "#ffffff"
            : "#000000"
          : darkMode
            ? "#d1d5db"
            : "#000000",

        background: active
          ? darkMode
            ? "linear-gradient(135deg, rgba(0,158,129,.20), rgba(6,126,169,.20))"
            : "linear-gradient(135deg, rgba(37,99,235,.20), rgba(6,182,212,.18))"
          : "transparent",

        border: active
          ? darkMode
            ? "1px solid rgba(255,255,255,.18)"
            : "1px solid rgba(0,180,255,.30)"
          : "1px solid rgba(0,180,255,.30)",

        boxShadow: active
          ? darkMode
            ? `
                inset 0 1px 5px rgba(255,255,255,.08),
                0 0 18px rgba(0,255,204,.35),
                0 0 40px rgba(0,140,255,.20)
              `
            : `
                inset 0 1px 5px rgba(255,255,255,.8),
                0 0 18px rgba(0,180,255,.30),
                0 0 35px rgba(0,255,200,.18)
              `
          : darkMode
            ? `
                inset 0 1px 3px rgba(255,255,255,.05),
                0 0 10px rgba(0,255,204,.15)
              `
            : `
                inset 0 1px 3px rgba(255,255,255,.45),
                0 0 10px rgba(0,180,255,.15)
              `,

        textDecoration: "none",
        fontWeight: 600,

        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",

        transition:
          "color .3s ease, background .3s ease, border-color .3s ease, box-shadow .3s ease",
      };
    },
    [darkMode, isActive]
  );

  const roleNavigation = useMemo(() => {
    if (user?.role === "admin") {
      return {
        label: "Admin",
        path: "/admin",
        icon: FaUserShield,
      };
    }

    if (user?.role === "user") {
      return {
        label: "Suggestions",
        path: "/suggestions",
        icon: FaLightbulb,
      };
    }

    return null;
  }, [user?.role]);

  const allNavigation = useMemo(
    () =>
      roleNavigation
        ? [...PRIMARY_NAVIGATION, roleNavigation]
        : PRIMARY_NAVIGATION,
    [roleNavigation]
  );

  const avatarSource = useMemo(() => {
    if (user?.avatar?.startsWith("/uploads/")) {
      const apiUrl =
        import.meta.env.VITE_API_URL || "";

      const baseUrl = apiUrl.replace(
        /\/api\/?$/,
        ""
      );

      return `${baseUrl}${user.avatar}`;
    }

    return (
      AVATAR_MAP[user?.avatar] ||
      defaultAvatar
    );
  }, [user?.avatar]);

  const handleSearch = useCallback(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) return;

    closeSuggestions();

    navigate(
      `/search?q=${encodeURIComponent(
        trimmedQuery
      )}`
    );
  }, [
    closeSuggestions,
    navigate,
    searchQuery,
  ]);

  const handleSuggestionSelect = useCallback(
    (item) => {
      const routeMap = {
        reminder: `/reminders?reminderId=${item.id}`,
        note: `/notes?noteId=${item.id}`,
        birthday: `/birthdays?birthdayId=${item.id}`,
        link: `/links?linkId=${item.id}`,
      };

      const destination = routeMap[item.type];

      if (!destination) return;

      navigate(destination);

      setSearchQuery("");
      setSuggestions([]);
      closeSuggestions();
    },
    [closeSuggestions, navigate]
  );

  const toggleTheme = useCallback(async () => {
    if (!user || themeUpdating) return;

    const newTheme = darkMode
      ? "light"
      : "dark";

    try {
      setThemeUpdating(true);

      const response = await api.put(
        "/auth/profile",
        {
          theme: newTheme,
          avatar: user.avatar,
          bio: user.bio,
        }
      );

      setUser(response.data);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Couldn't change theme."
      );
    } finally {
      setThemeUpdating(false);
    }
  }, [
    darkMode,
    setUser,
    themeUpdating,
    user,
  ]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return undefined;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(
      async () => {
        try {
          const response = await api.get(
            "/search/suggestions",
            {
              params: {
                q: trimmedQuery,
              },
              signal: controller.signal,
            }
          );

          const nextSuggestions =
            Array.isArray(response.data)
              ? response.data
              : [];

          setSuggestions(nextSuggestions);
          setShowSuggestions(
            nextSuggestions.length > 0
          );
        } catch (error) {
          if (
            error.name !== "CanceledError" &&
            error.code !== "ERR_CANCELED"
          ) {
            console.error(error);
          }
        }
      },
      SEARCH_DEBOUNCE_DELAY
    );

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        closeSuggestions();
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [closeSuggestions]);

  useEffect(() => {
    if (isDesktop) {
      closeMobileMenu();
    }
  }, [closeMobileMenu, isDesktop]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    closeSuggestions();
    closeMobileMenu();
  }, [
    closeMobileMenu,
    closeSuggestions,
    location.pathname,
  ]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();

        if (suggestions.length === 0) return;

        setShowSuggestions(true);

        setHighlightedIndex((current) =>
          current < suggestions.length - 1
            ? current + 1
            : 0
        );

        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        if (suggestions.length === 0) return;

        setShowSuggestions(true);

        setHighlightedIndex((current) =>
          current > 0
            ? current - 1
            : suggestions.length - 1
        );

        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        const selectedSuggestion =
          suggestions[highlightedIndex];

        if (
          showSuggestions &&
          selectedSuggestion
        ) {
          handleSuggestionSelect(
            selectedSuggestion
          );
        } else {
          handleSearch();
        }

        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeSuggestions();
      }
    },
    [
      closeSuggestions,
      handleSearch,
      handleSuggestionSelect,
      highlightedIndex,
      showSuggestions,
      suggestions,
    ]
  );

  const mobileNavigation = useMemo(
    () => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: isMobile
            ? "8px"
            : "12px",
        }}
      >
        <div
          style={{
            marginBottom: "20px",
            paddingBottom: "14px",

            borderBottom: darkMode
              ? "1px solid rgba(255,255,255,.08)"
              : "1px solid rgba(0,0,0,.08)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#067ea9",
            }}
          >
            Nudge
          </h2>

          <small
            style={{
              opacity: 0.7,
            }}
          >
            <FaCompass
              style={{
                marginRight: "6px",
              }}
            />
            Navigation
          </small>
        </div>

        {allNavigation.map(
          ({
            label,
            path,
            icon: Icon,
          }) => (
            <Link
              key={path}
              to={path}
              style={linkStyle(path)}
              onClick={closeMobileMenu}
            >
              <Icon
                style={{
                  marginRight: "6px",
                }}
              />
              {label}
            </Link>
          )
        )}

        <div
          aria-hidden="true"
          style={{
            height: "40px",
          }}
        />
      </div>
    ),
    [
      allNavigation,
      closeMobileMenu,
      darkMode,
      isMobile,
      linkStyle,
    ]
  );

  const suggestionList = useMemo(
    () =>
      suggestions.map((item, index) => {
        const selected =
          highlightedIndex === index;

        const SuggestionIcon =
          SEARCH_TYPE_ICONS[item.type] ||
          FiLink;

        return (
          <button
            id={`navbar-search-option-${index}`}
            key={`${item.type}-${item.id}`}
            type="button"
            role="option"
            aria-selected={selected}
            className="search-suggestion"
            onClick={() =>
              handleSuggestionSelect(item)
            }
            onPointerEnter={() =>
              setHighlightedIndex(index)
            }
            style={{
              display: "block",

              width: "100%",
              margin: 0,
              padding: "10px 14px",

              color: "inherit",
              textAlign: "left",

              border: "none",
              borderBottom:
                index !==
                suggestions.length - 1
                  ? "1px solid rgba(255,255,255,.08)"
                  : "none",

              background: selected
                ? darkMode
                  ? "linear-gradient(135deg, rgba(0,158,129,.20), rgba(6,126,169,.20))"
                  : "linear-gradient(135deg, rgba(64,0,255,.18), rgba(0,255,150,.18))"
                : "transparent",

              cursor: "pointer",

              transform: selected
                ? "translateX(3px)"
                : "translateX(0)",

              transition:
                "background .25s ease, transform .25s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                minWidth: 0,
                fontWeight: 700,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "22px",
                  flexShrink: 0,
                  textAlign: "center",
                  fontSize: "17px",
                }}
              >
                <SuggestionIcon size={16} />
              </span>

              <span
                style={{
                  minWidth: 0,
                  overflowWrap: "anywhere",
                }}
              >
                {highlightText(
                  item.label,
                  searchQuery
                )}
              </span>
            </div>

            <div
              style={{
                marginTop: "2px",
                paddingLeft: "28px",

                fontSize: "11px",
                opacity: 0.6,
                textTransform: "capitalize",
              }}
            >
              {item.type}
            </div>
          </button>
        );
      }),
    [
      darkMode,
      handleSuggestionSelect,
      highlightedIndex,
      searchQuery,
      suggestions,
    ]
  );

  const activeSuggestionId =
    highlightedIndex >= 0
      ? `navbar-search-option-${highlightedIndex}`
      : undefined;

  return (
    <nav
      className="nav-style"
      aria-label="Primary navigation"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile
          ? "flex-start"
          : "space-between",
        flexWrap: "nowrap",

        gap: isMobile
          ? "6px"
          : isTablet
            ? "12px"
            : "20px",

        padding: isMobile
          ? "8px 12px"
          : isTablet
            ? "10px 16px"
            : "14px 20px",

        minWidth: 0,
        boxSizing: "border-box",

        borderRadius: "50px",

        background: darkMode
          ? "rgba(17,24,39,.40)"
          : "rgba(255,255,255,.18)",

        backgroundImage: darkMode
          ? "linear-gradient(160deg, rgba(255,255,255,.12), rgba(255,255,255,.03) 35%, transparent)"
          : "linear-gradient(160deg, rgba(255,255,255,.45), rgba(255,255,255,.08) 35%, transparent)",

        borderBottom: darkMode
          ? "1px solid rgba(255,255,255,.10)"
          : "1px solid rgba(255,255,255,.25)",

        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",

        boxShadow: darkMode
          ? `
              inset 0 1px 4px rgba(0,255,136,.65),
              0 0 20px rgba(0,255,204,.12),
              0 10px 30px rgba(0,0,0,.35)
            `
          : `
              inset 0 1px 4px rgba(0,133,113,.65),
              0 0 16px rgba(0,180,255,.10),
              0 8px 25px rgba(0,0,0,.12)
            `,

        transition: "background .25s ease",
      }}
    >
      {!isDesktop && (
        <button
          type="button"
          aria-label={
            mobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileMenuOpen}
          onClick={() =>
            setMobileMenuOpen(
              (current) => !current
            )
          }
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            width: "42px",
            height: "42px",
            flexShrink: 0,

            margin: 0,
            padding: 0,

            color: darkMode
              ? "#ffffff"
              : "#111827",

            background: "transparent",
            border: "none",
            borderRadius: "10px",

            fontSize: "30px",
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          {mobileMenuOpen ? (
            <IoClose size={28} />
          ) : (
            <IoMenu size={28} />
          )}
        </button>
      )}

      <Link
        className="icon-zoom logo"
        to="/dashboard"
        aria-label="Nudge dashboard"
        style={{
          flexShrink: 0,
          textDecoration: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",

            gap: isMobile
              ? "8px"
              : "12px",
          }}
        >
          <img
            src={logo}
            alt=""
            style={{
              width: isMobile
                ? "42px"
                : "48px",

              height: isMobile
                ? "42px"
                : "48px",

              objectFit: "contain",
            }}
          />

          {!isMobile && (
            <div>
              <div
                style={{
                  fontSize: isTablet
                    ? "21px"
                    : "24px",

                  fontWeight: 700,
                  color: "#067ea9",
                }}
              >
                Nudge
              </div>

              <div
                style={{
                  fontSize: "12px",

                  color: darkMode
                    ? "#9ca3af"
                    : "#6b7280",
                }}
              >
                Remember Everything
              </div>
            </div>
          )}
        </div>
      </Link>

      <div
        style={{
          display: isDesktop
            ? "flex"
            : "none",

          alignItems: "center",
          justifyContent: "center",

          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,

          minWidth: 0,
          gap: "10px",
        }}
      >
        {allNavigation.map(
          ({
            label,
            path,
            icon: Icon,
          }) => (
            <Link
              key={path}
              className="glow-top"
              to={path}
              aria-current={
                isActive(path)
                  ? "page"
                  : undefined
              }
            >
              <Icon
                style={{
                  marginRight:
                    label === "Suggestions"
                      ? 0
                      : "10px",
                }}
              />

              {label === "Suggestions"
                ? null
                : label}
            </Link>
          )
        )}
      </div>

      <div
        ref={searchRef}
        style={{
          position: "relative",
          zIndex: 2000,

          width: isMobile
            ? "auto"
            : isTablet
              ? "210px"
              : "250px",

          minWidth: isMobile
            ? 0
            : isTablet
              ? "210px"
              : "250px",

          flexGrow: isMobile
            ? 1
            : 0,

          flexShrink: 1,

          flexBasis: isMobile
            ? 0
            : isTablet
              ? "210px"
              : "250px",
        }}
      >
        <button
          type="button"
          aria-label="Submit search"
          onClick={handleSearch}
          style={{
            position: "absolute",
            top: "50%",
            left: "5px",
            zIndex: 2,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            width: "32px",
            height: "32px",

            margin: 0,
            padding: 0,

            color: darkMode
              ? "#9ca3af"
              : "#6b7280",

            background: "transparent",
            border: "none",
            borderRadius: "8px",

            cursor: "pointer",
            transform: "translateY(-50%)",
          }}
        >
          <FiSearch />
        </button>

        <input
          className="input-glow"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={
            showSuggestions &&
            suggestions.length > 0
          }
          aria-controls="navbar-search-listbox"
          aria-activedescendant={
            activeSuggestionId
          }
          autoComplete="off"
          placeholder="Search..."
          value={searchQuery}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          onKeyDown={handleSearchKeyDown}
          style={{
            width: "100%",
            minWidth: 0,

            padding: isMobile
              ? "11px 10px 11px 36px"
              : "10px 12px 10px 38px",

            color: darkMode
              ? "#f9fafb"
              : "#111827",

            background: darkMode
              ? "rgba(255,255,255,.06)"
              : "rgba(255,255,255,.18)",

            border: darkMode
              ? "1px solid #4b5563"
              : "1px solid #d1d5db",

            borderRadius: "10px",
            outline: "none",
          }}
        />

        {showSuggestions &&
          suggestions.length > 0 && (
            <div
              id="navbar-search-listbox"
              role="listbox"
              aria-label="Search suggestions"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                zIndex: 3000,

                width: "100%",
                minWidth: isMobile
                  ? "220px"
                  : "100%",

                maxHeight:
                  "min(300px, calc(100dvh - 150px))",

                overflowX: "hidden",
                overflowY: "auto",
                overscrollBehavior: "contain",

                background: darkMode
                  ? "rgba(17,24,39,.88)"
                  : "rgba(255,255,255,.92)",

                backgroundImage: darkMode
                  ? "linear-gradient(160deg, rgba(255,255,255,.08), transparent)"
                  : "linear-gradient(160deg, rgba(255,255,255,.45), transparent)",

                backdropFilter: "blur(18px)",
                WebkitBackdropFilter:
                  "blur(18px)",

                border: darkMode
                  ? "1px solid rgba(255,255,255,.10)"
                  : "1px solid rgba(255,255,255,.45)",

                borderRadius: "14px",

                boxShadow: darkMode
                  ? `
                      inset 0 1px 3px rgba(255,255,255,.05),
                      0 10px 30px rgba(0,0,0,.45)
                    `
                  : `
                      inset 0 1px 3px rgba(255,255,255,.6),
                      0 10px 25px rgba(0,0,0,.12)
                    `,
              }}
            >
              {suggestionList}
            </div>
          )}
      </div>

      <button
        type="button"
        className="theme-toggle"
        aria-label={
          darkMode
            ? "Switch to light theme"
            : "Switch to dark theme"
        }
        disabled={themeUpdating}
        onClick={toggleTheme}
        style={{
          width: "42px",
          height: "42px",
          flexShrink: 0,

          margin: isMobile
            ? "0 4px"
            : "8px",

          color: darkMode
            ? "#ffffff"
            : "#111827",
        }}
      >
        {darkMode ? (
          <IoSunnyOutline size={22} />
        ) : (
          <IoMoonOutline size={22} />
        )}
      </button>

      <Link
        className="icon-zoom logo"
        to="/profile"
        aria-label="Open profile"
        aria-current={
          isActive("/profile")
            ? "page"
            : undefined
        }
        style={{
          flexShrink: 0,
          margin: 0,
          textDecoration: "none",
        }}
      >
        <img
          src={avatarSource}
          alt=""
          style={{
            width: isMobile
              ? "42px"
              : "50px",

            height: isMobile
              ? "42px"
              : "50px",

            objectFit: "cover",
            borderRadius: "50%",

            border: isActive("/profile")
              ? "3px solid #2563eb"
              : darkMode
                ? "3px solid #4b5563"
                : "3px solid #d1d5db",

            cursor: "pointer",
            transition:
              "border-color .2s ease",
          }}
        />
      </Link>

      <MobileDrawer
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        darkMode={darkMode}
      >
        {mobileNavigation}
      </MobileDrawer>
    </nav>
  );
}

export default Navbar;