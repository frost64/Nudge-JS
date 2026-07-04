import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";

function Search() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const location = useLocation();

  const query =
    new URLSearchParams(
      location.search
    ).get("q") || "";

  const handleSearch =
  async (searchTerm) => {
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
    } 
    catch (error) {
      console.log(error);
    } 
    finally {
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
  
  return (
    <Layout>

{loading && (
  <p>Searching...</p>
)}

{!query && (
  <Card>
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
  <Card>
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
      Results for
      {" "}
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
      {results && !noResults &&(
        <>
          <Card>

            <h2
              className="search-section-title"
              onClick={() =>
                navigate("/reminders")
              }
            >
              Reminders
            </h2>

            {
              results.reminders.length === 0
                ? (
                  <p>
                    No reminders found
                  </p>
                )
                : (
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
                          {item.title}
                        </strong>
                      </div>
                    )
                  )
                )
            }

          </Card>

          <Card>

            <h2
              className="search-section-title"
              onClick={() =>
                navigate("/notes")
              }
            >
              Notes
            </h2>

            {
              results.notes.length === 0
                ? (
                  <p>
                    No notes found
                  </p>
                )
                : (
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
                          {item.title}
                        </strong>

                        <p>
                          {item.content}
                        </p>
                      </div>
                    )
                  )
                )
            }

          </Card>

          <Card>

            <h2
              className="search-section-title"
              onClick={() =>
                navigate("/birthdays")
              }
            >
              Birthdays
            </h2>

            {
              results.birthdays.length === 0
                ? (
                  <p>
                    No birthdays found
                  </p>
                )
                : (
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
                        {item.name}
                      </div>
                    )
                  )
                )
            }

          </Card>

          <Card>

            <h2
              className="search-section-title"
              onClick={() =>
                navigate("/links")
              }
            >
              Links
            </h2>

            {
              results.links.length === 0
                ? (
                  <p>
                    No links found
                  </p>
                )
                : (
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
                          {item.title}
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
                )
            }

          </Card>
        </>
      )}

    </Layout>
  );

}

export default Search;