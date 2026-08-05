import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";

import {
  FaArrowLeft,
  FaEdit,
  FaFileCsv,
  FaFileExport,
  FaFilePdf,
  FaHeading,
  FaLink,
  FaPlus,
  FaStar,
  FaStickyNote,
  FaTags,
  FaTrash,
} from "react-icons/fa";
import {
  MdFavorite,
  MdFavoriteBorder,
} from "react-icons/md";

import logo from "../assets/Logo.svg";
import linkDarkBg from "../assets/backgrounds/link-dark.png";
import linkLightBg from "../assets/backgrounds/link-light.png";

import AutocompleteInput from "../components/AutocompleteInput";
import Card from "../components/Card";
import GlassModal from "../components/GlassModal";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";

const HIGHLIGHT_DURATION = 1200;

const HIGHLIGHT_SHADOW = `
  0 0 25px rgba(0,255,204,.45),
  0 0 70px rgba(0,255,204,.18),
  0 20px 60px rgba(0,0,0,.45)
`;

const EMPTY_FORM = {
  title: "",
  url: "",
  category: "",
  notes: "",
};

/**
 * Converts an image URL into a base64 PNG string for jsPDF.
 */
function getBase64Image(imageUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Unable to create image canvas."));
          return;
        }

        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      reject(new Error("Unable to load the Nudge logo."));
    };

    image.src = imageUrl;
  });
}

/**
 * Normalizes user-entered URLs so external links and exports remain valid.
 */
function normalizeUrl(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "";

  return /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;
}

/**
 * Links workspace with create, edit, favorite, delete, and export features.
 */
function Links() {
  const { user } = useContext(AuthContext);
  const confirm = useConfirm();
  const { isMobile, isTablet } = useBreakpoint();
  const location = useLocation();

  const darkMode = user?.theme === "dark";
  const backgroundImage = darkMode
    ? linkDarkBg
    : linkLightBg;

  const [links, setLinks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [highlightId, setHighlightId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const linkRefs = useRef({});
  const highlightTimeoutRef = useRef(null);
  const firstInputRef = useRef(null);

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const selectedLinkId = searchParams.get("linkId");
  const shouldCreate = searchParams.get("create");

  const favoriteLinks = useMemo(
    () => links.filter((link) => link.favorite).slice(0, 5),
    [links]
  );

  const linkCategories = useMemo(
    () =>
      [...new Set(
        links
          .map((link) => link.category?.trim())
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b)),
    [links]
  );

  const selectedLinkSet = useMemo(
    () => new Set(selectedLinks),
    [selectedLinks]
  );

  const selectedLinkRecords = useMemo(
    () => links.filter((link) => selectedLinkSet.has(link._id)),
    [links, selectedLinkSet]
  );

  const allLinksSelected =
    links.length > 0 && selectedLinks.length === links.length;

  const fetchLinks = useCallback(async (signal) => {
    try {
      const response = await api.get("/links", { signal });
      setLinks(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      if (
        error.name === "CanceledError" ||
        error.code === "ERR_CANCELED"
      ) {
        return;
      }

      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to load links."
      );
    }
  }, []);

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }, []);

  const closeForm = useCallback(() => {
    resetForm();
    setShowForm(false);
  }, [resetForm]);

  const openCreateForm = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const updateFormField = useCallback((field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const startEdit = useCallback((link) => {
    setEditingId(link._id);
    setForm({
      title: link.title || "",
      url: link.url || "",
      category: link.category || "",
      notes: link.notes || "",
    });
    setShowForm(true);
  }, []);

  const highlightLink = useCallback((id) => {
    setHighlightId(id);

    linkRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightId(null);
    }, HIGHLIGHT_DURATION);
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedTitle = form.title.trim();
    const normalizedLinkUrl = normalizeUrl(form.url);
    const trimmedCategory = form.category.trim();
    const trimmedNotes = form.notes.trim();

    if (!trimmedTitle) {
      toast.error("Title is required");
      return;
    }

    if (!normalizedLinkUrl) {
      toast.error("URL is required");
      return;
    }

    if (!trimmedCategory) {
      toast.error("Category is required");
      return;
    }

    if (!trimmedNotes) {
      toast.error("Description is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: trimmedTitle,
        url: normalizedLinkUrl,
        category: trimmedCategory,
        notes: trimmedNotes,
      };

      if (editingId) {
        await api.put(`/links/${editingId}`, payload);
      } else {
        await api.post("/links", payload);
      }

      toast.success(
        editingId
          ? "Link updated successfully."
          : "Link added successfully."
      );

      closeForm();
      await fetchLinks();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save link."
      );
    } finally {
      setSaving(false);
    }
  }, [closeForm, editingId, fetchLinks, form]);

  const handleDelete = useCallback(
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
        await api.delete(`/links/${id}`);

        setSelectedLinks((current) =>
          current.filter((linkId) => linkId !== id)
        );

        toast.success("Link deleted successfully.");
        await fetchLinks();
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
            "Failed to delete link."
        );
      }
    },
    [confirm, fetchLinks]
  );

  const handleFavorite = useCallback(
    async (id) => {
      try {
        await api.patch(`/links/${id}/favorite`);
        await fetchLinks();
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
            "Failed to update favorite."
        );
      }
    },
    [fetchLinks]
  );

  const toggleSelectedLink = useCallback((id) => {
    setSelectedLinks((current) =>
      current.includes(id)
        ? current.filter((linkId) => linkId !== id)
        : [...current, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedLinks((current) =>
      current.length === links.length
        ? []
        : links.map((link) => link._id)
    );
  }, [links]);

  const closeDownloadModal = useCallback(() => {
    setShowDownloadModal(false);
    setSelectedLinks([]);
  }, []);

  const downloadLinksCSV = useCallback(() => {
    if (selectedLinkRecords.length === 0) {
      toast.error("Please select at least one link.");
      return;
    }

    const rows = [
      [
        "Title",
        "URL",
        "Category",
        "Description",
        "Favorite",
        "Created",
      ],
      ...selectedLinkRecords.map((link) => [
        link.title,
        link.url,
        link.category,
        link.notes,
        link.favorite ? "Yes" : "No",
        new Date(link.createdAt).toLocaleString("en-GB"),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = downloadUrl;
    anchor.download = "Nudge Links.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(downloadUrl);

    toast.success("CSV downloaded successfully.");
    closeDownloadModal();
  }, [closeDownloadModal, selectedLinkRecords]);

  const downloadLinksPDF = useCallback(async () => {
    if (selectedLinkRecords.length === 0) {
      toast.error("Please select at least one link.");
      return;
    }

    try {
      setExporting(true);

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

      const drawHeader = (firstPage = false) => {
        if (firstPage) {
          doc.addImage(logoData, "PNG", margin, 12, 11, 11);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(32, 118, 199);
        doc.text(
          "Nudge Links",
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
        doc.line(margin, 32, pageWidth - margin, 32);
        y = 42;
      };

      drawHeader(true);

      selectedLinkRecords.forEach((link) => {
        const titleLines = doc.splitTextToSize(
          String(link.title || ""),
          usableWidth - 20
        );

        const urlLines = doc.splitTextToSize(
          String(link.url || ""),
          usableWidth - 16
        );

        const wrappedDescription = String(link.notes || "")
          .split("\n")
          .flatMap((paragraph) =>
            paragraph.trim()
              ? doc.splitTextToSize(paragraph, usableWidth)
              : [""]
          );

        const estimatedHeight =
          titleLines.length * 6 +
          urlLines.length * 6 +
          wrappedDescription.length * 6 +
          48;

        if (y + estimatedHeight > pageHeight - 25) {
          doc.addPage();
          drawHeader(false);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(25);
        doc.text("Title:", margin, y);

        doc.setFont("helvetica", "normal");
        doc.text(titleLines, margin + 18, y);
        y += Math.max(9, titleLines.length * 6 + 3);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("URL:", margin, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(32, 118, 199);

        urlLines.forEach((line, index) => {
          if (y > pageHeight - 25) {
            doc.addPage();
            drawHeader(false);
          }

          doc.textWithLink(
            line,
            index === 0 ? margin + 14 : margin,
            y,
            { url: link.url }
          );
          y += 6;
        });

        doc.setTextColor(25);
        y += 3;

        doc.setFont("helvetica", "bold");
        doc.text("Description:", margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");

        wrappedDescription.forEach((line) => {
          if (y > pageHeight - 25) {
            doc.addPage();
            drawHeader(false);
          }

          if (!line) {
            y += 6;
            return;
          }

          doc.text(line, margin, y);
          y += 6;
        });

        y += 3;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(25);
        doc.text("Category:", margin, y);

        const categoryText = String(link.category || "");
        const categoryWidth = Math.min(
          doc.getTextWidth(categoryText) + 10,
          usableWidth - 24
        );

        doc.setFillColor(32, 118, 199);
        doc.roundedRect(
          margin + 24,
          y - 4,
          categoryWidth,
          6,
          2,
          2,
          "F"
        );

        doc.setTextColor(255);
        doc.setFontSize(9);
        doc.text(categoryText, margin + 29, y, {
          maxWidth: categoryWidth - 8,
        });

        y += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(140);
        doc.text(
          `Created: ${new Date(link.createdAt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          pageWidth - margin,
          y,
          { align: "right" }
        );

        y += 6;
        doc.setDrawColor(225);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      });

      const pageCount = doc.getNumberOfPages();

      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(
          `Page ${page} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      doc.save("Nudge Links.pdf");
      toast.success("PDF downloaded successfully.");
      closeDownloadModal();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create the PDF.");
    } finally {
      setExporting(false);
    }
  }, [closeDownloadModal, selectedLinkRecords]);

  useEffect(() => {
    const controller = new AbortController();
    fetchLinks(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchLinks]);

  useEffect(() => {
    if (shouldCreate === "true") {
      openCreateForm();
    }
  }, [openCreateForm, shouldCreate]);

  useEffect(() => {
    if (
      selectedLinkId &&
      linkRefs.current[selectedLinkId]
    ) {
      highlightLink(selectedLinkId);
    }
  }, [highlightLink, links, selectedLinkId]);

  useEffect(() => {
    if (showForm) {
      firstInputRef.current?.focus();
    }
  }, [showForm]);

  useEffect(
    () => () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    },
    []
  );

  const sidebar = (
    <Card
      variant="glass"
      style={{
        width: "100%",
        minWidth: 0,
        margin: 0,
        padding: isTablet ? "20px" : "24px",
        borderRadius: "22px",
      }}
    >
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: 0,
          marginBottom: "16px",
          fontSize: isTablet ? "1.55rem" : "1.8rem",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        <FaStar
          aria-hidden="true"
          style={{ color: "#FFD43B" }}
        />
        Favourites
      </h1>

      {favoriteLinks.length === 0 ? (
        <p style={{ margin: 0, opacity: 0.75 }}>
          No favorite links
        </p>
      ) : (
        favoriteLinks.map((link) => (
          <button
            key={link._id}
            type="button"
            className="glow-top left"
            onClick={() => highlightLink(link._id)}
            style={{
              width: "100%",
              margin: "0 0 10px",
              textAlign: "left",
            }}
          >
            {link.title}
          </button>
        ))
      )}
    </Card>
  );

  return (
    <Layout
      sidebar={sidebar}
      backgroundImage={backgroundImage}
      blurBackground={showForm || showDownloadModal}
      cardVariant="glass"
    >
      {showForm && (
        <GlassModal
          ariaLabel={editingId ? "Edit Link" : "New Link"}
        >
          <Card
            variant="glass"
            style={{
              width: "100%",
              maxWidth: "420px",
              minWidth: 0,
              margin: 0,
              padding: isMobile
                ? "20px"
                : "28px",
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
              }}
            >
              {editingId ? (
                <>
                  <FaEdit aria-hidden="true" />
                  Edit Link
                </>
              ) : (
                <>
                  <FaLink aria-hidden="true" />
                  New Link
                </>
              )}
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              <div className="input-icon-wrapper">
                <FaHeading className="input-icon" aria-hidden="true" />
                <input
                  ref={firstInputRef}
                  className="input-glow"
                  type="text"
                  autoComplete="off"
                  placeholder="Title"
                  value={form.title}
                  disabled={saving}
                  onChange={(event) =>
                    updateFormField("title", event.target.value)
                  }
                />
              </div>

              <div className="input-icon-wrapper">
                <FaLink className="input-icon" aria-hidden="true" />
                <input
                  className="input-glow"
                  type="url"
                  inputMode="url"
                  autoCapitalize="none"
                  autoComplete="url"
                  spellCheck="false"
                  placeholder="https://example.com"
                  value={form.url}
                  disabled={saving}
                  onChange={(event) =>
                    updateFormField("url", event.target.value)
                  }
                />
              </div>

              <div className="input-icon-wrapper">
                <FaTags className="input-icon" aria-hidden="true" />
                <AutocompleteInput
                  value={form.category}
                  onChange={(value) =>
                    updateFormField("category", value)
                  }
                  options={linkCategories}
                  placeholder="Create/Select Category"
                  darkMode={darkMode}
                  className="input-glow"
                  emptyMessage="No matching categories"
                />
              </div>

              <div className="input-icon-wrapper">
                <FaStickyNote
                  className="input-icon textarea-icon"
                  aria-hidden="true"
                />
                <textarea
                  className="input-glow"
                  rows="4"
                  placeholder="Description"
                  value={form.notes}
                  disabled={saving}
                  onChange={(event) =>
                    updateFormField("notes", event.target.value)
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile
                    ? "column"
                    : "row",
                  gap: "10px",
                  marginTop: "5px",
                }}
              >
                <button
                  type="button"
                  className="glow-top"
                  disabled={saving}
                  onClick={handleSave}
                  style={{
                    width: isMobile ? "100%" : "auto",
                    margin: 0,
                  }}
                >
                  {editingId ? (
                    <>
                      <FaEdit
                        aria-hidden="true"
                        style={{ marginRight: "6px" }}
                      />
                      {saving ? "Updating..." : "Update Link"}
                    </>
                  ) : (
                    <>
                      <FaPlus
                        aria-hidden="true"
                        style={{ marginRight: "6px" }}
                      />
                      {saving ? "Adding..." : "Add Link"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="glow-top delete"
                  disabled={saving}
                  onClick={closeForm}
                  style={{
                    width: isMobile ? "100%" : "auto",
                    margin: 0,
                  }}
                >
                  <FaArrowLeft
                    aria-hidden="true"
                    style={{ marginRight: "6px" }}
                  />
                  Cancel
                </button>
              </div>
            </div>
          </Card>
        </GlassModal>
      )}

      {showDownloadModal && (
        <GlassModal ariaLabel="Export Links">
          <Card
            variant="glass"
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "500px",
              minWidth: 0,
              maxHeight: "min(760px, calc(100dvh - 48px))",
              margin: 0,
              padding: isMobile ? "20px" : "30px",
              borderRadius: "24px",
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
                gap: "10px",
                marginTop: 0,
                marginBottom: "18px",
              }}
            >
              <FaFileExport aria-hidden="true" />
              Export Links
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: "auto",
                minHeight: 0,
                gap: "10px",
                paddingRight: "6px",
                overflowY: "auto",
                overscrollBehavior: "contain",
              }}
            >
              {links.map((link) => {
                const selected = selectedLinkSet.has(link._id);

                return (
                  <label
                    key={link._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(0,190,159,.6)",
                      background: selected
                        ? "rgba(0,190,159,.12)"
                        : "rgba(255,255,255,.04)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelectedLink(link._id)}
                    />
                    <strong style={{ overflowWrap: "anywhere" }}>
                      {link.title}
                    </strong>
                  </label>
                );
              })}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "minmax(0, 1fr)"
                  : "repeat(2, minmax(0, 1fr))",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                className="glow-top"
                disabled={exporting || links.length === 0}
                onClick={toggleSelectAll}
                style={{ width: "100%", margin: 0 }}
              >
                {allLinksSelected
                  ? "Deselect All"
                  : "Select All"}
              </button>

              <button
                type="button"
                className="glow-top"
                disabled={exporting}
                onClick={downloadLinksPDF}
                style={{ width: "100%", margin: 0 }}
              >
                <FaFilePdf
                  aria-hidden="true"
                  size={13}
                  style={{ marginRight: "5px" }}
                />
                {exporting ? "Creating PDF..." : "PDF"}
              </button>

              <button
                type="button"
                className="glow-top"
                disabled={exporting}
                onClick={downloadLinksCSV}
                style={{ width: "100%", margin: 0 }}
              >
                <FaFileCsv
                  aria-hidden="true"
                  size={13}
                  style={{ marginRight: "5px" }}
                />
                CSV
              </button>

              <button
                type="button"
                className="glow-top delete"
                disabled={exporting}
                onClick={closeDownloadModal}
                style={{ width: "100%", margin: 0 }}
              >
                Cancel
              </button>
            </div>
          </Card>
        </GlassModal>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minWidth: 0,
          gap: "28px",
          padding: isMobile
            ? "0 0 40px"
            : "10px 10px 40px",
        }}
      >
        <header
          style={{
            display: "flex",
            flexDirection: isMobile
              ? "column"
              : "row",
            alignItems: isMobile
              ? "stretch"
              : "center",
            justifyContent: "space-between",
            gap: "16px",
            width: "100%",
            marginBottom: "10px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? "2rem" : "2.5rem",
            }}
          >
            Links
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile
                ? "column"
                : "row",
              gap: "12px",
            }}
          >
            <button
              type="button"
              className="glow-top"
              disabled={links.length === 0}
              onClick={() => setShowDownloadModal(true)}
              style={{
                width: isMobile ? "100%" : "auto",
                margin: 0,
              }}
            >
              <FaFileExport
                aria-hidden="true"
                size={13}
                style={{ marginRight: "5px" }}
              />
              Export
            </button>

            <button
              type="button"
              className="glow-top"
              onClick={openCreateForm}
              style={{
                width: isMobile ? "100%" : "auto",
                margin: 0,
                padding: isMobile
                  ? "14px"
                  : "12px 22px",
                fontSize: isMobile
                  ? ".95rem"
                  : "1rem",
              }}
            >
              <FaPlus
                aria-hidden="true"
                size={13}
                style={{ marginRight: "5px" }}
              />
              Create Link
            </button>
          </div>
        </header>

        {links.length === 0 ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              opacity: 0.8,
            }}
          >
            <FaLink
              aria-hidden="true"
              size={42}
              style={{
                marginBottom: "15px",
                color: "#00be9f",
              }}
            />
            <h2>No Links Yet</h2>
            <p>Start building your collection by saving your first link.</p>
          </div>
        ) : (
          links.map((link) => (
            <div
              key={link._id}
              ref={(element) => {
                if (element) {
                  linkRefs.current[link._id] = element;
                } else {
                  delete linkRefs.current[link._id];
                }
              }}
            >
              <Card
                variant="glass"
                style={{
                  margin: 0,
                  boxShadow:
                    highlightId === link._id
                      ? HIGHLIGHT_SHADOW
                      : undefined,
                  transition: "box-shadow .35s ease",
                }}
              >
                <h3
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginTop: 0,
                    overflowWrap: "anywhere",
                  }}
                >
                  <span>
                    <strong>Title: </strong>
                    {link.title}
                  </span>

                  {link.favorite && (
                    <FaStar
                      aria-label="Favorite link"
                      style={{
                        flexShrink: 0,
                        color: "#FFD43B",
                        fontSize: "1.2rem",
                      }}
                    />
                  )}
                </h3>

                <p style={{ overflowWrap: "anywhere" }}>
                  <strong>
                    <FaLink
                      aria-hidden="true"
                      style={{
                        marginRight: "6px",
                        color: "#00be9f",
                      }}
                    />
                    URL:{" "}
                  </strong>
                  <a
                    href={normalizeUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.url}
                  </a>
                </p>

                <p style={{ overflowWrap: "anywhere" }}>
                  <strong>
                    <FaTags
                      aria-hidden="true"
                      style={{
                        marginRight: "6px",
                        color: "#00be9f",
                      }}
                    />
                    Category:{" "}
                  </strong>
                  {link.category}
                </p>

                <p
                  style={{
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  <strong>
                    <FaStickyNote
                      aria-hidden="true"
                      style={{
                        marginRight: "6px",
                        color: "#00be9f",
                      }}
                    />
                    Description:{" "}
                  </strong>
                  {link.notes}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile
                      ? "column"
                      : "row",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >
                  <button
                    type="button"
                    className="glow-top"
                    onClick={() => startEdit(link)}
                    style={{
                      width: isMobile ? "100%" : "auto",
                      margin: 0,
                    }}
                  >
                    <FaEdit
                      aria-hidden="true"
                      size={13}
                      style={{ marginRight: "5px" }}
                    />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="glow-top"
                    onClick={() => handleFavorite(link._id)}
                    style={{
                      width: isMobile ? "100%" : "auto",
                      margin: 0,
                    }}
                  >
                    {link.favorite ? (
                      <>
                        <MdFavorite
                          aria-hidden="true"
                          size={15}
                          style={{ marginRight: "5px" }}
                        />
                        Unfavorite
                      </>
                    ) : (
                      <>
                        <MdFavoriteBorder
                          aria-hidden="true"
                          size={15}
                          style={{ marginRight: "5px" }}
                        />
                        Favorite
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="glow-top delete"
                    onClick={() => handleDelete(link._id)}
                    style={{
                      width: isMobile ? "100%" : "auto",
                      margin: 0,
                    }}
                  >
                    <FaTrash
                      aria-hidden="true"
                      size={13}
                      style={{ marginRight: "5px" }}
                    />
                    Delete
                  </button>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default Links;