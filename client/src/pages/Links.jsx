import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { useLocation } from "react-router-dom";
import { useRef } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import linkLightBg from "../assets/backgrounds/link-light.png";
import linkDarkBg from "../assets/backgrounds/link-dark.png";

function Links() {
const { user } = useContext(AuthContext);
const darkMode = user?.theme === "dark";
const formBackground = darkMode
  ? linkDarkBg
  : linkLightBg;
const [links, setLinks] = useState([]);
const [title, setTitle] = useState("");
const [url, setUrl] =useState("");
const [category, setCategory] =useState("");
const [notes, setNotes] =useState("");
const [editingId, setEditingId] =useState(null);
const [showForm, setShowForm] = useState(false);
const favoriteLinks = links
  .filter((link) => link.favorite)
  .slice(0, 5);
const [highlightId, setHighlightId] = useState(null);
const highlightTimeout = useRef(null);
const location = useLocation();
const searchParams = new URLSearchParams(location.search);
const selectedLinkId = searchParams.get("linkId");
const shouldCreate = searchParams.get("create");
const linkRefs = useRef({});

const fetchLinks =
async () => {
  try {
    const res =
      await api.get(
        "/links"
      );
    setLinks(
      res.data.data
    );
  } 
  catch (error) {
    console.log(error);
    alert(
      error.response?.data?.message ||
      "Failed to load links."
    );
  }
};

const handleSave =
async () => {  
  if (!title.trim()) {
    alert("Title is required");
    return;
  }

  if (!url.trim()) {
    alert("URL is required");
    return;
  }

  if (!category.trim()) {
    alert("Category is required");
    return;
  }

  if (!notes.trim()) {
    alert("Description is required");
    return;
  } 
  try {
    const linkData = {
      title,
      url,
      category,
      notes
    };
    if (editingId) {
      await api.put(
        `/links/${editingId}`,
        linkData
      );
    } 
    else {
      await api.post(
        "/links",
        linkData
      );
    }
    setTitle("");
    setUrl("");
    setCategory("");
    setNotes("");
    setEditingId(null);
    setShowForm(false);
    fetchLinks();
  } 
  catch (error) {
    console.log(error);
    alert(
      error.response?.data?.message ||
      "Failed to save link."
    );
  }
};

const startEdit =
(link) => {
  setEditingId(link._id);
  setShowForm(true);
  setTitle(link.title);
  setUrl(link.url);
  setCategory(link.category);
  setNotes(link.notes);
};
   

const cancelEdit = () => {
  setEditingId(null);
  setTitle("");
  setUrl("");
  setCategory("");
  setNotes("");
  setShowForm(false);
};

const highlightLink = (id) => {
  setHighlightId(id);

  linkRefs.current[id]?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  if (highlightTimeout.current) {
    clearTimeout(highlightTimeout.current);
  }

  highlightTimeout.current = setTimeout(() => {
    setHighlightId(null);
  }, 2000);
};
   

const handleDelete =
async (id) => {
  const confirmed = window.confirm("Delete this link?");
  if (!confirmed) {
    return;
  }
  try {
    await api.delete(
      `/links/${id}`
    );
    fetchLinks();
  } 
  catch (error) {
    console.log(error);
    alert(
      error.response?.data?.message ||
      "Failed to delete link."
    );
  }
};

const handleFavorite =
async (id) => {   
  try {
    await api.patch(
      `/links/${id}/favorite`
    );
    fetchLinks();
  } 
  catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  if (
    selectedLinkId &&
    linkRefs.current[selectedLinkId]
  ) {
    highlightLink(selectedLinkId);
  }
}, [links, selectedLinkId]);

useEffect(() => {
  return () => {
    if (highlightTimeout.current) {
      clearTimeout(highlightTimeout.current);
    }
  };
}, []);

useEffect(() => {
  fetchLinks();
}, []);


useEffect(() => {
  if (shouldCreate === "true") {
    setShowForm(true);
  }
}, [shouldCreate]);

const sidebar = (
  <div
    style={{
      userSelect: "none",
      position: "fixed",
      top: "15%",
      left: "2%",
      width: "20%",
      height: "70%",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <h1 style={{ textAlign: "center" }}>
      Favourites ⭐
    </h1>

    {favoriteLinks.length === 0 ? (
      <p style={{ paddingLeft: "20px" }}>
        No favorite links
      </p>
    ) : (
      favoriteLinks.map((link) => (
        <div
          key={link._id}
          className="glow-top left"
          style={{
            paddingLeft: "20px",
            marginBottom: "10px",
            cursor: "pointer",
            borderRadius: "10px",
          }}
          onClick={() => highlightLink(link._id)}
        >
          {link.title}
        </div>
      ))
    )}
  </div>
);

return ( 
<Layout sidebar={!showForm ? sidebar : null}>
  {!showForm && (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px"
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "2.5rem"
        }}
      >
        Links
      </h1>

      <button
        className="glow-top"
        onClick={() => setShowForm(true)}
      >
        🔗 Create Link
      </button>
    </div>
  )}
  {showForm && (
    <div
    style={{
      minHeight: "100vh",
      width: "100%",
      backgroundImage: `url(${formBackground})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",

      display: "flex",
      justifyContent: "center",
      alignItems: "center",

      position: "relative",
    }}
  >
    <Card
      style={{
        width: "40%",
        marginLeft: "auto",
        marginRight: "auto"
      }}
    >
      <h2>
          {
            editingId
              ? "Edit Link"
              : "New Link"
          }
        </h2>
        
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px"
        }}
      >
        <input
          className="input-glow"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
        />

        <input
          className="input-glow"
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) =>
            setUrl(
              e.target.value
            )
          }
        />

        <input
          className="input-glow"
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
        />

        <textarea
          className="input-glow"
          placeholder="Description"
          rows="4"
          cols="40"
          value={notes}
          onChange={(e) =>
            setNotes(
              e.target.value
            )
          }
        />

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px"
          }}
        >
          <button
            className="glow-top"
            onClick={handleSave}
          >
            {editingId ? "Update Link" : "Add Link"}
          </button>

          <button
            className="glow-top delete"
            onClick={cancelEdit}
          >
            Cancel
          </button>
        </div>
      </div>
    </Card>
    </div>
  )}

  {!showForm && (
  <>
  {
    links.length === 0 ? (
      <p>Create your first link!</p>
    ) : (
      links.map(
        (link) => (
          <div
            key={link._id}
            ref={(el) => {
              linkRefs.current[
                link._id
              ] = el;
            }}
          >
            <Card>
              <div
                style={{
                  backgroundColor:
                    highlightId === link._id
                      ? "rgba(0,204,255,0.09)"
                      : "transparent",

                  boxShadow:
                    highlightId === link._id
                      ? "0 0 20px rgba(0,255,204,0.45)"
                      : "0 0 0 rgba(0,255,204,0)",

                  border: "2px solid transparent",

                  borderRadius: "8px",

                  padding:
                    highlightId === link._id
                      ? "8px"
                      : "0",

                  transition:
                    "background-color .5s ease, box-shadow .5s ease, padding .3s ease"
                }}
              >
                <h3
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>
                    <strong>Title: </strong>
                    {link.title}
                  </span>

                  <span
                    style={{
                      fontSize: "1.2rem"
                    }}
                  >
                    {link.favorite && "⭐"}
                  </span>
                </h3>

                <p style={{ wordBreak: "break-all" }}>
                  <strong>URL: </strong>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.url}
                  </a>
                </p>

                <p>
                  <strong>Category: </strong>
                  {link.category}
                </p>

                <p>
                  <strong>Description: </strong>
                  {link.notes}
                </p>

                  <button
                    className="glow-top"
                    onClick={() =>
                      startEdit(link)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="glow-top"
                    onClick={() =>
                      handleFavorite(
                        link._id
                      )
                    }
                  >
                    {
                      link.favorite
                        ? "Unfavorite"
                        : "Favorite"
                    }
                  </button>

                  <button
                    className="glow-top delete"
                    onClick={() =>
                      handleDelete(
                        link._id
                      )
                    }
                  >
                    Delete
                  </button>
              </div>
            </Card>
          </div>
        )
      )
    )
  }
</>
)}
</Layout>
   

);
}

export default Links;
