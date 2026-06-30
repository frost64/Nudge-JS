import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";

function Notes() {

  const location = useLocation();
  const noteRefs = useRef({});
  const searchParams = new URLSearchParams(location.search);
  const selectedNoteId = searchParams.get("noteId");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [editingId, setEditingId] = useState(null);
  const allTags = [...new Set(notes.flatMap(note => note.tags))];

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
        fetchNotes();
      } 
      catch (error) {console.log(error);}
    };

  const startEdit =
    (note) => {
      setEditingId(note._id);
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

  const handlePin =
    async (id) => {
      try {
        await api.patch(
          `/notes/${id}/pin`
        );
        fetchNotes();
      } 
      catch (error) {console.log(error);}
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
      noteRefs.current[
        selectedNoteId
      ].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [notes,selectedNoteId]);

  return (
    <Layout>
      <h1>Notes</h1>
      <div
        style={{
          maxWidth: "600px"
        }}
      >
        <h2>
          {
            editingId
              ? "Edit Note"
              : "Create Note"
          }
        </h2>

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

        <textarea
          className="input-glow"
          placeholder="Content"
          rows="5"
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

        <br />
        <br />

        <button
          onClick={handleSave}
        >
          {
            editingId
              ? "Update Note"
              : "Add Note"
          }
        </button>

        {editingId && (
          <button
            onClick={cancelEdit}
          >
            Cancel
          </button>
        )}

      </div>

      <hr />

      {
        notes.length === 0 ? (

          <p>
            No notes found
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
                    boxShadow:
                      selectedNoteId === note._id
                        ? "0 0 15px rgba(59,130,246,0.3)"
                        : "none",
                    border:
                      selectedNoteId === note._id
                        ? "2px solid #3b82f6"
                        : "none",

                    backgroundColor:
                      selectedNoteId === note._id
                        ? "rgba(59,130,246,0.08)"
                        : "transparent",

                    borderRadius: "8px",

                    padding:
                      selectedNoteId === note._id
                        ? "8px"
                        : "0",

                    transition:
                      "all 0.3s ease"
                  }}
                >

                <h3>
                  {note.pinned && "📌 "}
                  {note.favorite && "⭐ "}
                  Title: {note.title}
                </h3>

                <p>
                  Description: {note.content}
                </p>

                <p>
                  Tags:{" "}
                  {
                    note.tags.join(
                      ", "
                    )
                  }
                </p>

                <div className="action-buttons">

                  <button
                    onClick={() =>
                      startEdit(
                        note
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
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
                    onClick={() =>
                      handleDelete(
                        note._id
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

export default Notes;