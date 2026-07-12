import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRef } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import toast from "react-hot-toast";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import linkLightBg from "../assets/backgrounds/link-light.png";
import linkDarkBg from "../assets/backgrounds/link-dark.png";

function Links() {
const { user } = useContext(AuthContext);
const confirm = useConfirm();
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
    toast.error(
      error.response?.data?.message ||
      "Failed to load links."
    );
  }
};

const handleSave =
async () => {  
  if (!title.trim()) {
    toast.error("Title is required");
    return;
  }

  if (!url.trim()) {
    toast.error("URL is required");
    return;
  }

  if (!category.trim()) {
    toast.error("Category is required");
    return;
  }

  if (!notes.trim()) {
    toast.error("Description is required");
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
    toast.success(
      editingId
        ? "Link updated successfully."
        : "Link added successfully."
    );
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
    toast.error(
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
  }, 1200);
};
   

const handleDelete =
async (id) => {
  const confirmed = await confirm({
    title: "Delete Link",
    message:
      "Are you sure you want to delete this link? This action cannot be undone.",
    confirmText: "Delete",
    cancelText: "Cancel",
  });
  if (!confirmed) return;
  
  
  try {
    await api.delete(
      `/links/${id}`
    );
    toast.success("Link deleted successfully.");
    fetchLinks();
  } 
  catch (error) {
    console.log(error);
    toast.error(
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

    toast.error(
      error.response?.data?.message ||
      "Failed to update favorite."
    );
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

useEffect(() => {
    if (showForm) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }

    return () => {
        document.body.style.overflow = "";
    };
}, [showForm]);
const defaultCardShadow = undefined;

const highlightShadow = `
  0 0 25px rgba(0,255,204,.45),
  0 0 70px rgba(0,255,204,.18),
  0 20px 60px rgba(0,0,0,.45)
`;

const sidebar = (
  <Card
    variant="glass"
    style={{
      position: "fixed",
      top: "15%",
      left: "2%",
      width: "20%",
      minHeight: "75%",
      padding: "24px",
      borderRadius: "22px",
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
  </Card>
);

return ( 
<Layout
    sidebar={sidebar}
    backgroundImage={formBackground}
    blurBackground={showForm}
    cardVariant="glass"
  >
   {showForm && (
    <div
    style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1100,
        }}
  >
    <Card
      style={{
        width:"100%",
        maxWidth:"400px",
        borderRadius:"24px",
        boxShadow: darkMode
              ? `
                  0 0 35px rgba(0,255,204,.22),
                  0 0 90px rgba(0,160,255,.14),
                  0 30px 80px rgba(0,0,0,.55)
                `
              : `
                  0 0 30px rgba(0,180,255,.18),
                  0 0 70px rgba(0,255,200,.14),
                  0 25px 70px rgba(0,0,0,.18)
                `,
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

<div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "28px",
      padding: "10px 10px 40px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        width: "100%"
      }}
    >
      <h1 style={{ 
          margin: 0,
          fontSize: "2.5rem"
        }}>
        Links
      </h1>

      <button
        className="glow-top"
        style={{
          padding: "12px 22px",
          fontSize: "1rem"
        }}
        onClick={() => setShowForm(true)}
      >
        🔗 Create Link
      </button>
    </div>

  {links.length === 0 ? (
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
            <Card 
              variant="glass"
              style={{
                  boxShadow:
                    highlightId === link._id
                      ? highlightShadow
                      : defaultCardShadow,
                  transition:
                    "box-shadow .35s ease"
                }}>
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
            </Card>
          </div>
        )
      )
    )
  }
  </div>
</Layout>
);
}

export default Links;
