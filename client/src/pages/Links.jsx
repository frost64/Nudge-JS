import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { useLocation } from "react-router-dom";
import { useRef } from "react";

function Links() {

const [links, setLinks] = useState([]);
const [title, setTitle] = useState("");
const [url, setUrl] =useState("");
const [category, setCategory] =useState("");
const [notes, setNotes] =useState("");
const [editingId, setEditingId] =useState(null);
const [showForm, setShowForm] = useState(false);

const location = useLocation();
const linkRefs = useRef({});

const searchParams = new URLSearchParams(location.search);
const selectedLinkId = searchParams.get("linkId");

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
  }
};

const handleSave =
async () => {   
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
  fetchLinks();
}, []);

useEffect(() => {
  if (
    selectedLinkId &&
    linkRefs.current[selectedLinkId]
  ) {
    linkRefs.current[
      selectedLinkId
    ].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    }
}, [links,selectedLinkId]);

return ( 
<Layout>
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
          placeholder="Notes"
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
            className="glow-top"
            onClick={cancelEdit}
          >
            Cancel
          </button>
        </div>
      </div>
    </Card>
  )}

  {!showForm && (
  <>
  {
    links.length === 0 ? (
      <p>No links found</p>
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
                  border:
                    selectedLinkId === link._id
                      ? "2px solid #3b82f6"
                      : "none",

                  backgroundColor:
                    selectedLinkId === link._id
                      ? "rgba(59,130,246,0.08)"
                      : "transparent",

                  borderRadius: "8px",

                  padding:
                    selectedLinkId === link._id
                      ? "8px"
                      : "0",

                  transition:
                    "all 0.3s ease"
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
                  <strong>Notes: </strong>
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
                    className="glow-top"
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
