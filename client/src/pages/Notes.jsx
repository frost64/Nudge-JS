import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import toast from "react-hot-toast";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import noteLightBg from "../assets/backgrounds/note-light.png";
import noteDarkBg from "../assets/backgrounds/note-dark.png";

function Notes() {
  const { user } = useContext(AuthContext);
  const confirm = useConfirm();
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
  }, 1200);
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

          toast.error(
            error.response?.data?.message ||
            "Failed to load notes."
          );
        }
    };

  const handleSave =
    async () => {
      if (!title.trim()) {
        toast.error("Title is required.");
        return;
      }
      if (!content.trim()) {
        toast.error("Description is required");
        return;
      }
      if (!tags.trim()) {
        toast.error("Please add at least one tag");
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
          toast.success("Note updated successfully.");
        } else {
          await api.post(
            "/notes",
            noteData
          );
          toast.success("Note added successfully.");
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
        toast.error(
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

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Note",
      message:
        "Are you sure you want to delete this note? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await api.delete(`/notes/${id}`);

      toast.success("Note deleted successfully.");

      fetchNotes();
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to delete note."
      );
    }
  };

  const handlePin = async (id) => {
    try {
      await api.patch(`/notes/${id}/pin`);
      toast.success("Pin updated.");
      await fetchNotes();
      highlightNote(id);

    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to update note."
      );
    }
  };

  const handleFavorite =
    async (id) => {
      try {
        await api.patch(
          `/notes/${id}/favorite`
        );
        toast.success("Favorite updated.");
        fetchNotes();
      } 
      catch (error) {
        console.log(error);
        toast.error(
          error.response?.data?.message ||
          "Failed to update favorite."
        );
      }
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
  const sidebar = (
  <Card
  variant="glass"
  style={{
    position: "fixed",
    top: "15%",
    left: "2%",
    width: "20%",
    minHeight: "65%",
    padding: "24px",
    borderRadius: "22px",
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
          variant="glass"
          style={{
              width: "100%",
              maxWidth: "400px",
              borderRadius: "24px",
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

{/* ------------------------ Content ------------------------- */}
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
  <h1
    style={{
      margin: 0,
      fontSize: "2.5rem",
    }}
  >
    Notes
  </h1>

    <button
      className="glow-top"
      style={{
          padding: "12px 22px",
          fontSize: "1rem"
        }}
      onClick={() => setShowForm(true)}
    >
      📝 Create Note
    </button>
</div>

      {notes.length === 0 ? (
          <p>Create your first note!</p>
        ) : (
          notes.map(
            (note) => (
              <Card
                key={note._id}
                ref={(el) => {
                  noteRefs.current[note._id] = el;
                }}
                variant="glass"
                style={{
                  boxShadow:
                    highlightId === note._id
                      ? note.pinned
                        ? `
                            0 0 25px rgba(255,215,0,.45),
                            0 0 70px rgba(255,215,0,.18),
                            0 20px 60px rgba(0,0,0,.45)
                          `
                        : `
                            0 0 25px rgba(0,255,204,.45),
                            0 0 70px rgba(0,255,204,.18),
                            0 20px 60px rgba(0,0,0,.45)
                          `
                      : undefined,

                  transition: "box-shadow .35s ease",
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
              </Card>
            )
          )
        )}
      </div>
    </Layout>
  );}
export default Notes;