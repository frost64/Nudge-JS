import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRef } from "react";
import { useContext } from "react";
import { LayoutContext } from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { jsPDF } from "jspdf";
import logo from "../assets/Logo.svg";
import toast from "react-hot-toast";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import linkLightBg from "../assets/backgrounds/link-light.png";
import linkDarkBg from "../assets/backgrounds/link-dark.png";
import AutocompleteInput from "../components/AutocompleteInput";

import {
  FaTimes,
  FaHeading,
  FaTags,
  FaFileExport,
  FaLink,
  FaPlus,
  FaDownload,
  FaFilePdf,
  FaFileCsv,
  FaStar,
  FaRegStar,
  FaEdit,
  FaTrash,
  FaHeart,
  FaStickyNote,
  FaArrowLeft,
} from "react-icons/fa";

import {
  MdFavoriteBorder,
  MdFavorite,
} from "react-icons/md";

function Links() {
const { user } = useContext(AuthContext);
const { isMobile } = useContext(LayoutContext);
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
const [showDownloadModal, setShowDownloadModal] = useState(false);
const [selectedLinks, setSelectedLinks] = useState([]);
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

const linkCategories = [
  ...new Set(
    links
      .map(link => link.category?.trim())
      .filter(Boolean)
  ),
].sort((a, b) => a.localeCompare(b));

const toggleSelectedLink = (id) => {
  setSelectedLinks((prev) =>
    prev.includes(id)
      ? prev.filter((linkId) => linkId !== id)
      : [...prev, id]
  );
};

const toggleSelectAll = () => {
  if (selectedLinks.length === links.length) {
    setSelectedLinks([]);
  } else {
    setSelectedLinks(links.map((link) => link._id));
  }
};

const downloadLinksCSV = () => {
  const selected = links.filter((link) =>
    selectedLinks.includes(link._id)
  );

  if (selected.length === 0) {
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
    ...selected.map((link) => [
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
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const downloadUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = downloadUrl;
  a.download = "Nudge Links.csv";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(downloadUrl);

  toast.success("CSV downloaded successfully.");

  setShowDownloadModal(false);
  setSelectedLinks([]);
};

const downloadLinksPDF = async () => {
  const selected = links.filter((link) =>
    selectedLinks.includes(link._id)
  );

  if (selected.length === 0) {
    toast.error("Please select at least one link.");
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

  // ---------------- LINKS ----------------

  selected.forEach((link) => {

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const wrappedDescription = link.notes
      .split("\n")
      .flatMap((paragraph) => {
        if (paragraph.trim() === "") return [""];
        return doc.splitTextToSize(paragraph, usableWidth);
      });

    const estimatedHeight =
      wrappedDescription.length * 6 + 60;

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
    doc.text(link.title, margin + 18, y);

    y += 9;

    // ---------- URL ----------

    doc.setFont("helvetica", "bold");
    doc.text("URL:", margin, y);

    doc.setTextColor(32, 118, 199);

    doc.textWithLink(
      link.url,
      margin + 14,
      y,
      {
        url: link.url,
      }
    );

    doc.setTextColor(25);

    y += 9;

    // ---------- DESCRIPTION ----------

    doc.setFont("helvetica", "bold");
    doc.text("Description:", margin, y);

    y += 7;

    doc.setFont("helvetica", "normal");

    wrappedDescription.forEach((line) => {

      if (y > pageHeight - 25) {
        doc.addPage();
        drawHeader(false);
      }

      if (line === "") {
        y += 6;
        return;
      }

      doc.text(line, margin, y);
      y += 6;
    });

    y += 3;

    // ---------- CATEGORY ----------

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(25);

    doc.text("Category:", margin, y);

    const width =
      doc.getTextWidth(link.category) + 10;

    doc.setFillColor(32,118,199);

    doc.roundedRect(
      margin + 24,
      y - 4,
      width,
      6,
      2,
      2,
      "F"
    );

    doc.setTextColor(255);

    doc.setFontSize(9);

    doc.text(
      link.category,
      margin + 29,
      y
    );

    y += 10;

    // ---------- CREATED ----------

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140);

    doc.text(
      `Created: ${new Date(
        link.createdAt
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

  const pages = doc.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {

    doc.setPage(i);

    doc.setFont("helvetica", "normal");
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

  doc.save("Nudge Links.pdf");

  toast.success("PDF downloaded successfully.");

  setShowDownloadModal(false);
  setSelectedLinks([]);
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
      position: isMobile ? "static" : "fixed",
      top: isMobile ? undefined : "15%",
      left: isMobile ? undefined : "2%",
      width: isMobile ? "100%" : "20%",
      minHeight: isMobile ? "auto" : "75%",
      padding: "24px",
      borderRadius: "22px",
    }}
  >
    <h1
      style={{
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <FaStar style={{
      color: "#FFD43B",
    }}/>
      Favourites
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
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {editingId ? (
          <>
            <FaEdit />
            Edit Link
          </>
        ) : (
          <>
            <FaLink />
            New Link
          </>
        )}
      </h2>
        
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px"
        }}
      >
        <div className="input-icon-wrapper">
          <FaHeading className="input-icon" />

          <input
            className="input-glow"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="input-icon-wrapper">
          <FaLink className="input-icon" />

          <input
            className="input-glow"
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="input-icon-wrapper">
          <FaTags className="input-icon" />

          <AutocompleteInput
            value={category}
            onChange={setCategory}
            options={linkCategories}
            placeholder="Create/Select Category"
            darkMode={darkMode}
            className="input-glow"
            emptyMessage="No matching categories"
          />
        </div>

        <div className="input-icon-wrapper">
          <FaStickyNote className="input-icon textarea-icon" />

          <textarea
            className="input-glow"
            placeholder="Description"
            rows="4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            {editingId ? (
              <>
                <FaEdit style={{ marginRight: "6px" }} />
                Update Link
              </>
            ) : (
              <>
                <FaPlus style={{ marginRight: "6px" }} />
                Add Link
              </>
            )}
          </button>

          <button
            className="glow-top delete"
            onClick={cancelEdit}
          >
            <FaArrowLeft style={{ marginRight: "6px" }} />
            Cancel
          </button>
        </div>
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
      overflowY: "auto",
      padding: "40px 20px",
      zIndex: 1100,
    }}
  >
    <Card
      variant="glass"
      style={{
        width: "100%",
        maxWidth: "460px",
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
      <h2
        style={{
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <FaFileExport />
        Export Links
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
        {links.map((link) => (
          <label
            key={link._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              border: "1px solid rgba(0,190,159,.6)",
              background: selectedLinks.includes(link._id)
                ? "rgba(0,190,159,.12)"
                : "rgba(255,255,255,.04)",
            }}
          >
            <input
              type="checkbox"
              checked={selectedLinks.includes(link._id)}
              onChange={() =>
                toggleSelectedLink(link._id)
              }
            />

            <strong>{link.title}</strong>
          </label>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          className="glow-top"
          onClick={toggleSelectAll}
        >
          {selectedLinks.length === links.length
            ? "Deselect All"
            : "Select All"}
        </button>

        <button
          className="glow-top"
          onClick={downloadLinksPDF}
        >
          <>
            <FaFilePdf
              size={13}
              style={{ marginRight: "5px" }}
            />
            PDF
          </>
        </button>

        <button
          className="glow-top"
          onClick={downloadLinksCSV}
        >
          <>
            <FaFileCsv
              size={13}
              style={{ marginRight: "5px" }}
            />
            CSV
          </>
        </button>

        <button
          className="glow-top delete"
          onClick={() => {
            setShowDownloadModal(false);
            setSelectedLinks([]);
          }}
        >
          Cancel
        </button>
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
          <>
            <FaFileExport
              size={13}
              style={{ marginRight: "5px" }}
            />
            Export
          </>
        </button>

        <button
          className="glow-top"
          style={{
            padding: "12px 22px",
            fontSize: "1rem",
          }}
          onClick={() => setShowForm(true)}
        >
          <>
            <FaPlus
              size={13}
              style={{ marginRight: "5px" }}
            />
            Create Link
          </>
        </button>
      </div>
    </div>

  {links.length === 0 ? (
      <div
            style={{
              textAlign: "center",
              opacity: 0.8,
              padding: "50px 20px",
            }}
          >
            <FaLink
              size={42}
              style={{
                marginBottom: "15px",
                color: "#00be9f",
              }}
            />

            <h2>No Links Yet</h2>

            <p>
              Start building your collection by saving your first link..
            </p>
            <div style={{paddingBottom:"50px"}}></div>
          </div>
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
                    {link.favorite && (
                      <FaStar
                        style={{
                          color: "#FFD43B",
                        }}
                      />
                    )}
                  </span>
                </h3>

                <p style={{ wordBreak: "break-all" }}>
                  <strong>
                    <FaLink
                      style={{
                        marginRight: "6px",
                        color: "#00be9f",
                      }}
                    />
                    URL:{" "}
                  </strong>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.url}
                  </a>
                </p>

                <p>
                  <strong>
                    <FaTags
                      style={{
                        marginRight: "6px",
                        color: "#00be9f",
                      }}
                    />
                    Category:{" "}
                  </strong>

                  {link.category}
                </p>

                <p>
                  <strong>
                    <FaStickyNote
                      style={{
                        marginRight: "6px",
                        color: "#00be9f",
                      }}
                    />
                    Description:{" "}
                  </strong>

                  {link.notes}
                </p>
                  <button
                    className="glow-top"
                    onClick={() =>
                      startEdit(link)
                    }
                  >
                    <>
                      <FaEdit
                        size={13}
                        style={{ marginRight: "5px" }}
                      />
                      Edit
                    </>
                  </button>

                  <button
                    className="glow-top"
                    onClick={() =>
                      handleFavorite(link._id)
                    }
                  >
                    {link.favorite ? (
                      <>
                        <MdFavorite
                          size={15}
                          style={{ marginRight: "5px" }}
                        />
                        Unfavorite
                      </>
                    ) : (
                      <>
                        <MdFavoriteBorder
                          size={15}
                          style={{ marginRight: "5px" }}
                        />
                        Favorite
                      </>
                    )}
                  </button>

                  <button
                    className="glow-top delete"
                    onClick={() =>
                      handleDelete(
                        link._id
                      )
                    }
                  >
                    <>
                      <FaTrash
                        size={13}
                        style={{ marginRight: "5px" }}
                      />
                      Delete
                    </>
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
