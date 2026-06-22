import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { useLocation } from "react-router-dom";
import { useRef } from "react";

function Links() {

const [links, setLinks] =
useState([]);

const [title, setTitle] =
useState("");

const [url, setUrl] =
useState("");

const [category, setCategory] =
useState("");

const [notes, setNotes] =
useState("");

const [editingId, setEditingId] =
useState(null);

const location = useLocation();

const linkRefs = useRef({});

const searchParams =
  new URLSearchParams(
    location.search
  );

const selectedLinkId =
  searchParams.get(
    "linkId"
  );

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

  } catch (error) {

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

    } else {

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

    fetchLinks();

  } catch (error) {

    console.log(error);

  }

};
   

const startEdit =
(link) => {

   
  setEditingId(
    link._id
  );

  setTitle(
    link.title
  );

  setUrl(
    link.url
  );

  setCategory(
    link.category
  );

  setNotes(
    link.notes
  );

};
   

const cancelEdit =
() => {

   
  setEditingId(null);

  setTitle("");

  setUrl("");

  setCategory("");

  setNotes("");

};
   

const handleDelete =
async (id) => {

   
  const confirmed =
    window.confirm(
      "Delete this link?"
    );

  if (!confirmed) {
    return;
  }

  try {

    await api.delete(
      `/links/${id}`
    );

    fetchLinks();

  } catch (error) {

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

  } catch (error) {

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
}, [
  links,
  selectedLinkId
]);

return ( <Layout>

   
  <h1>
    Links
  </h1>

  <h2>
    {
      editingId
        ? "Edit Link"
        : "Create Link"
    }
  </h2>
<div
  style={{
    maxWidth: "700px"
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

  <br />
  <br />

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

  <br />
  <br />

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

  <br />
  <br />

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

  <br />
  <br />

  <button
    onClick={handleSave}
  >
    {
      editingId
        ? "Update Link"
        : "Add Link"
    }
  </button>

  {" "}

  {
    editingId && (
      <button
        onClick={cancelEdit}
      >
        Cancel
      </button>
    )
  }
</div>
  <hr />

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
                <h3>
                  {
                    link.favorite
                      ? "⭐ "
                      : ""
                  }
                  {link.title}
                </h3>

                <p
                  style={{
                    wordBreak:
                      "break-all"
                  }}
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.url}
                  </a>
                </p>

                <p>
                  Category:{" "}
                  {link.category}
                </p>

                <p>
                  Notes:{" "}
                  {link.notes}
                </p>

                <div className="action-buttons">
                  <button
                    onClick={() =>
                      startEdit(link)
                    }
                  >
                    Edit
                  </button>

                  <button
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
                    onClick={() =>
                      handleDelete(
                        link._id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )
      )
    )
  }

</Layout>
   

);
}

export default Links;
