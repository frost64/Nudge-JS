import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import api from "../services/api";
import logo from "../assets/Logo.svg";

import defaultAvatar from "../assets/avatars/defaultAvatar.png";
import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar6 from "../assets/avatars/avatar6.png";
import avatar7 from "../assets/avatars/avatar7.png";

const avatarMap = {avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7};
function Navbar() {
  const { user } = useContext(AuthContext);
  const darkMode = user?.theme === "dark";
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const linkStyle = useCallback(
  (path) => ({
    padding: "8px 14px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    color: isActive(path)
      ? "#ffffff"
      : darkMode
      ? "#d1d5db"
      : "#374151",
    backgroundColor: isActive(path)
      ? "#067ea9"
      : "transparent",
    transition: "0.15s",
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

const suggestionList = useMemo(() => {
  return suggestions.map((item, index) => (
    <div
      key={`${item.type}-${item.id}`}
      onClick={() => handleSuggestionSelect(item)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor =
          darkMode ? "#4b5563" : "#f3f4f6";
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.transform = "translateX(0)";
      }}
      style={{
        padding: "12px 16px",
        cursor: "pointer",
        transition: "background .12s ease, transform .12s ease",
      }}
    >
      <strong>
        {item.type === "note"
          ? "📝 "
          : item.type === "reminder"
          ? "⏰ "
          : item.type === "birthday"
          ? "🎂 "
          : "🔗 "}
        {item.label}
      </strong>

      <div
        style={{
          fontSize: "12px",
          opacity: .7,
          marginTop: "4px",
          textTransform: "capitalize",
        }}
      >
        {item.type}
      </div>
    </div>
  ));
}, [
  suggestions,
  highlightedIndex,
  darkMode,
  handleSuggestionSelect,
]);
  return (
    <nav
      className = "nav-style"
      style={{
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
              0 0 20px rgba(0,255,204,.12),
              0 10px 30px rgba(0,0,0,.35)
            `
          : `
              0 0 16px rgba(0,180,255,.10),
              0 8px 25px rgba(0,0,0,.12)
            `,

        transition: "background .25s ease",
      }}
    >
      
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
              width: "48px",
              height: "48px",
              objectFit: "contain"
            }}
          />

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
        </div>
      </Link>

      {/* Navigation Links */}

      <div 
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          flex: 1,
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none"
        }}
      >
        
        <Link
          className={isActive("/dashboard") ? "active-link" : "icon-zoom"}
          to="/dashboard"
          style={linkStyle("/dashboard")}
        >
          Dashboard
        </Link>

        <Link 
          className={isActive("/birthdays") ? "active-link" : "icon-zoom"}
          to="/birthdays"
          style={linkStyle("/birthdays")}
        >
          Birthdays
        </Link>

        <Link 
          className={isActive("/reminders") ? "active-link" : "icon-zoom"}
          to="/reminders"
          style={linkStyle("/reminders")}
        >
          Reminders
        </Link>

        <Link 
          className={isActive("/notes") ? "active-link" : "icon-zoom"}
          to="/notes"
          style={linkStyle("/notes")}
        >
          Notes
        </Link>

        <Link 
          className={isActive("/links") ? "active-link" : "icon-zoom"}
          to="/links"
          style={linkStyle("/links")}
        >
          Links
        </Link>


        {user?.role === "admin" && (
          <Link 
            className={isActive("/admin") ? "active-link" : "icon-zoom"}
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
          width: "250px",
          minWidth: "250px",
          flexShrink: 0,
          zIndex: 2000
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
            padding:
              "10px 12px 10px 38px",
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

          backgroundColor:
            darkMode
              ? "#374151"
              : "#ffffff",
          border: darkMode
            ? "1px solid #4b5563"
            : "1px solid #d1d5db",
          borderRadius: "10px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.15)"
        }}
      >
            {suggestionList}
        </div>

      )
    }
      </div>
      {/* Profile Avatar */}

      <Link
        className="icon-zoom"
        to="/profile"
        style={{
          textDecoration: "none",
          flexShrink: 0
        }}
      >
        <img
          src={
            avatarMap[
              user?.avatar
            ] || defaultAvatar
          }
          alt="Profile"
          style={{
            width: "50px",
            height: "50px",
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

    </nav>
  );
}

export default Navbar;