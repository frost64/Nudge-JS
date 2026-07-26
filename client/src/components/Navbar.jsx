import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import api from "../services/api";
import logo from "../assets/Logo.svg";
import toast from "react-hot-toast";
import highlightText from "../utils/highlightText";
import MobileDrawer from "./MobileDrawer";


import {
  FiFileText,
  FiClock,
  FiGift,
  FiLink,
} from "react-icons/fi";

import {
  IoSunnyOutline,
  IoMoonOutline,
} from "react-icons/io5";

import defaultAvatar from "../assets/avatars/defaultAvatar.png";
import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar6 from "../assets/avatars/avatar6.png";

const avatarMap = {avatar1, avatar2, avatar3, avatar4, avatar5, avatar6};
function Navbar({
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {

  const { user, setUser, } = useContext(AuthContext);
  const darkMode = user?.theme === "dark";
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const linkStyle = useCallback(
  (path) => ({
    padding: "10px 16px",
    borderRadius: "15px",
    textDecoration: "none",
    fontWeight: "600",
    position: "relative",
    color: isActive(path)
      ? darkMode
        ? "#ffffff"
        : "#000000"
      : darkMode
        ? "#d1d5db"
        : "#000000",

    background: isActive(path)
      ? darkMode
        ? "linear-gradient(135deg, rgba(0,158,129,.20), rgba(6,126,169,.20))"
        : "linear-gradient(135deg, rgba(37, 99, 235, 0.20), rgba(6, 182, 212, 0.18))"
      : "transparent",

    border: isActive(path)
      ? darkMode
        ? "1px solid rgba(255,255,255,.18)"
        : "1px solid rgba(0,180,255,.30)"
      : "1px solid rgba(0,180,255,.30)",

    boxShadow: isActive(path)
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

    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",

    transition: "all .3s ease",
  }),
  [location.pathname, darkMode]
);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }, [searchQuery, navigate]);

  const toggleTheme = async () => {

  const newTheme =
    darkMode ? "light" : "dark";

  try {

    const res = await api.put(
      "/auth/profile",
      {
        theme: newTheme,
        avatar: user.avatar,
        bio: user.bio,
      }
    );

    setUser(res.data);

    localStorage.setItem(
      "user",
      JSON.stringify(res.data)
    );

  } catch (error) {

    console.log(error);

    toast.error(
      error.response?.data?.message ||
      "Couldn't change theme."
    );

  }

};


  useEffect(() => {
    const timeout = setTimeout(
      async () => {
        if(searchQuery.trim().length < 2){
          setSuggestions([]);
          return;
        }
        try {
          const res = await api.get(`/search/suggestions?q=${searchQuery}`);
          setSuggestions(res.data);
          setShowSuggestions(true);
        }
        catch (error){
          console.log(error);
        }
      },
      300
    );
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)){
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
  if (!isMobile) {
    setMobileMenuOpen(false);
  }
}, [isMobile, setMobileMenuOpen]);

useEffect(() => {
  document.body.style.overflow =
    mobileMenuOpen ? "hidden" : "";

  return () => {
    document.body.style.overflow = "";
  };
}, [mobileMenuOpen]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  const handleSuggestionSelect = useCallback((item) => {
  if (item.type === "reminder") {
    navigate(`/reminders?reminderId=${item.id}`);
  } else if (item.type === "note") {
    navigate(`/notes?noteId=${item.id}`);
  } else if (item.type === "birthday") {
    navigate(`/birthdays?birthdayId=${item.id}`);
  } else if (item.type === "link") {
    navigate(`/links?linkId=${item.id}`);
  }

  setShowSuggestions(false);
  setSearchQuery("");
  setHighlightedIndex(-1);
}, [navigate]);

const mobileNavigation = (
  
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px",
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
          opacity: .7,
        }}
      >
        Navigation
      </small>
    </div>


    <Link
      to="/dashboard"
      style={{
        ...linkStyle("/dashboard"),
        display: "block",
        width: "100%",
        boxSizing: "border-box",
      }}
      onClick={() => setMobileMenuOpen(false)}
    >
      Dashboard
    </Link>

    <Link
      to="/birthdays"
      style={{
        ...linkStyle("/birthdays"),
        display: "block",
        width: "100%",
        boxSizing: "border-box",
      }}
      onClick={() => setMobileMenuOpen(false)}
    >
      Birthdays
    </Link>

    <Link
      to="/reminders"
      style={{
        ...linkStyle("/reminders"),
        display: "block",
        width: "100%",
        boxSizing: "border-box",
      }}
      onClick={() => setMobileMenuOpen(false)}
    >
      Reminders
    </Link>

    <Link
      to="/notes"
      style={{
        ...linkStyle("/notes"),
        display: "block",
        width: "100%",
        boxSizing: "border-box",
      }}
      onClick={() => setMobileMenuOpen(false)}
    >
      Notes
    </Link>

    <Link
      to="/links"
      style={{
        ...linkStyle("/links"),
        display: "block",
        width: "100%",
        boxSizing: "border-box",
      }}
      onClick={() => setMobileMenuOpen(false)}
    >
      Links
    </Link>

    {user?.role === "admin" && (
      <Link
        to="/admin"
        style={{
          ...linkStyle("/admin"),
          display: "block",
          width: "100%",
          boxSizing: "border-box",
        }}
        onClick={() => setMobileMenuOpen(false)}
      >
        Admin
      </Link>
    )}
    <div style={{ height: 40 }} />
  </div>
);

const suggestionList = useMemo(() => {
  return suggestions.map((item, index) => {
    const selected = highlightedIndex === index;
    return (
      <div
        key={`${item.type}-${item.id}`}
        onClick={() => handleSuggestionSelect(item)}
        onMouseEnter={() => setHighlightedIndex(index)}
        className="search-suggestion"
        style={{
          padding: "10px 14px",
          cursor: "pointer",
          transition: "all .25s ease",
          borderBottom:
            index !== suggestions.length - 1
              ? "1px solid rgba(255,255,255,.08)"
              : "none",

          background: selected
            ? darkMode
              ? "linear-gradient(135deg, rgba(0,158,129,.20), rgba(6,126,169,.20))"
              : "linear-gradient(135deg, rgba(64,0,255,.18), rgba(0,255,150,.18))"
            : "transparent",

          transform: selected
            ? "translateX(3px)"
            : "translateX(0)",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: "22px",
              textAlign: "center",
              fontSize: "17px",
              flexShrink: 0,
            }}
          >
            {item.type === "note" ? (
              <FiFileText size={16} />
            ) : item.type === "reminder" ? (
              <FiClock size={16} />
            ) : item.type === "birthday" ? (
              <FiGift size={16} />
            ) : (
              <FiLink size={16} />
            )}
          </span>

          {highlightText(item.label, searchQuery)}
        </div>

        <div
          style={{
            fontSize: "11px",
            marginTop: "2px",
            paddingLeft: "28px",
            opacity: 0.6,
            textTransform: "capitalize",
          }}
        >
          {item.type}
        </div>
      </div>
    );
  });
}, [
  suggestions,
  highlightedIndex,
  darkMode,
  handleSuggestionSelect,
  searchQuery,
]);
  return (
    <nav
      className = "nav-style"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile
          ? "flex-start"
          : "space-between",
        gap: isMobile ? "6px" : "20px",
        flexWrap: "nowrap",
        
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
              inset 0 1px 4px rgba(0, 255, 136, 0.65),
              0 0 20px rgba(0,255,204,.12),
              0 10px 30px rgba(0,0,0,.35)
            `
          : `
              inset 0 1px 4px rgba(0, 133, 113, 0.65),
              0 0 16px rgba(0,180,255,.10),
              0 8px 25px rgba(0,0,0,.12)
            `,

        transition: "background .25s ease",
      }}
    >
      

      {isMobile && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                width: "42px",
                height: "42px",

                flexShrink: 0,

                margin: 0,
                padding: 0,

                background: "transparent",
                border: "none",

                borderRadius: "10px",

                fontSize: "30px",
                lineHeight: 1,

                cursor: "pointer",

                color: darkMode ? "#fff" : "#111",
              }}
            >
              {mobileMenuOpen ? (
                <IoClose size={28} />
              ) : (
                <IoMenu size={28} />
              )}
            </button>
          )}
      {/* Logo */}

      <Link 
        className="icon-zoom logo"
        to="/dashboard"
        style={{
          textDecoration: "none",
          flexShrink: 0
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <img
            src={logo}
            alt="Nudge Logo"
            style={{
              width: isMobile ? "42px" : "48px",
              height: isMobile ? "42px" : "48px",
              objectFit: "contain"
            }}
          />
        {!isMobile && (
          <div>
            <div 
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#067ea9"
              }}
            >
              Nudge
            </div>

            <div
              style={{
                fontSize: "12px",
                color: darkMode ? "#9ca3af" : "#6b7280"
              }}
            >
              Remember Everything
            </div>
          </div>
          )}


        </div>
      </Link>

      

      {/* Navigation Links */}

      <div
        style={{
          display: isMobile ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          flex: 1,
          scrollbarWidth: "none"
        }}
      >
        
        <Link
          className="icon-zoom"
          to="/dashboard"
          style={linkStyle("/dashboard")}
        >
          Dashboard
        </Link>

        <Link 
          className="icon-zoom"
          to="/birthdays"
          style={linkStyle("/birthdays")}
        >
          Birthdays
        </Link>

        <Link 
          className="icon-zoom"
          to="/reminders"
          style={linkStyle("/reminders")}
        >
          Reminders
        </Link>

        <Link 
          className="icon-zoom"
          to="/notes"
          style={linkStyle("/notes")}
        >
          Notes
        </Link>

        <Link 
          className="icon-zoom"
          to="/links"
          style={linkStyle("/links")}
        >
          Links
        </Link>


        {user?.role === "admin" && (
          <Link 
            className="icon-zoom"
            to="/admin"
            style={linkStyle("/admin")}
          >
            Admin
          </Link>
        )}
      </div>
      
      <div
        ref={searchRef}
        style={{
          position: "relative",
          width: isMobile ? "100%" : "250px",
          minWidth: isMobile ? 0 : "250px",
          flexGrow: isMobile ? 1 : 0,
          flexShrink: 1,
          flexBasis: isMobile ? 0 : "250px",
          zIndex: 2000,
        }}
      >
        <FiSearch
          onClick={handleSearch}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: darkMode
              ? "#9ca3af"
              : "#6b7280",
            cursor: "pointer",
            zIndex: 2,
            pointerEvents: "auto"
          }}
        />
        
        <input
          className = "input-glow"
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          
          onChange={(e) =>
            setSearchQuery(
              e.target.value
            )
          }
          onKeyDown={(e) => {
            if (
              e.key === "ArrowDown"
            ) {
              e.preventDefault();

              setHighlightedIndex(
                (prev) =>
                  prev <
                  suggestions.length - 1
                    ? prev + 1
                    : prev
              );
            }
            else if (
              e.key === "ArrowUp"
            ) {
              e.preventDefault();
              setHighlightedIndex(
                (prev) =>
                  prev > 0
                    ? prev - 1
                    : prev
              );
            }
            else if (
              e.key === "Enter"
            ) {
              if (
                highlightedIndex >= 0 &&
                suggestions[
                  highlightedIndex
                ]
              ) {

                handleSuggestionSelect(
                  suggestions[
                    highlightedIndex
                  ]
                );
              } else {
                handleSearch();
              }
            }
          }}
          style={{
            width: "100%",
            padding: isMobile
              ? "11px 10px 11px 36px"
              : "10px 12px 10px 38px",
            borderRadius: "10px",
            border: darkMode
              ? "1px solid #4b5563"
              : "1px solid #d1d5db",
            background:
              darkMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,255,255,0.18)",
            color:
              darkMode
                ? "#f9fafb"
                : "#111827",
            outline: "none"
          }}
        />
        {
    showSuggestions &&
    suggestions.length > 0 && (

      <div
        style={{
          position: "absolute",
          top: "60px",
          left: 0,
          width: "100%",
          zIndex: 3000,
          maxHeight: "300px",
          overflowX: "hidden",
          overflowY: "auto",

          background: darkMode
            ? "rgba(17,24,39,.55)"
            : "rgba(255,255,255,.25)",

          backgroundImage: darkMode
            ? "linear-gradient(160deg, rgba(255,255,255,.08), transparent)"
            : "linear-gradient(160deg, rgba(255,255,255,.45), transparent)",

          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",

          border: darkMode
            ? "1px solid rgba(255,255,255,.10)"
            : "1px solid rgba(255,255,255,.45)",

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

      )
    }
      </div>


      <button
        className="theme-toggle"
        style={{
            margin: "8px",
            flexShrink: 0,
            color: darkMode ? "#fff" : "#111827",
        }}
        onClick={toggleTheme}
      >
        {darkMode ? (
          <IoSunnyOutline size={22} />
        ) : (
          <IoMoonOutline size={22} />
        )}
      </button>

      {/* Profile Avatar */}

      <Link
        className="icon-zoom logo"
        to="/profile"
        style={{
          textDecoration: "none",
          flexShrink: 0,
          margin: "auto",
        }}
      >
        <img
          src={
            user?.avatar?.startsWith("/uploads/")
              ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${user.avatar}`
              : avatarMap[user?.avatar] || defaultAvatar
          }
          alt="Profile"
          style={{
            width: isMobile ? "42px" : "50px",
            height: isMobile ? "42px" : "50px",
            borderRadius: "50%",
            objectFit: "cover",
            border:
              isActive("/profile")
                ? "3px solid #2563eb"
                : darkMode
                  ? "3px solid #4b5563"
                  : "3px solid #d1d5db",
            cursor: "pointer",
            transition: "0.2s"
          }}
        />
      </Link>
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        darkMode={darkMode}
      >
        {mobileNavigation}
      </MobileDrawer>
    </nav>
  );
}

export default Navbar;