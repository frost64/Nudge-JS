import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { LayoutContext } from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import noteLightBg from "../assets/backgrounds/note-light.png";
import noteDarkBg from "../assets/backgrounds/note-dark.png";
import logo from "../assets/Logo.svg";
import AutocompleteInput from "../components/AutocompleteInput";

function Notes() {
  const { user } = useContext(AuthContext);
  const { isMobile } = useContext(LayoutContext);
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
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
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

  const fetchNotes = async () => {
  try {
    const res = await api.get("/notes");
    setNotes(res.data.data);
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

const getBase64Image = (imgUrl) =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = imgUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };
  });




const downloadSelectedNotes = async () => {
  const selected = notes.filter((note) =>
    selectedNotes.includes(note._id)
  );

  if (selected.length === 0) {
    toast.error("Please select at least one note.");
    return;
  }

  const logoData = await getBase64Image(logo);

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;

  const margin = 18;
  const usableWidth = pageWidth - margin * 2;

  let y = 22;

  // ---------------- HEADER ----------------

  const drawHeader = (firstPage = false) => {
    if (firstPage) {
      doc.addImage(logoData, "PNG", margin, 12, 11, 11);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(32, 118, 199);

    doc.text(
      "Nudge Notes",
      firstPage ? margin + 15 : margin,
      20
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);

    doc.text(
      "Generated by Nudge",
      firstPage ? margin + 15 : margin,
      26
    );

    doc.text(
      new Date().toLocaleDateString("en-GB"),
      pageWidth - margin,
      20,
      { align: "right" }
    );

    doc.setDrawColor(220);
    doc.line(
      margin,
      32,
      pageWidth - margin,
      32
    );

    y = 42;
  };

  // First page header
  drawHeader(true);

  // ---------------- NOTES ----------------

  selected.forEach((note) => {

    // Set font BEFORE wrapping so splitTextToSize measures at the same
    // size the description is actually drawn with.
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const wrappedContent = note.content
  .split("\n")
  .flatMap((paragraph) => {

    // Preserve blank lines
    if (paragraph.trim() === "") {
      return [""];
    }

    return doc.splitTextToSize(
      paragraph,
      usableWidth
    );
  });

    // Rough estimate to determine if a new page is needed
    const estimatedHeight =
      wrappedContent.length * 6 +
      45;

    if (y + estimatedHeight > pageHeight - 25) {
      doc.addPage();
      drawHeader(false);
    }

    // ---------- TITLE ----------

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(25);

    doc.text("Title:", margin, y);

    doc.setFont("helvetica", "normal");
    doc.text(
      note.title,
      margin + 18,
      y
    );

    y += 9;

    // ---------- DESCRIPTION ----------

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text(
      "Description:",
      margin,
      y
    );

    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    wrappedContent.forEach((line) => {

      if (y > pageHeight - 25) {
        doc.addPage();
        drawHeader(false);
      }

      if (line === "") {
        // Preserve blank lines between paragraphs
        y += 6;
        return;
      }

      doc.text(
        line,
        margin,
        y
      );

      y += 6;
    });

    y += 3;

    // ---------- TAGS ----------

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.setTextColor(25);

    doc.text("Tags:", margin, y);

    let x = margin + 14;

    note.tags.forEach((tag) => {

      const width =
        doc.getTextWidth(tag) + 8;

      if (x + width > pageWidth - margin) {
        x = margin + 14;
        y += 8;
      }

      doc.setFillColor(
        32,
        118,
        199
      );

      doc.roundedRect(
        x,
        y - 4,
        width,
        6,
        2,
        2,
        "F"
      );

      doc.setTextColor(255);

      doc.setFontSize(9);
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        tag,
        x + 4,
        y
      );

      x += width + 4;
    });

    y += 10;

    // ---------- PAGE BREAK CHECK (tags may have wrapped past bottom) ----------

    if (y > pageHeight - 25) {
      doc.addPage();
      drawHeader(false);
    }

    // ---------- CREATED ----------

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(140);

    doc.text(
      `Created: ${new Date(
        note.createdAt
      ).toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      pageWidth - margin,
      y,
      {
        align: "right",
      }
    );

    y += 6;

    // ---------- DIVIDER ----------

    doc.setDrawColor(225);

    doc.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 10;
  });

  // ---------------- FOOTER ----------------

  const pages =
    doc.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {

    doc.setPage(i);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.setTextColor(150);

    doc.text(
      `Page ${i} of ${pages}`,
      pageWidth / 2,
      pageHeight - 10,
      {
        align: "center",
      }
    );
  }

  doc.save("Nudge Notes.pdf");

  toast.success(
    "PDF downloaded successfully."
  );

  setShowDownloadModal(false);
  setSelectedNotes([]);
};



const toggleSelectedNote = (id) => {
  setSelectedNotes((prev) =>
    prev.includes(id)
      ? prev.filter((noteId) => noteId !== id)
      : [...prev, id]
  );
};
const toggleSelectAll = () => {
  if (selectedNotes.length === notes.length) {
    setSelectedNotes([]);
  } else {
    setSelectedNotes(notes.map((note) => note._id));
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
    position: isMobile ? "static" : "fixed",
    top: isMobile ? undefined : "15%",
    left: isMobile ? undefined : "2%",
    width: isMobile ? "100%" : "20%",
    minHeight: isMobile ? "auto" : "75%",
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
      blurBackground={showForm || showDownloadModal}
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

          <AutocompleteInput
            value={tags}
            onChange={setTags}
            options={allTags}
            placeholder="Create/Select Tags"
            multiple
            darkMode={darkMode}
          />
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


{showDownloadModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflowY: "auto",      // add this
      padding: "40px 20px",
      zIndex: 1100,
    }}
  >
    <Card
      variant="glass"
      style={{
        width: "100%",
        maxWidth: "450px",
        maxHeight: "75vh",

        display: "flex",
        flexDirection: "column",

        padding: "30px",
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
      <h2 style={{ marginBottom: "18px" }}>
          Download Notes
      </h2>

      

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            minHeight: 0,
            paddingRight: "6px",
          }}
        >
        {notes.map((note) => (
          <label
            key={note._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              border: selectedNotes.includes(note._id)
                ? "1px solid rgba(0,190,159,.6)"
                : "1px solid rgba(0,190,159,.6)",
              background: selectedNotes.includes(note._id)
                ? "rgba(0,190,159,.12)"
                : "rgba(255,255,255,.04)",
              transition: ".2s",
            }}
          >
              <input
                type="checkbox"
                checked={selectedNotes.includes(note._id)}
                onChange={() => toggleSelectedNote(note._id)}
                style={{
                  width: "18px",
                  height: "18px",
                  margin: 0,
                }}
              />

              <strong>{note.title}</strong>
          </label>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button
          className="glow-top"
          onClick={toggleSelectAll}
        >
          {selectedNotes.length === notes.length
            ? "Deselect All"
            : "Select All"}
        </button>
        
        <button
          className="glow-top"
          onClick={downloadSelectedNotes}
        >
          Download PDF
        </button>

        <button
          className="glow-top delete"
          onClick={() => {
            setShowDownloadModal(false);
            setSelectedNotes([]);
          }}
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

    <div
      style={{
        display: "flex",
        gap: "12px",
      }}
    >
      <button
        className="glow-top"
        onClick={() => setShowDownloadModal(true)}
      >
        📄 Download PDF
      </button>

      <button
        className="glow-top"
        style={{
          padding: "12px 22px",
          fontSize: "1rem",
        }}
        onClick={() => setShowForm(true)}
      >
        📝 Create Note
      </button>
    </div>
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