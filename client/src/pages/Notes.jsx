import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

import {
  FaAlignLeft,
  FaArrowLeft,
  FaClock,
  FaDownload,
  FaEdit,
  FaHeading,
  FaPlus,
  FaStar,
  FaStickyNote,
  FaTags,
  FaThumbtack,
  FaTrash,
} from "react-icons/fa";
import {
  MdFavorite,
  MdFavoriteBorder,
} from "react-icons/md";

import logo from "../assets/Logo.svg";
import noteDarkBg from "../assets/backgrounds/note-dark.png";
import noteLightBg from "../assets/backgrounds/note-light.png";

import AutocompleteInput from "../components/AutocompleteInput";
import Card from "../components/Card";
import GlassModal from "../components/GlassModal";
import Layout from "../components/Layout";

import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";

import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";

const HIGHLIGHT_DURATION = 1200;

const NORMAL_HIGHLIGHT_SHADOW = `
  0 0 25px rgba(0,255,204,.45),
  0 0 70px rgba(0,255,204,.18),
  0 20px 60px rgba(0,0,0,.45)
`;

const PINNED_HIGHLIGHT_SHADOW = `
  0 0 25px rgba(255,215,0,.45),
  0 0 70px rgba(255,215,0,.18),
  0 20px 60px rgba(0,0,0,.45)
`;

/**
 * Converts an image URL into a base64 PNG for jsPDF.
 */
function getBase64Image(imageUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        const canvas =
          document.createElement("canvas");

        canvas.width =
          image.naturalWidth ||
          image.width;

        canvas.height =
          image.naturalHeight ||
          image.height;

        const context =
          canvas.getContext("2d");

        if (!context) {
          reject(
            new Error(
              "Unable to create image canvas."
            )
          );

          return;
        }

        context.drawImage(
          image,
          0,
          0
        );

        resolve(
          canvas.toDataURL(
            "image/png"
          )
        );
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      reject(
        new Error(
          "Unable to load the Nudge logo."
        )
      );
    };

    image.src = imageUrl;
  });
}

/**
 * Formats a note creation date for display and PDF export.
 */
function formatCreatedAt(value) {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Unknown";
  }

  return date.toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

/**
 * Notes page with create, edit, pin, favorite,
 * delete, and PDF export features.
 */
function Notes() {
  const { user } =
    useContext(AuthContext);

  const {
    isMobile,
    isTablet,
  } = useBreakpoint();

  const confirm = useConfirm();
  const location = useLocation();

  const [
    notes,
    setNotes,
  ] = useState([]);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    content,
    setContent,
  ] = useState("");

  const [
    tags,
    setTags,
  ] = useState("");

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    showDownloadModal,
    setShowDownloadModal,
  ] = useState(false);

  const [
    selectedNotes,
    setSelectedNotes,
  ] = useState([]);

  const [
    highlightId,
    setHighlightId,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    exporting,
    setExporting,
  ] = useState(false);

  const noteRefs = useRef({});

  const highlightTimeoutRef =
    useRef(null);

  const firstInputRef =
    useRef(null);

  const darkMode =
    user?.theme === "dark";

  const backgroundImage = darkMode
    ? noteDarkBg
    : noteLightBg;

  const searchParams = useMemo(
    () =>
      new URLSearchParams(
        location.search
      ),
    [location.search]
  );

  const selectedNoteId =
    searchParams.get("noteId");

  const shouldCreate =
    searchParams.get("create");

  const allTags = useMemo(
    () =>
      [
        ...new Set(
          notes.flatMap((note) =>
            Array.isArray(note.tags)
              ? note.tags
              : []
          )
        ),
      ].sort((a, b) =>
        a.localeCompare(b)
      ),
    [notes]
  );

  const recentNotes = useMemo(
    () =>
      [...notes]
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )
        .slice(0, 5),
    [notes]
  );

  const selectedNoteSet = useMemo(
    () =>
      new Set(selectedNotes),
    [selectedNotes]
  );

  const allNotesSelected =
    notes.length > 0 &&
    selectedNotes.length ===
      notes.length;

  const resetForm = useCallback(
    () => {
      setTitle("");
      setContent("");
      setTags("");
      setEditingId(null);
    },
    []
  );

  const closeForm = useCallback(
    () => {
      if (saving) {
        return;
      }

      resetForm();
      setShowForm(false);
    },
    [resetForm, saving]
  );

  const closeDownloadModal =
    useCallback(() => {
      if (exporting) {
        return;
      }

      setShowDownloadModal(false);
      setSelectedNotes([]);
    }, [exporting]);

  const fetchNotes =
    useCallback(async (signal) => {
      try {
        const response =
          await api.get(
            "/notes",
            {
              signal,
            }
          );

        setNotes(
          Array.isArray(
            response.data?.data
          )
            ? response.data.data
            : []
        );
      } catch (error) {
        if (
          error.name ===
            "CanceledError" ||
          error.code ===
            "ERR_CANCELED"
        ) {
          return;
        }

        console.error(error);

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to load notes."
        );
      }
    }, []);

  const highlightNote =
    useCallback((id) => {
      setHighlightId(id);

      noteRefs.current[
        id
      ]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      if (
        highlightTimeoutRef.current
      ) {
        window.clearTimeout(
          highlightTimeoutRef.current
        );
      }

      highlightTimeoutRef.current =
        window.setTimeout(() => {
          setHighlightId(null);
        }, HIGHLIGHT_DURATION);
    }, []);

  const handleSave =
    useCallback(async () => {
      if (saving) {
        return;
      }

      const normalizedTitle =
        title.trim();

      const normalizedContent =
        content.trim();

      const normalizedTags = [
        ...new Set(
          tags
            .split(",")
            .map((tag) =>
              tag.trim()
            )
            .filter(Boolean)
        ),
      ];

      if (!normalizedTitle) {
        toast.error(
          "Title is required."
        );

        return;
      }

      if (!normalizedContent) {
        toast.error(
          "Description is required."
        );

        return;
      }

      if (
        normalizedTags.length === 0
      ) {
        toast.error(
          "Please add at least one tag."
        );

        return;
      }

      const noteData = {
        title: normalizedTitle,
        content: normalizedContent,
        tags: normalizedTags,
      };

      try {
        setSaving(true);

        if (editingId) {
          await api.put(
            `/notes/${editingId}`,
            noteData
          );

          toast.success(
            "Note updated successfully."
          );
        } else {
          await api.post(
            "/notes",
            noteData
          );

          toast.success(
            "Note added successfully."
          );
        }

        closeForm();

        await fetchNotes();
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to save note."
        );
      } finally {
        setSaving(false);
      }
    }, [
      closeForm,
      content,
      editingId,
      fetchNotes,
      saving,
      tags,
      title,
    ]);

  const startEdit = useCallback(
    (note) => {
      setEditingId(note._id);
      setTitle(note.title || "");
      setContent(
        note.content || ""
      );

      setTags(
        Array.isArray(note.tags)
          ? note.tags.join(", ")
          : ""
      );

      setShowForm(true);
    },
    []
  );

  const handleDelete =
    useCallback(
      async (id) => {
        const confirmed =
          await confirm({
            title: "Delete Note",

            message:
              "Are you sure you want to delete this note? This action cannot be undone.",

            confirmText: "Delete",
            cancelText: "Cancel",
          });

        if (!confirmed) {
          return;
        }

        try {
          await api.delete(
            `/notes/${id}`
          );

          toast.success(
            "Note deleted successfully."
          );

          await fetchNotes();
        } catch (error) {
          console.error(error);

          toast.error(
            error.response?.data
              ?.message ||
              "Failed to delete note."
          );
        }
      },
      [confirm, fetchNotes]
    );

  const handlePin = useCallback(
    async (id) => {
      try {
        await api.patch(
          `/notes/${id}/pin`
        );

        toast.success(
          "Pin updated."
        );

        await fetchNotes();

        highlightNote(id);
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to update note."
        );
      }
    },
    [fetchNotes, highlightNote]
  );

  const handleFavorite =
    useCallback(
      async (id) => {
        try {
          await api.patch(
            `/notes/${id}/favorite`
          );

          toast.success(
            "Favorite updated."
          );

          await fetchNotes();
        } catch (error) {
          console.error(error);

          toast.error(
            error.response?.data
              ?.message ||
              "Failed to update favorite."
          );
        }
      },
      [fetchNotes]
    );

  const toggleSelectedNote =
    useCallback((id) => {
      setSelectedNotes(
        (current) =>
          current.includes(id)
            ? current.filter(
                (noteId) =>
                  noteId !== id
              )
            : [...current, id]
      );
    }, []);

  const toggleSelectAll =
    useCallback(() => {
      setSelectedNotes(
        (current) =>
          current.length ===
          notes.length
            ? []
            : notes.map(
                (note) =>
                  note._id
              )
      );
    }, [notes]);

  const downloadSelectedNotes =
    useCallback(async () => {
      if (exporting) {
        return;
      }

      const selected =
        notes.filter((note) =>
          selectedNoteSet.has(
            note._id
          )
        );

      if (selected.length === 0) {
        toast.error(
          "Please select at least one note."
        );

        return;
      }

      try {
        setExporting(true);

        const logoData =
          await getBase64Image(
            logo
          );

        const documentPdf =
          new jsPDF({
            unit: "mm",
            format: "a4",
          });

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 18;

        const usableWidth =
          pageWidth - margin * 2;

        let y = 22;

        const drawHeader = (
          firstPage = false
        ) => {
          if (firstPage) {
            documentPdf.addImage(
              logoData,
              "PNG",
              margin,
              12,
              11,
              11
            );
          }

          documentPdf.setFont(
            "helvetica",
            "bold"
          );

          documentPdf.setFontSize(
            20
          );

          documentPdf.setTextColor(
            32,
            118,
            199
          );

          documentPdf.text(
            "Nudge Notes",
            firstPage
              ? margin + 15
              : margin,
            20
          );

          documentPdf.setFont(
            "helvetica",
            "normal"
          );

          documentPdf.setFontSize(
            9
          );

          documentPdf.setTextColor(
            120
          );

          documentPdf.text(
            "Generated by Nudge",
            firstPage
              ? margin + 15
              : margin,
            26
          );

          documentPdf.text(
            new Date().toLocaleDateString(
              "en-GB"
            ),
            pageWidth - margin,
            20,
            {
              align: "right",
            }
          );

          documentPdf.setDrawColor(
            220
          );

          documentPdf.line(
            margin,
            32,
            pageWidth - margin,
            32
          );

          y = 42;
        };

        const addPageIfNeeded = (
          requiredHeight = 0
        ) => {
          if (
            y + requiredHeight <=
            pageHeight - 25
          ) {
            return;
          }

          documentPdf.addPage();
          drawHeader(false);
        };

        drawHeader(true);

        selected.forEach((note) => {
          documentPdf.setFont(
            "helvetica",
            "normal"
          );

          documentPdf.setFontSize(
            11
          );

          const wrappedContent =
            String(
              note.content || ""
            )
              .split("\n")
              .flatMap(
                (paragraph) =>
                  paragraph.trim()
                    ? documentPdf.splitTextToSize(
                        paragraph,
                        usableWidth
                      )
                    : [""]
              );

          addPageIfNeeded(
            wrappedContent.length *
              6 +
              45
          );

          documentPdf.setFont(
            "helvetica",
            "bold"
          );

          documentPdf.setFontSize(
            14
          );

          documentPdf.setTextColor(
            25
          );

          documentPdf.text(
            "Title:",
            margin,
            y
          );

          documentPdf.setFont(
            "helvetica",
            "normal"
          );

          const wrappedTitle =
            documentPdf.splitTextToSize(
              String(
                note.title ||
                  "Untitled"
              ),
              usableWidth - 18
            );

          documentPdf.text(
            wrappedTitle,
            margin + 18,
            y
          );

          y += Math.max(
            9,
            wrappedTitle.length * 6
          );

          documentPdf.setFont(
            "helvetica",
            "bold"
          );

          documentPdf.setFontSize(
            11
          );

          documentPdf.text(
            "Description:",
            margin,
            y
          );

          y += 7;

          documentPdf.setFont(
            "helvetica",
            "normal"
          );

          wrappedContent.forEach(
            (line) => {
              addPageIfNeeded(6);

              if (line === "") {
                y += 6;
                return;
              }

              documentPdf.text(
                line,
                margin,
                y
              );

              y += 6;
            }
          );

          y += 3;

          addPageIfNeeded(12);

          documentPdf.setFont(
            "helvetica",
            "bold"
          );

          documentPdf.setFontSize(
            11
          );

          documentPdf.setTextColor(
            25
          );

          documentPdf.text(
            "Tags:",
            margin,
            y
          );

          let x = margin + 14;

          const noteTags =
            Array.isArray(
              note.tags
            )
              ? note.tags
              : [];

          noteTags.forEach(
            (tag) => {
              const tagText =
                String(tag);

              const tagWidth =
                documentPdf.getTextWidth(
                  tagText
                ) + 8;

              if (
                x + tagWidth >
                pageWidth - margin
              ) {
                x = margin + 14;
                y += 8;

                addPageIfNeeded(
                  8
                );
              }

              documentPdf.setFillColor(
                32,
                118,
                199
              );

              documentPdf.roundedRect(
                x,
                y - 4,
                tagWidth,
                6,
                2,
                2,
                "F"
              );

              documentPdf.setTextColor(
                255
              );

              documentPdf.setFontSize(
                9
              );

              documentPdf.setFont(
                "helvetica",
                "bold"
              );

              documentPdf.text(
                tagText,
                x + 4,
                y
              );

              x +=
                tagWidth + 4;
            }
          );

          y += 10;

          addPageIfNeeded(12);

          documentPdf.setFont(
            "helvetica",
            "normal"
          );

          documentPdf.setFontSize(
            8
          );

          documentPdf.setTextColor(
            140
          );

          documentPdf.text(
            `Created: ${formatCreatedAt(
              note.createdAt
            )}`,
            pageWidth - margin,
            y,
            {
              align: "right",
            }
          );

          y += 6;

          documentPdf.setDrawColor(
            225
          );

          documentPdf.line(
            margin,
            y,
            pageWidth - margin,
            y
          );

          y += 10;
        });

        const pageCount =
          documentPdf.getNumberOfPages();

        for (
          let page = 1;
          page <= pageCount;
          page += 1
        ) {
          documentPdf.setPage(page);

          documentPdf.setFont(
            "helvetica",
            "normal"
          );

          documentPdf.setFontSize(
            9
          );

          documentPdf.setTextColor(
            150
          );

          documentPdf.text(
            `Page ${page} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            {
              align: "center",
            }
          );
        }

        documentPdf.save(
          "Nudge Notes.pdf"
        );

        toast.success(
          "PDF downloaded successfully."
        );

        closeDownloadModal();
      } catch (error) {
        console.error(error);

        toast.error(
          "Failed to generate the PDF."
        );
      } finally {
        setExporting(false);
      }
    }, [
      closeDownloadModal,
      exporting,
      notes,
      selectedNoteSet,
    ]);

  useEffect(() => {
    const controller =
      new AbortController();

    fetchNotes(
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, [fetchNotes]);

  useEffect(() => {
    if (
      selectedNoteId &&
      noteRefs.current[
        selectedNoteId
      ]
    ) {
      highlightNote(
        selectedNoteId
      );
    }
  }, [
    highlightNote,
    notes,
    selectedNoteId,
  ]);

  useEffect(() => {
    if (
      shouldCreate === "true"
    ) {
      resetForm();
      setShowForm(true);
    }
  }, [
    resetForm,
    shouldCreate,
  ]);

  useEffect(() => {
    if (showForm) {
      window.requestAnimationFrame(
        () => {
          firstInputRef.current?.focus();
        }
      );
    }
  }, [showForm]);

  useEffect(() => {
    if (
      !showForm &&
      !showDownloadModal
    ) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    showDownloadModal,
    showForm,
  ]);

  useEffect(
    () => () => {
      if (
        highlightTimeoutRef.current
      ) {
        window.clearTimeout(
          highlightTimeoutRef.current
        );
      }
    },
    []
  );

  const sidebar = useMemo(
    () => (
      <Card
        className="nudge-sidebar"
        variant="glass"
      >
        <h1 className="nudge-sidebar-title">
          <FaStickyNote
            aria-hidden="true"
          />

          <span>Recent Notes</span>
        </h1>

        {recentNotes.length ===
        0 ? (
          <p className="nudge-sidebar-empty">
            No recent notes
          </p>
        ) : (
          <nav
            className="nudge-sidebar-actions"
            aria-label="Recent notes"
          >
            {recentNotes.map(
              (note) => (
                <button
                  key={note._id}
                  type="button"
                  className="glow-top left nudge-sidebar-button"
                  onClick={() =>
                    highlightNote(
                      note._id
                    )
                  }
                >
                  <span className="nudge-sidebar-button-text">
                    {note.title}
                  </span>
                </button>
              )
            )}
          </nav>
        )}
      </Card>
    ),
    [highlightNote, recentNotes]
  );

  return (
    <Layout
      sidebar={sidebar}
      sidebarTitle="Recent Notes"
      backgroundImage={
        backgroundImage
      }
      blurBackground={
        showForm ||
        showDownloadModal
      }
      cardVariant="glass"
    >
      {showForm && (
        <GlassModal
          ariaLabel={
            editingId
              ? "Edit note"
              : "Create note"
          }
        >
          <Card
            variant="glass"
            style={{
              width: "100%",
              maxWidth: "430px",
              minWidth: 0,

              maxHeight:
                isMobile || isTablet
                  ? `
                      calc(
                        100dvh -
                        var(
                          --navbar-top-offset,
                          6px
                        ) -
                        var(
                          --navbar-height,
                          70px
                        ) -
                        54px -
                        env(
                          safe-area-inset-top
                        ) -
                        env(
                          safe-area-inset-bottom
                        )
                      )
                    `
                  : "calc(100dvh - 80px)",

              margin: 0,

              padding: isMobile
                ? "20px"
                : isTablet
                  ? "24px"
                  : "28px",

              boxSizing: "border-box",

              overflowX: "hidden",
              overflowY: "auto",

              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",

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
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",

                marginTop: 0,

                marginBottom:
                  isMobile
                    ? "14px"
                    : "18px",

                fontSize: isMobile
                  ? "1.3rem"
                  : undefined,
              }}
            >
              {editingId ? (
                <>
                  <FaEdit
                    aria-hidden="true"
                  />

                  Edit Note
                </>
              ) : (
                <>
                  <FaStickyNote
                    aria-hidden="true"
                  />

                  New Note
                </>
              )}
            </h2>

            <div
              style={{
                display: "flex",

                flexDirection:
                  "column",

                gap: isMobile
                  ? "12px"
                  : "15px",
              }}
            >
              <div className="input-icon-wrapper">
                <FaHeading
                  className="input-icon"
                  aria-hidden="true"
                />

                <input
                  ref={firstInputRef}
                  className="input-glow"
                  type="text"
                  name="title"
                  autoComplete="off"
                  placeholder="Title"
                  value={title}
                  disabled={saving}
                  onChange={(
                    event
                  ) =>
                    setTitle(
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <div className="input-icon-wrapper">
                <FaAlignLeft
                  className="input-icon textarea-icon"
                  aria-hidden="true"
                />

                <textarea
                  className="input-glow"
                  name="content"
                  placeholder="Note Description"
                  rows={
                    isMobile
                      ? 5
                      : isTablet
                        ? 7
                        : 10
                  }
                  value={content}
                  disabled={saving}
                  onChange={(event) =>
                    setContent(event.target.value)
                  }
                  style={{
                    resize: "vertical",

                    minHeight: isMobile
                      ? "120px"
                      : isTablet
                        ? "160px"
                        : "220px",
                  }}
                />
              </div>

              <div className="input-icon-wrapper">
                <FaTags
                  className="input-icon"
                  aria-hidden="true"
                />

                <AutocompleteInput
                  value={tags}
                  onChange={setTags}
                  options={allTags}
                  placeholder="Create/Select Tags"
                  multiple
                  darkMode={darkMode}
                  className="input-glow"
                  emptyMessage="No matching tags"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",

                flexDirection:
                  isMobile
                    ? "column-reverse"
                    : "row",

                justifyContent:
                  isMobile
                    ? "stretch"
                    : "flex-end",

                gap: "10px",

                marginTop:
                  isMobile
                    ? "14px"
                    : "20px",
              }}
            >
              <button
                type="button"
                className="glow-top delete"
                disabled={saving}
                onClick={closeForm}
                style={{
                  width: isMobile
                    ? "100%"
                    : "auto",

                  margin: 0,

                  padding: isMobile
                    ? "10px 12px"
                    : undefined,
                }}
              >
                <FaArrowLeft
                  aria-hidden="true"
                  style={{
                    marginRight:
                      "6px",
                  }}
                />

                Cancel
              </button>

              <button
                type="button"
                className="glow-top"
                disabled={saving}
                aria-busy={saving}
                onClick={handleSave}
                style={{
                  width: isMobile
                    ? "100%"
                    : "auto",

                  margin: 0,

                  padding: isMobile
                    ? "10px 12px"
                    : undefined,
                }}
              >
                {editingId ? (
                  <>
                    <FaEdit
                      aria-hidden="true"
                      size={13}
                      style={{
                        marginRight:
                          "6px",
                      }}
                    />

                    {saving
                      ? "Updating..."
                      : "Update Note"}
                  </>
                ) : (
                  <>
                    <FaPlus
                      aria-hidden="true"
                      size={13}
                      style={{
                        marginRight:
                          "6px",
                      }}
                    />

                    {saving
                      ? "Adding..."
                      : "Add Note"}
                  </>
                )}
              </button>
            </div>
          </Card>
        </GlassModal>
      )}

      {showDownloadModal && (
        <GlassModal ariaLabel="Download notes">
          <Card
            variant="glass"
            style={{
              display: "flex",

              flexDirection:
                "column",

              width: isMobile
                ? "calc(100% - 28px)"
                : "100%",

              maxWidth: isMobile
                ? "390px"
                : "470px",

              maxHeight: isMobile
                ? "84dvh"
                : "75dvh",

              minWidth: 0,

              margin: "auto",

              padding: isMobile
                ? "16px"
                : "30px",

              borderRadius:
                isMobile
                  ? "20px"
                  : "24px",

              boxSizing:
                "border-box",

              overflow: "hidden",

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
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",

                marginTop: 0,

                marginBottom:
                  isMobile
                    ? "14px"
                    : "18px",

                fontSize: isMobile
                  ? "1.3rem"
                  : undefined,
              }}
            >
              <FaDownload
                aria-hidden="true"
              />

              Download Notes
            </h2>

            <div
              style={{
                display: "flex",

                flexDirection:
                  "column",

                flexGrow: 1,
                flexShrink: 1,
                flexBasis: "auto",

                minHeight: 0,

                gap: isMobile
                  ? "8px"
                  : "10px",

                paddingRight:
                  "6px",

                overflowY: "auto",

                overscrollBehavior:
                  "contain",
              }}
            >
              {notes.map((note) => {
                const selected =
                  selectedNoteSet.has(
                    note._id
                  );

                return (
                  <label
                    key={note._id}
                    style={{
                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap: isMobile
                        ? "10px"
                        : "12px",

                      padding: isMobile
                        ? "10px 12px"
                        : "12px 16px",

                      borderRadius:
                        "12px",

                      cursor:
                        "pointer",

                      border:
                        "1px solid rgba(0,190,159,.6)",

                      background:
                        selected
                          ? "rgba(0,190,159,.12)"
                          : "rgba(255,255,255,.04)",

                      transition:
                        "background .2s ease, border-color .2s ease",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={
                        exporting
                      }
                      onChange={() =>
                        toggleSelectedNote(
                          note._id
                        )
                      }
                      style={{
                        width: "18px",
                        height: "18px",
                        margin: 0,

                        flexShrink: 0,
                      }}
                    />

                    <strong
                      style={{
                        minWidth: 0,

                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      {note.title}
                    </strong>
                  </label>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",

                flexDirection:
                  isMobile
                    ? "column"
                    : "row",

                flexWrap: "wrap",

                gap: "10px",

                marginTop:
                  isMobile
                    ? "14px"
                    : "20px",
              }}
            >
              <button
                type="button"
                className="glow-top"
                disabled={
                  exporting ||
                  notes.length === 0
                }
                onClick={
                  toggleSelectAll
                }
                style={{
                  width: isMobile
                    ? "100%"
                    : "auto",

                  margin: 0,

                  padding: isMobile
                    ? "10px 12px"
                    : undefined,
                }}
              >
                {allNotesSelected
                  ? "Deselect All"
                  : "Select All"}
              </button>

              <button
                type="button"
                className="glow-top"
                disabled={exporting}
                aria-busy={exporting}
                onClick={
                  downloadSelectedNotes
                }
                style={{
                  width: isMobile
                    ? "100%"
                    : "auto",

                  margin: 0,

                  padding: isMobile
                    ? "10px 12px"
                    : undefined,
                }}
              >
                <FaDownload
                  aria-hidden="true"
                  style={{
                    marginRight:
                      "6px",
                  }}
                />

                {exporting
                  ? "Preparing..."
                  : "Download PDF"}
              </button>

              <button
                type="button"
                className="glow-top delete"
                disabled={exporting}
                onClick={
                  closeDownloadModal
                }
                style={{
                  width: isMobile
                    ? "100%"
                    : "auto",

                  margin: 0,

                  padding: isMobile
                    ? "10px 12px"
                    : undefined,
                }}
              >
                <FaArrowLeft
                  aria-hidden="true"
                  style={{
                    marginRight:
                      "6px",
                  }}
                />

                Cancel
              </button>
            </div>
          </Card>
        </GlassModal>
      )}

      <div
        style={{
          display: "flex",

          flexDirection:
            "column",

          width: "100%",
          minWidth: 0,

          gap: isMobile
            ? "20px"
            : "28px",

          padding: isMobile
            ? "0 0 24px"
            : "10px 10px 40px",

          boxSizing:
            "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",

            alignItems: "center",

            justifyContent:
              "space-between",

            width: "100%",
            minWidth: 0,

            gap: isMobile
              ? "8px"
              : "20px",

            marginBottom:
              isMobile
                ? "8px"
                : "20px",
          }}
        >
          <h1
            style={{
              flex: 1,
              minWidth: 0,

              margin: 0,

              fontSize: isMobile
                ? "1.75rem"
                : isTablet
                  ? "2.2rem"
                  : "2.5rem",

              lineHeight: 1.2,

              overflowWrap:
                "anywhere",
            }}
          >
            Notes
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: "row",

              alignItems: "center",

              flexShrink: 0,

              gap: isMobile
                ? "6px"
                : "12px",
            }}
          >
            <button
              type="button"
              className="glow-top"
              onClick={() =>
                setShowDownloadModal(
                  true
                )
              }
              aria-label="Download notes as PDF"
              style={{
                width: "auto",

                margin: 0,

                padding: isMobile
                  ? "9px 10px"
                  : "12px 18px",

                fontSize: isMobile
                  ? ".78rem"
                  : "1rem",

                whiteSpace:
                  "nowrap",
              }}
            >
              <FaDownload
                aria-hidden="true"
                size={
                  isMobile
                    ? 11
                    : 13
                }
                style={{
                  marginRight:
                    "5px",
                }}
              />

              {isMobile
                ? "PDF"
                : "Download PDF"}
            </button>

            <button
              type="button"
              className="glow-top"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              style={{
                width: "auto",

                margin: 0,

                padding: isMobile
                  ? "9px 10px"
                  : "12px 22px",

                fontSize: isMobile
                  ? ".78rem"
                  : "1rem",

                whiteSpace:
                  "nowrap",
              }}
            >
              <FaPlus
                aria-hidden="true"
                size={
                  isMobile
                    ? 11
                    : 13
                }
                style={{
                  marginRight:
                    "5px",
                }}
              />

              {isMobile
                ? "Create"
                : "Create Note"}
            </button>
          </div>
        </div>

        {notes.length === 0 ? (
          <div
            style={{
              padding:
                "50px 20px",

              textAlign:
                "center",

              opacity: 0.8,
            }}
          >
            <FaStickyNote
              aria-hidden="true"
              size={42}
              style={{
                marginBottom:
                  "15px",

                color:
                  "#00be9f",
              }}
            />

            <h2>
              No Notes Yet
            </h2>

            <p
              style={{
                marginBottom: 0,
              }}
            >
              Start capturing your
              ideas by creating your
              first note.
            </p>
          </div>
        ) : (
          notes.map((note) => {
            const tagsList =
              Array.isArray(
                note.tags
              )
                ? note.tags
                : [];

            const highlightShadow =
              highlightId ===
              note._id
                ? note.pinned
                  ? PINNED_HIGHLIGHT_SHADOW
                  : NORMAL_HIGHLIGHT_SHADOW
                : undefined;

            return (
              <Card
                key={note._id}
                ref={(element) => {
                  if (element) {
                    noteRefs.current[
                      note._id
                    ] = element;
                  } else {
                    delete noteRefs.current[
                      note._id
                    ];
                  }
                }}
                variant="glass"
                style={{
                  width: "100%",
                  minWidth: 0,
                  margin: 0,

                  boxShadow:
                    highlightShadow,

                  transition:
                    "background .25s ease, border .25s ease, box-shadow .35s ease",
                }}
              >
                <h3
                  style={{
                    display: "flex",

                    alignItems:
                      "flex-start",

                    justifyContent:
                      "space-between",

                    gap: "12px",

                    marginTop: 0,
                  }}
                >
                  <span
                    style={{
                      minWidth: 0,

                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    <strong>
                      Title:{" "}
                    </strong>

                    {note.title}
                  </span>

                  <span
                    aria-label={[
                      note.pinned
                        ? "Pinned"
                        : null,

                      note.favorite
                        ? "Favorite"
                        : null,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    style={{
                      display:
                        "flex",

                      alignItems:
                        "center",

                      flexShrink: 0,

                      gap: "8px",

                      color:
                        "#f5c542",
                    }}
                  >
                    {note.pinned && (
                      <FaThumbtack
                        aria-hidden="true"
                      />
                    )}

                    {note.favorite && (
                      <FaStar
                        aria-hidden="true"
                      />
                    )}
                  </span>
                </h3>

                <p
                  style={{
                    lineHeight: 1.7,

                    whiteSpace:
                      "pre-wrap",

                    overflowWrap:
                      "anywhere",
                  }}
                >
                  <FaAlignLeft
                    aria-hidden="true"
                    style={{
                      marginRight:
                        "6px",

                      color:
                        "#00be9f",
                    }}
                  />

                  <strong>
                    Description:{" "}
                  </strong>

                  {note.content}
                </p>

                <p
                  style={{
                    lineHeight: 1.7,

                    overflowWrap:
                      "anywhere",
                  }}
                >
                  <FaTags
                    aria-hidden="true"
                    style={{
                      marginRight:
                        "6px",

                      color:
                        "#00be9f",
                    }}
                  />

                  <strong>
                    Tags:{" "}
                  </strong>

                  {tagsList.join(", ")}
                </p>

                <p>
                  <FaClock
                    aria-hidden="true"
                    style={{
                      marginRight:
                        "6px",

                      color:
                        "#00be9f",
                    }}
                  />

                  <strong>
                    Created:{" "}
                  </strong>

                  {formatCreatedAt(
                    note.createdAt
                  )}
                </p>

                <div
                  style={{
                    display: "flex",

                    flexDirection:
                      isMobile
                        ? "column"
                        : "row",

                    flexWrap: "wrap",

                    gap: "10px",

                    marginTop:
                      "16px",
                  }}
                >
                  <button
                    type="button"
                    className="glow-top"
                    onClick={() =>
                      startEdit(note)
                    }
                    style={{
                      width: isMobile
                        ? "100%"
                        : "auto",

                      margin: 0,
                    }}
                  >
                    <FaEdit
                      aria-hidden="true"
                      size={13}
                      style={{
                        marginRight:
                          "6px",
                      }}
                    />

                    Edit
                  </button>

                  <button
                    type="button"
                    className="glow-top"
                    onClick={() =>
                      handlePin(
                        note._id
                      )
                    }
                    style={{
                      width: isMobile
                        ? "100%"
                        : "auto",

                      margin: 0,
                    }}
                  >
                    <FaThumbtack
                      aria-hidden="true"
                      size={13}
                      style={{
                        marginRight:
                          "6px",
                      }}
                    />

                    {note.pinned
                      ? "Unpin"
                      : "Pin"}
                  </button>

                  <button
                    type="button"
                    className="glow-top"
                    onClick={() =>
                      handleFavorite(
                        note._id
                      )
                    }
                    style={{
                      width: isMobile
                        ? "100%"
                        : "auto",

                      margin: 0,
                    }}
                  >
                    {note.favorite ? (
                      <MdFavorite
                        aria-hidden="true"
                        size={15}
                        style={{
                          marginRight:
                            "5px",
                        }}
                      />
                    ) : (
                      <MdFavoriteBorder
                        aria-hidden="true"
                        size={15}
                        style={{
                          marginRight:
                            "5px",
                        }}
                      />
                    )}

                    {note.favorite
                      ? "Unfavorite"
                      : "Favorite"}
                  </button>

                  <button
                    type="button"
                    className="glow-top delete"
                    onClick={() =>
                      handleDelete(
                        note._id
                      )
                    }
                    style={{
                      width: isMobile
                        ? "100%"
                        : "auto",

                      margin: 0,
                    }}
                  >
                    <FaTrash
                      aria-hidden="true"
                      size={13}
                      style={{
                        marginRight:
                          "6px",
                      }}
                    />

                    Delete
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </Layout>
  );
}

export default Notes;