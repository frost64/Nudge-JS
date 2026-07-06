import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import noteLightBg from "../assets/backgrounds/note-light.png";
import noteDarkBg from "../assets/backgrounds/note-dark.png";

function Notes() {
  const { user } = useContext(AuthContext);
  const darkMode = user?.theme === "dark";
  const formBackground = darkMode
  ? noteDarkBg
  : noteLightBg;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const shouldCreate = searchParams.get("create");  
  const selectedNoteId = searchParams.get("noteId");
  const noteRefs = useRef({});
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const highlightTimeout = useRef(null);
  const allTags = [...new Set(notes.flatMap(note => note.tags))];

  const recentNotes = [...notes]
  .sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  )
  .slice(0, 5);

  const highlightNote = (id) => {
  setHighlightId(id);

  noteRefs.current[id]?.scrollIntoView({
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

  const fetchNotes =
    async () => {
      try {
        const res =
          await api.get(
            "/notes"
          );
        setNotes(
          res.data.data
        );
      } catch (error) {
        console.log(error);
      }
    };

  const handleSave =
    async () => {
      if (!title.trim()) {
        alert("Title is required");
        return;
      }
      if (!content.trim()) {
        alert("Description is required");
        return;
      }
      if (!tags.trim()) {
        alert("Please add at least one tag");
        return;
      }
      try {
        const noteData = {
          title,
          content,
          tags: tags
            .split(",")
            .map(
              (tag) =>
                tag.trim()
            )
            .filter(Boolean)
        };
        if (editingId) {
          await api.put(
            `/notes/${editingId}`,
            noteData
          );
        } else {
          await api.post(
            "/notes",
            noteData
          );
        }
        setTitle("");
        setContent("");
        setTags("");
        setEditingId(null);
        setShowForm(false);
        fetchNotes();
      } 
      catch (error) {
        console.log(error);
        alert(
          error.response?.data?.message ||
          "Failed to save note."
        );
      }
    };

  const startEdit =
    (note) => {
      setEditingId(note._id);
      setShowForm(true);
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags.join(", "));
    };

  const cancelEdit =
    () => {
      setEditingId(null);
      setTitle("");
      setContent("");
      setTags("");
      setShowForm(false);
    };

  const handleDelete =
    async (id) => {
      const confirmed =
        window.confirm(
          "Delete this note?"
        );
      if (!confirmed) {
        return;
      }
      try {
        await api.delete(
          `/notes/${id}`
        );
        fetchNotes();
      } 
      catch (error) {console.log(error);}
    };

  const handlePin = async (id) => {
    try {
      await api.patch(`/notes/${id}/pin`);

      await fetchNotes();
      highlightNote(id);

    } catch (error) {
      console.log(error);
    }
  };

  const handleFavorite =
    async (id) => {
      try {
        await api.patch(
          `/notes/${id}/favorite`
        );
        fetchNotes();
      } 
      catch (error) {console.log(error);}
    };

  useEffect(() => {fetchNotes();}, []);
  
  useEffect(() => {
    if (
      selectedNoteId &&
      noteRefs.current[selectedNoteId]
    ) {
      highlightNote(selectedNoteId);
    }
  }, [notes, selectedNoteId]);

  useEffect(() => {
    if (shouldCreate === "true") {
      setShowForm(true);
    }
  }, [shouldCreate]);


  useEffect(() => {
    return () => {
      if (highlightTimeout.current) {
        clearTimeout(highlightTimeout.current);
      }
    };
  }, []);

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
      Recent 📝
    </h1>

    {recentNotes.length === 0 ? (
      <p style={{ paddingLeft: "20px" }}>
        No recent notes
      </p>
    ) : (
      recentNotes.map((note) => (
        <div
          key={note._id}
          className="glow-top left"
          style={{
            paddingLeft: "20px",
            marginBottom: "10px",
            cursor: "pointer",
            borderRadius: "10px",
          }}
          onClick={() => highlightNote(note._id)}
        >
          {note.title}
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
      Notes
    </h1>

    <button
      className="glow-top"
      onClick={() => setShowForm(true)}
    >
      📝 Create Note
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
              ? "Edit Note"
              : "New Note"
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


          <textarea
            className="input-glow"
            placeholder="Note Description"
            rows="10"
            value={content}
            onChange={(e) =>
              setContent(
                e.target.value
              )
            }
          />

          <input
            className="input-glow"
            list="tags-list"
            type="text"
            placeholder="Create/Select Tags"
            value={tags}
            onChange={(e) =>
              setTags(
                e.target.value
              )
            }
          />

          <datalist id="tags-list">
            {allTags.map(tag => (
              <option
                key={tag}
                value={tag}
              />
            ))}
          </datalist>
        </div>
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
            {editingId ? "Update Note" : "Add Note"}
          </button>

          <button
            className="glow-top delete"
            onClick={cancelEdit}
          >
            Cancel
          </button>
        </div>
      </Card>
      </div>
)}

      {!showForm && (
      <>
      {
        notes.length === 0 ? (
          <p>
            Create your first note!
          </p>

        ) : (

          notes.map(
            (note) => (
            <div
              key={note._id}
              ref={(el) =>{
                noteRefs.current[
                  note._id
                ] = el;
              }}
            >
              <Card>
                <div
                  style={{                  
                    backgroundColor:
                      highlightId === note._id
                        ? note.pinned
                          ? "rgba(255,215,0,.16)"
                          : "rgba(0,204,255,.09)"
                        : "transparent",

                    boxShadow:
                      highlightId === note._id
                        ? note.pinned
                          ? "0 0 28px rgba(255,215,0,.65)"
                          : "0 0 20px rgba(0,255,204,.45)"
                        : "none",
                    border: "2px solid transparent",
                    padding:
                      highlightId === note._id
                        ? "8px"
                        : "0",
                    transform:
                      highlightId === note._id
                        ? "scale(1.015)"
                        : "scale(1)",
                    transition:
                      "background-color 1.2s ease, box-shadow 1.2s ease, transform .45s ease, padding .3s ease",
                    
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
                    {note.title}
                  </span>

                  <span>
                    {note.pinned && "📌 "}
                    {note.favorite && "⭐"}
                  </span>
                </h3>

                <p><strong>Description: </strong>{note.content}</p>

                <p><strong>Tags: </strong>{note.tags.join(", ")}</p>
                <p>
                  <strong>Created On: </strong>
                  {new Date(note.createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                  <button
                    className="glow-top"
                    onClick={() =>
                      startEdit(
                        note
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="glow-top"
                    onClick={() =>
                      handlePin(
                        note._id
                      )
                    }
                  >
                    {
                      note.pinned
                        ? "Unpin"
                        : "Pin"
                    }
                  </button>

                  <button
                    className="glow-top"
                    onClick={() =>
                      handleFavorite(
                        note._id
                      )
                    }
                  >
                    {
                      note.favorite
                        ? "Unfavorite"
                        : "Favorite"
                    }
                  </button>

                  <button
                    className="glow-top delete"
                    onClick={() =>
                      handleDelete(
                        note._id
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
  );}
export default Notes;