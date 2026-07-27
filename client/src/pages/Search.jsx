import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { LayoutContext } from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import searchLightBg from "../assets/backgrounds/dashboard-light.png";
import searchDarkBg from "../assets/backgrounds/dashboard-dark.png";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import toast from "react-hot-toast";
import highlightText from "../utils/highlightText";
import LoadingSpinner from "../components/LoadingSpinner";

import {
  FaSearch,
  FaList,
  FaStickyNote,
  FaBell,
  FaBirthdayCake,
  FaLink,
} from "react-icons/fa";

function Search() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isMobile } = useContext(LayoutContext);
  const darkMode = user?.theme === "dark";
  const backgroundImage = darkMode
    ? searchDarkBg
    : searchLightBg;

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const location = useLocation();

  const query =
    new URLSearchParams(
      location.search
    ).get("q") || "";

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      return;
    }

    setLoading(true);


    try {
      const res =
        await api.get(
          `/search?q=${searchTerm}`
        );

      setResults(
        res.data
      );
      setSelectedCategory("all");


    } catch (error) {




      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Search failed."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

  const noResults =
    results &&
    results.reminders.length === 0 &&
    results.notes.length === 0 &&
    results.birthdays.length === 0 &&
    results.links.length === 0;


  const sidebar = (
  <Card
    variant="glass"
    style={{
      position: isMobile ? "static" : "fixed",
      top: isMobile ? undefined : "15%",
      left: isMobile ? undefined : "2%",
      width: isMobile ? "100%" : "20%",
      minHeight: isMobile ? "auto" : "75%",
      padding: "24px",
      borderRadius: "22px",
    }}
  >
      <h1
        style={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <FaSearch />
        Search By
      </h1>
  

    {!query ? (
      <p
        style={{
          paddingLeft: "20px",
        }}
      >
        Start typing in the search bar.
      </p>
    ) : (
      <>
        <div
          className="glow-top left"
          onClick={() => setSelectedCategory("all")}
          style={{
            paddingLeft: "20px",
            marginBottom: "10px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <>
            <FaList style={{ marginRight: "8px" }} />
            All Results
          </>
        </div>
        
        <div
          className="glow-top left"
          onClick={() => setSelectedCategory("notes")}
          style={{
            paddingLeft: "20px",
            marginBottom: "10px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <>
            <FaStickyNote style={{ marginRight: "8px" }} />
            Notes: {results?.notes?.length || 0}
          </>
        </div>

        <div
          className="glow-top left"
          onClick={() => setSelectedCategory("reminders")}
          style={{
            paddingLeft: "20px",
            marginBottom: "10px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <>
            <FaBell style={{ marginRight: "8px" }} />
            Reminders: {results?.reminders?.length || 0}
          </>
        </div>

        <div
          className="glow-top left"
          onClick={() => setSelectedCategory("birthdays")}
          style={{
            paddingLeft: "20px",
            marginBottom: "10px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <>
            <FaBirthdayCake style={{ marginRight: "8px" }} />
            Birthdays: {results?.birthdays?.length || 0}
          </>
        </div>

        <div
          className="glow-top left"
          onClick={() => setSelectedCategory("links")}
          style={{
            paddingLeft: "20px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <>
            <FaLink style={{ marginRight: "8px" }} />
            Links: {results?.links?.length || 0}
          </>
        </div>
      </>
    )}
  </Card>
);
if (loading) {
  return <LoadingSpinner />;
}
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
          gap: "28px",
          padding: "10px 10px 40px",
        }}
      >

      {!query && (
        <Card variant="glass">
          <h2>
            Search
          </h2>

          <p>
            Start typing in the search bar to search notes,
            reminders, birthdays and links.
          </p>
        </Card>
      )}

      {noResults && (
        <Card variant="glass">
          <h2>
            No Results Found
          </h2>

          <p>
            No notes, reminders, birthdays, or links matched your search.
          </p>

          <p>
            Try a different keyword.
          </p>
        </Card>
      )}

      {query && (
        <div
          style={{
            marginBottom: "20px"
          }}
        >
          <h1
            style={{
              marginBottom: "8px"
            }}
          >
            Results for{" "}
            <span
              style={{
                color: "#2563eb"
              }}
            >
              "{query}"
            </span>
          </h1>

          <p
            style={{
              opacity: 0.8
            }}
          >
            Search results across notes, reminders,
            birthdays and links.
          </p>

          <p
            style={{
              fontSize: "14px",
              opacity: 0.7
            }}
          >
            {results?.notes?.length || 0} Notes •{" "}
            {results?.reminders?.length || 0} Reminders •{" "}
            {results?.birthdays?.length || 0} Birthdays •{" "}
            {results?.links?.length || 0} Links
          </p>
        </div>
      )}



      {results && !noResults && (
        <>
          {(selectedCategory === "all" ||
            selectedCategory === "reminders") && (
          <Card variant="glass">
            <h2
              className="underline"
              onClick={() =>
                navigate("/reminders")
              }
            ><FaBell
              style={{ marginRight: "15px" }}/>
              Reminders
            </h2>

            {results.reminders.length === 0 ? (
              <p>
                No reminders found
              </p>
            ) : (
              results.reminders.map(
                (item) => (
                  <div
                    key={item._id}
                    className="search-result-item"
                    onClick={() =>
                      navigate(
                        `/reminders?reminderId=${item._id}`
                      )
                    }
                  >
                    <strong>
                      {highlightText(item.title, query)}
                    </strong>
                  </div>
                )
              )
            )}
          </Card>
            )}

          
          
          {(selectedCategory === "all" ||
            selectedCategory === "notes") && (
          <Card variant="glass">
            <h2
              className="underline"
              onClick={() =>
                navigate("/notes")
              }
            ><FaStickyNote style={{ marginRight: "15px" }}/>
            Notes
            </h2>

            {results.notes.length === 0 ? (
              <p>
                No notes found
              </p>
            ) : (
              results.notes.map(
                (item) => (
                  <div
                    key={item._id}
                    className="search-result-item"
                    onClick={() =>
                      navigate(
                        `/notes?noteId=${item._id}`
                      )
                    }
                  >
                    <strong>
                      {highlightText(item.title, query)}
                    </strong>

                    <p>
                      {highlightText(item.content, query)}
                    </p>
                  </div>
                )
              )
            )}
          </Card>
          )}




          {(selectedCategory === "all" ||
            selectedCategory === "birthdays") && (
          <Card variant="glass">
            <h2
              className="underline"
              onClick={() =>
                navigate("/birthdays")
              }
            ><FaBirthdayCake style={{marginRight:"15px"}}/>
            Birthdays
            </h2>

            {results.birthdays.length === 0 ? (
              <p>
                No birthdays found
              </p>
            ) : (
              results.birthdays.map(
                (item) => (
                  <div
                    key={item._id}
                    className="search-result-item"
                    onClick={() =>
                      navigate(
                        `/birthdays?birthdayId=${item._id}`
                      )
                    }
                  >
                    {highlightText(item.name, query)}
                  </div>
                )
              )
            )}
          </Card>
          )}




          {(selectedCategory === "all" ||
            selectedCategory === "links") && (
          <Card variant="glass">
            <h2
              className="underline"
              onClick={() =>
                navigate("/links")
              }
            ><FaLink style={{marginRight:"15px"}}/>
            Links
            </h2>

            {results.links.length === 0 ? (
              <p>
                No links found
              </p>
            ) : (
              results.links.map(
                (item) => (
                  <div
                    key={item._id}
                    className="search-result-item"
                    onClick={() =>
                      navigate(
                        `/links?linkId=${item._id}`
                      )
                    }
                  >
                    <strong>
                      {highlightText(item.title, query)}
                    </strong>

                    <p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        {item.url}
                      </a>
                    </p>
                  </div>
                )
              )
            )}
          </Card>
          )}
        </>
      )}
    </div>
    </Layout>
  );
}

export default Search;