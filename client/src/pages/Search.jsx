import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaBell,
  FaBirthdayCake,
  FaLink,
  FaList,
  FaSearch,
  FaStickyNote,
} from "react-icons/fa";

import searchDarkBg from "../assets/backgrounds/dashboard-dark.png";
import searchLightBg from "../assets/backgrounds/dashboard-light.png";

import Card from "../components/Card";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";

import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";
import highlightText from "../utils/highlightText";

const EMPTY_RESULTS = {
  reminders: [],
  notes: [],
  birthdays: [],
  links: [],
};

const SEARCH_CATEGORIES = [
  {
    id: "all",
    label: "All Results",
    icon: FaList,
  },
  {
    id: "notes",
    label: "Notes",
    icon: FaStickyNote,
  },
  {
    id: "reminders",
    label: "Reminders",
    icon: FaBell,
  },
  {
    id: "birthdays",
    label: "Birthdays",
    icon: FaBirthdayCake,
  },
  {
    id: "links",
    label: "Links",
    icon: FaLink,
  },
];

const RESULT_SECTIONS = [
  {
    id: "reminders",
    title: "Reminders",
    icon: FaBell,
    route: "/reminders",
    emptyMessage: "No reminders found",
  },
  {
    id: "notes",
    title: "Notes",
    icon: FaStickyNote,
    route: "/notes",
    emptyMessage: "No notes found",
  },
  {
    id: "birthdays",
    title: "Birthdays",
    icon: FaBirthdayCake,
    route: "/birthdays",
    emptyMessage: "No birthdays found",
  },
  {
    id: "links",
    title: "Links",
    icon: FaLink,
    route: "/links",
    emptyMessage: "No links found",
  },
];

/**
 * Ensures every expected search-result collection is an array.
 */
function normalizeResults(data) {
  return {
    reminders: Array.isArray(data?.reminders)
      ? data.reminders
      : [],

    notes: Array.isArray(data?.notes)
      ? data.notes
      : [],

    birthdays: Array.isArray(data?.birthdays)
      ? data.birthdays
      : [],

    links: Array.isArray(data?.links)
      ? data.links
      : [],
  };
}

/**
 * Returns the destination route for a selected result.
 */
function getResultDestination(type, itemId) {
  const routeMap = {
    reminders: `/reminders?reminderId=${itemId}`,
    notes: `/notes?noteId=${itemId}`,
    birthdays: `/birthdays?birthdayId=${itemId}`,
    links: `/links?linkId=${itemId}`,
  };

  return routeMap[type] || "/";
}

/**
 * Displays global search results across the Nudge modules.
 */
function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useContext(AuthContext);
  const { isMobile, isTablet } = useBreakpoint();

  const [loading, setLoading] =
    useState(false);

  const [results, setResults] =
    useState(null);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("all");

  const darkMode =
    user?.theme === "dark";

  const backgroundImage = darkMode
    ? searchDarkBg
    : searchLightBg;

  const query = useMemo(() => {
    const searchParams =
      new URLSearchParams(location.search);

    return (
      searchParams.get("q") || ""
    ).trim();
  }, [location.search]);

  const resultCounts = useMemo(() => {
    const currentResults =
      results || EMPTY_RESULTS;

    return {
      notes:
        currentResults.notes.length,

      reminders:
        currentResults.reminders.length,

      birthdays:
        currentResults.birthdays.length,

      links:
        currentResults.links.length,
    };
  }, [results]);

  const totalResults = useMemo(
    () =>
      resultCounts.notes +
      resultCounts.reminders +
      resultCounts.birthdays +
      resultCounts.links,
    [resultCounts]
  );

  const noResults =
    Boolean(results) &&
    totalResults === 0;

  /**
   * Navigates to a module or specific result.
   */
  const navigateTo = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  useEffect(() => {
    if (!query) {
      setResults(null);
      setSelectedCategory("all");
      setLoading(false);

      return undefined;
    }

    const controller =
      new AbortController();

    const fetchSearchResults =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.get("/search", {
              params: {
                q: query,
              },
              signal:
                controller.signal,
            });

          setResults(
            normalizeResults(
              response.data
            )
          );

          setSelectedCategory("all");
        } catch (error) {
          if (
            error.name ===
              "CanceledError" ||
            error.code ===
              "ERR_CANCELED"
          ) {
            return;
          }

          console.error(error);

          setResults(
            normalizeResults(null)
          );

          toast.error(
            error.response?.data
              ?.message ||
              "Search failed."
          );
        } finally {
          if (
            !controller.signal.aborted
          ) {
            setLoading(false);
          }
        }
      };

    fetchSearchResults();

    return () => {
      controller.abort();
    };
  }, [query]);

  const sidebar = useMemo(
    () => (
      <Card
        variant="glass"
        style={{
          width: "100%",
          minWidth: 0,
          margin: 0,

          padding: isTablet
            ? "20px"
            : "24px",

          borderRadius: "22px",
        }}
      >
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",

            gap: "8px",

            marginTop: 0,
            marginBottom: "18px",

            fontSize: isTablet
              ? "1.7rem"
              : "2rem",

            textAlign: "center",
          }}
        >
          <FaSearch
            aria-hidden="true"
          />
          Search By
        </h1>

        {!query ? (
          <p
            style={{
              margin: 0,
              textAlign: "center",
              opacity: 0.75,
            }}
          >
            Start typing in the search
            bar.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {SEARCH_CATEGORIES.map(
              ({
                id,
                label,
                icon: Icon,
              }) => {
                const active =
                  selectedCategory ===
                  id;

                const count =
                  id === "all"
                    ? totalResults
                    : resultCounts[id];

                return (
                  <button
                    key={id}
                    type="button"
                    className="glow-top left"
                    aria-pressed={active}
                    onClick={() =>
                      setSelectedCategory(
                        id
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",

                      width: "100%",
                      margin: 0,
                      padding: "12px 16px",

                      textAlign: "left",

                      borderRadius: "10px",

                      transform: active
                        ? "translateX(5px)"
                        : undefined,

                      boxShadow: active
                        ? darkMode
                          ? "0 0 18px rgba(0,255,204,.30)"
                          : "0 0 18px rgba(0,180,255,.25)"
                        : undefined,
                    }}
                  >
                    <Icon
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        marginRight: "8px",
                      }}
                    />

                    <span
                      style={{
                        flexGrow: 1,
                        minWidth: 0,
                      }}
                    >
                      {label}
                    </span>

                    <span
                      style={{
                        flexShrink: 0,
                        marginLeft: "8px",
                        opacity: 0.7,
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        )}
      </Card>
    ),
    [
      darkMode,
      isTablet,
      query,
      resultCounts,
      selectedCategory,
      totalResults,
    ]
  );

  return (
    <Layout
      sidebar={sidebar}
      backgroundImage={backgroundImage}
      cardVariant="glass"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",

          width: "100%",
          minWidth: 0,

          gap: isMobile
            ? "20px"
            : "28px",

          padding: isMobile
            ? "0 0 24px"
            : "10px 10px 40px",

          boxSizing: "border-box",
        }}
      >
        {!query && (
          <Card
            variant="glass"
            style={{
              margin: 0,
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              Search
            </h2>

            <p
              style={{
                marginBottom: 0,
                lineHeight: 1.7,
              }}
            >
              Start typing in the search
              bar to search notes,
              reminders, birthdays, and
              links.
            </p>
          </Card>
        )}

        {query && (
          <header
            style={{
              marginBottom: isMobile
                ? "4px"
                : "8px",
            }}
          >
            <h1
              style={{
                marginTop: 0,
                marginBottom: "8px",

                fontSize: isMobile
                  ? "1.8rem"
                  : isTablet
                    ? "2.1rem"
                    : "2.4rem",

                overflowWrap: "anywhere",
              }}
            >
              Results for{" "}
              <span
                style={{
                  color: "#2563eb",
                }}
              >
                “{query}”
              </span>
            </h1>

            <p
              style={{
                marginBottom: "8px",
                lineHeight: 1.7,
                opacity: 0.8,
              }}
            >
              Search results across
              notes, reminders,
              birthdays, and links.
            </p>

            <p
              style={{
                margin: 0,

                fontSize: "14px",
                lineHeight: 1.7,
                opacity: 0.7,
              }}
            >
              {resultCounts.notes} Notes
              {" • "}
              {resultCounts.reminders}{" "}
              Reminders
              {" • "}
              {resultCounts.birthdays}{" "}
              Birthdays
              {" • "}
              {resultCounts.links} Links
            </p>
          </header>
        )}

        {loading && (
          <Card
            variant="glass"
            style={{
              margin: 0,
            }}
          >
            <LoadingSpinner
              text="Searching..."
              size={60}
            />
          </Card>
        )}

        {!loading && noResults && (
          <Card
            variant="glass"
            style={{
              margin: 0,
              textAlign: "center",
            }}
          >
            <FaSearch
              aria-hidden="true"
              size={36}
              style={{
                marginBottom: "14px",
                color: "#00be9f",
              }}
            />

            <h2>
              No Results Found
            </h2>

            <p>
              No notes, reminders,
              birthdays, or links
              matched your search.
            </p>

            <p
              style={{
                marginBottom: 0,
                opacity: 0.75,
              }}
            >
              Try a different keyword.
            </p>
          </Card>
        )}

        {!loading &&
          results &&
          !noResults && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr)",

                gap: isMobile
                  ? "16px"
                  : "24px",
              }}
            >
              {RESULT_SECTIONS.map(
                (section) => {
                  if (
                    selectedCategory !==
                      "all" &&
                    selectedCategory !==
                      section.id
                  ) {
                    return null;
                  }

                  return (
                    <SearchResultSection
                      key={section.id}
                      section={section}
                      items={
                        results[
                          section.id
                        ]
                      }
                      query={query}
                      navigateTo={
                        navigateTo
                      }
                    />
                  );
                }
              )}
            </div>
          )}
      </div>
    </Layout>
  );
}

/**
 * Renders one category of search results.
 */
function SearchResultSection({
  section,
  items,
  query,
  navigateTo,
}) {
  const {
    id,
    title,
    icon: Icon,
    route,
    emptyMessage,
  } = section;

  return (
    <Card
      variant="glass"
      style={{
        width: "100%",
        minWidth: 0,
        margin: 0,
      }}
    >
      <button
        type="button"
        className="underline"
        onClick={() =>
          navigateTo(route)
        }
        style={{
          display: "inline-flex",
          alignItems: "center",
          flexWrap: "wrap",

          gap: "10px",

          margin: "0 0 18px",
          padding: 0,

          color: "inherit",
          background: "transparent",
          border: "none",

          font: "inherit",
          fontSize: "1.5rem",
          fontWeight: 700,
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <Icon aria-hidden="true" />
        {title}
      </button>

      {items.length === 0 ? (
        <p
          style={{
            marginBottom: 0,
            opacity: 0.75,
          }}
        >
          {emptyMessage}
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {items.map((item) => (
            <SearchResultItem
              key={item._id}
              type={id}
              item={item}
              query={query}
              navigateTo={navigateTo}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

/**
 * Renders an individual search result.
 */
function SearchResultItem({
  type,
  item,
  query,
  navigateTo,
}) {
  const destination =
    getResultDestination(
      type,
      item._id
    );

  const handleResultClick =
    useCallback(() => {
      navigateTo(destination);
    }, [
      destination,
      navigateTo,
    ]);

  const handleKeyDown =
    useCallback(
      (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          handleResultClick();
        }
      },
      [handleResultClick]
    );

  return (
    <div
      role="link"
      tabIndex={0}
      className="search-result-item"
      onClick={handleResultClick}
      onKeyDown={handleKeyDown}
      style={{
        width: "100%",
        margin: 0,

        boxSizing: "border-box",
        cursor: "pointer",
      }}
    >
      {type === "notes" && (
        <>
          <strong>
            {highlightText(
              item.title || "",
              query
            )}
          </strong>

          {item.content && (
            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,

                lineHeight: 1.7,
                opacity: 0.8,
                overflowWrap: "anywhere",
              }}
            >
              {highlightText(
                item.content,
                query
              )}
            </p>
          )}
        </>
      )}

      {type === "reminders" && (
        <strong>
          {highlightText(
            item.title || "",
            query
          )}
        </strong>
      )}

      {type === "birthdays" && (
        <strong>
          {highlightText(
            item.name || "",
            query
          )}
        </strong>
      )}

      {type === "links" && (
        <>
          <strong>
            {highlightText(
              item.title || "",
              query
            )}
          </strong>

          {item.url && (
            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,

                overflowWrap: "anywhere",
              }}
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                {item.url}
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Search;