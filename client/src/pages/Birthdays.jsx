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
import {
  FaArrowLeft,
  FaBirthdayCake,
  FaCalendarAlt,
  FaEdit,
  FaFileExport,
  FaGift,
  FaHourglassHalf,
  FaPlus,
  FaRegStickyNote,
  FaStickyNote,
  FaTrash,
  FaUser,
  FaUsers,
} from "react-icons/fa";

import birthdayDarkBg from "../assets/backgrounds/birthday-dark.png";
import birthdayLightBg from "../assets/backgrounds/birthday-light.png";
import Card from "../components/Card";
import GlassModal from "../components/GlassModal";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
  "Grandfather",
  "Grandmother",
  "Uncle",
  "Aunt",
  "Cousin",
  "Friend",
  "Husband",
  "Wife",
  "Boyfriend",
  "Girlfriend",
  "Fiancé",
  "Fiancée",
  "Colleague",
  "Myself",
  "Other",
];

const HIGHLIGHT_SHADOW = `
  0 0 25px rgba(0,255,204,.45),
  0 0 70px rgba(0,255,204,.18),
  0 20px 60px rgba(0,0,0,.45)
`;

const EMPTY_FORM = {
  name: "",
  birthDay: "",
  birthMonth: "",
  birthYear: "",
  relationship: "",
  notes: "",
};

/** Returns the person's current age when a birth year exists. */
function getAge(birthday) {
  if (!birthday.birthYear) return null;

  const today = new Date();
  let age = today.getFullYear() - birthday.birthYear;

  const birthdayHasNotOccurred =
    today.getMonth() + 1 < birthday.birthMonth ||
    (today.getMonth() + 1 === birthday.birthMonth &&
      today.getDate() < birthday.birthDay);

  if (birthdayHasNotOccurred) age -= 1;

  return age;
}

/** Returns the number of whole days until the next birthday. */
function getDaysUntilBirthday(birthday) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextBirthday = new Date(
    today.getFullYear(),
    birthday.birthMonth - 1,
    birthday.birthDay
  );

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  return Math.round(
    (nextBirthday - today) / (1000 * 60 * 60 * 24)
  );
}

/** Formats the stored birthday using a consistent British date format. */
function formatBirthday(birthday) {
  const date = new Date(
    birthday.birthYear || 2000,
    birthday.birthMonth - 1,
    birthday.birthDay
  );

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    ...(birthday.birthYear && { year: "numeric" }),
  });
}

/** Converts a date to the UTC timestamp format required by iCalendar. */
function formatCalendarDate(date) {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/** Escapes user-provided text for safe iCalendar output. */
function escapeCalendarText(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Birthday management page.
 *
 * Supports creating, editing, deleting, highlighting, sorting,
 * upcoming-birthday navigation, and iCalendar export.
 */
function Birthdays() {
  const { user } = useContext(AuthContext);
  const confirm = useConfirm();
  const { isMobile, isTablet } = useBreakpoint();
  const location = useLocation();

  const birthdayRefs = useRef({});
  const firstInputRef = useRef(null);
  const highlightTimeoutRef = useRef(null);

  const [birthdays, setBirthdays] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const [saving, setSaving] = useState(false);

  const darkMode = user?.theme === "dark";
  const backgroundImage = darkMode
    ? birthdayDarkBg
    : birthdayLightBg;

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const selectedBirthdayId = searchParams.get("birthdayId");
  const shouldCreate = searchParams.get("create") === "true";

  const daysInMonth = useMemo(() => {
    if (!form.birthMonth) return 31;

    return new Date(2024, Number(form.birthMonth), 0).getDate();
  }, [form.birthMonth]);

  const sortedBirthdays = useMemo(
    () =>
      [...birthdays].sort(
        (a, b) => getDaysUntilBirthday(a) - getDaysUntilBirthday(b)
      ),
    [birthdays]
  );

  const updateField = useCallback((field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }, []);

  const fetchBirthdays = useCallback(async () => {
    try {
      const response = await api.get("/birthdays");
      setBirthdays(response.data?.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to load birthdays."
      );
    }
  }, []);

  const fetchUpcoming = useCallback(async () => {
    try {
      const response = await api.get("/birthdays/upcoming");
      setUpcoming(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to load upcoming birthdays."
      );
    }
  }, []);

  const refreshBirthdays = useCallback(async () => {
    await Promise.all([fetchBirthdays(), fetchUpcoming()]);
  }, [fetchBirthdays, fetchUpcoming]);

  const handleSave = useCallback(async () => {
    const trimmedName = form.name.trim();
    const trimmedNotes = form.notes.trim();

    if (!trimmedName) {
      toast.error("Name is required");
      return;
    }

    if (!form.birthDay) {
      toast.error("Birth Day is required");
      return;
    }

    if (!form.birthMonth) {
      toast.error("Birth Month is required");
      return;
    }

    if (!form.relationship) {
      toast.error("Relationship is required");
      return;
    }

    if (!trimmedNotes) {
      toast.error("Birthday Note is required");
      return;
    }

    const birthdayData = {
      name: trimmedName,
      birthDay: Number(form.birthDay),
      birthMonth: Number(form.birthMonth),
      birthYear: form.birthYear ? Number(form.birthYear) : null,
      relationship: form.relationship,
      notes: trimmedNotes,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/birthdays/${editingId}`, birthdayData);
      } else {
        await api.post("/birthdays", birthdayData);
      }

      toast.success(
        editingId
          ? "Birthday updated successfully."
          : "Birthday added successfully."
      );

      resetForm();
      await refreshBirthdays();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to save birthday."
      );
    } finally {
      setSaving(false);
    }
  }, [editingId, form, refreshBirthdays, resetForm]);

  const startEdit = useCallback((birthday) => {
    setEditingId(birthday._id);
    setForm({
      name: birthday.name ?? "",
      birthDay: String(birthday.birthDay ?? ""),
      birthMonth: String(birthday.birthMonth ?? ""),
      birthYear: birthday.birthYear ? String(birthday.birthYear) : "",
      relationship: birthday.relationship ?? "",
      notes: birthday.notes ?? "",
    });
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = await confirm({
        title: "Delete Birthday",
        message:
          "Are you sure you want to delete this birthday? This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
      });

      if (!confirmed) return;

      try {
        await api.delete(`/birthdays/${id}`);
        toast.success("Birthday deleted successfully.");
        await refreshBirthdays();
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message || "Failed to delete birthday."
        );
      }
    },
    [confirm, refreshBirthdays]
  );

  const exportToCalendar = useCallback((birthday) => {
    const currentYear = new Date().getFullYear();
    const eventDate = new Date(
      currentYear,
      birthday.birthMonth - 1,
      birthday.birthDay
    );
    const endDate = new Date(eventDate);
    endDate.setDate(endDate.getDate() + 1);

    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nudge//Birthdays//EN
BEGIN:VEVENT
UID:${birthday._id}@nudge
DTSTAMP:${formatCalendarDate(new Date())}
DTSTART:${formatCalendarDate(eventDate)}
DTEND:${formatCalendarDate(endDate)}
SUMMARY:${escapeCalendarText(`${birthday.name}'s Birthday`)}
DESCRIPTION:${escapeCalendarText(birthday.notes)}
RRULE:FREQ=YEARLY
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([calendar], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${birthday.name}-birthday.ics`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast.success("Calendar exported successfully.");
  }, []);

  const highlightBirthday = useCallback((id) => {
    setHighlightId(id);

    birthdayRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightId(null);
    }, 1200);
  }, []);

  useEffect(() => {
    refreshBirthdays();
  }, [refreshBirthdays]);

  useEffect(() => {
    if (showForm) {
      window.requestAnimationFrame(() => {
        firstInputRef.current?.focus();
      });
    }
  }, [showForm]);

  useEffect(() => {
    if (shouldCreate) setShowForm(true);
  }, [shouldCreate]);

  useEffect(() => {
    if (
      selectedBirthdayId &&
      birthdayRefs.current[selectedBirthdayId]
    ) {
      highlightBirthday(selectedBirthdayId);
    }
  }, [birthdays, highlightBirthday, selectedBirthdayId]);

  useEffect(() => {
    if (!showForm) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
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
          marginBottom: "20px",
          textAlign: "center",
          fontSize: isTablet ? "1.6rem" : "2rem",
        }}
      >
        <FaBirthdayCake aria-hidden="true" />
        Upcoming
      </h1>

      {upcoming.length === 0 ? (
        <p style={{ margin: 0, textAlign: "center", opacity: 0.75 }}>
          No upcoming birthdays
        </p>
      ) : (
        upcoming.slice(0, 5).map((birthday) => (
          <button
            key={birthday._id}
            type="button"
            className="glow-top left"
            onClick={() => highlightBirthday(birthday._id)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              minWidth: 0,
              margin: "0 0 10px",
              padding: "11px 12px",
              borderRadius: "10px",
              textAlign: "left",
            }}
          >
            <span
              style={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {birthday.name}
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
                gap: "5px",
                marginLeft: "10px",
                fontSize: ".82rem",
                whiteSpace: "nowrap",
              }}
            >
              {birthday.daysRemaining === 0 ? (
                <>
                  <FaGift aria-hidden="true" size={13} />
                  Today
                </>
              ) : (
                `${birthday.daysRemaining} day${
                  birthday.daysRemaining !== 1 ? "s" : ""
                } left`
              )}
            </span>
          </button>
        ))
      )}
    </Card>
  );

  return (
    <Layout
      sidebar={sidebar}
      backgroundImage={backgroundImage}
      blurBackground={showForm}
      cardVariant="glass"
    >
      {showForm && (
        <GlassModal ariaLabel={editingId ? "Edit Birthday" : "New Birthday"}>
          <Card
            variant="glass"
            style={{
              width: "100%",
              maxWidth: "440px",
              minWidth: 0,
              margin: 0,
              padding: isMobile ? "18px" : "24px",
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
            <h2 style={{ marginTop: 0 }}>
              {editingId ? (
                <>
                  <FaEdit aria-hidden="true" style={{ marginRight: "8px" }} />
                  Edit Birthday
                </>
              ) : (
                <>
                  <FaBirthdayCake
                    aria-hidden="true"
                    style={{ marginRight: "8px" }}
                  />
                  New Birthday
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
                <FaUser className="input-icon" aria-hidden="true" />
                <input
                  ref={firstInputRef}
                  className="input-glow"
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                />
              </div>

              <div
                className="birthday-date-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "minmax(0, 1fr)"
                    : "1.1fr .75fr 1.25fr",
                  gap: "12px",
                }}
              >
                <select
                  className="input-glow"
                  value={form.birthMonth}
                  onChange={(event) => {
                    const month = event.target.value;
                    const nextDays = month
                      ? new Date(2024, Number(month), 0).getDate()
                      : 31;

                    setForm((current) => ({
                      ...current,
                      birthMonth: month,
                      birthDay:
                        current.birthDay &&
                        Number(current.birthDay) > nextDays
                          ? ""
                          : current.birthDay,
                    }));
                  }}
                >
                  <option value="">Month</option>
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  className="input-glow"
                  value={form.birthDay}
                  onChange={(event) =>
                    updateField("birthDay", event.target.value)
                  }
                >
                  <option value="">Day</option>
                  {Array.from(
                    { length: daysInMonth },
                    (_, index) => index + 1
                  ).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                <input
                  className="input-glow"
                  type="number"
                  inputMode="numeric"
                  placeholder="Year (Optional)"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={form.birthYear}
                  onChange={(event) =>
                    updateField("birthYear", event.target.value)
                  }
                />
              </div>

              <div className="input-icon-wrapper">
                <FaUsers className="input-icon" aria-hidden="true" />
                <select
                  className="input-glow"
                  value={form.relationship}
                  onChange={(event) =>
                    updateField("relationship", event.target.value)
                  }
                >
                  <option value="">Select Relationship</option>
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-icon-wrapper">
                <FaRegStickyNote
                  className="input-icon textarea-icon"
                  aria-hidden="true"
                />
                <textarea
                  className="input-glow"
                  rows="4"
                  placeholder="Birthday Note"
                  value={form.notes}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                type="button"
                className="glow-top"
                disabled={saving}
                onClick={handleSave}
                style={{
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {editingId ? (
                  <>
                    <FaEdit
                      aria-hidden="true"
                      size={13}
                      style={{ marginRight: "6px" }}
                    />
                    {saving ? "Updating..." : "Update Birthday"}
                  </>
                ) : (
                  <>
                    <FaPlus
                      aria-hidden="true"
                      size={13}
                      style={{ marginRight: "6px" }}
                    />
                    {saving ? "Adding..." : "Add Birthday"}
                  </>
                )}
              </button>

              <button
                type="button"
                className="glow-top delete"
                disabled={saving}
                onClick={resetForm}
                style={{
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <FaArrowLeft
                  aria-hidden="true"
                  style={{ marginRight: "6px" }}
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
          flexDirection: "column",
          width: "100%",
          minWidth: 0,
          gap: "28px",
          padding: isMobile ? "0 0 40px" : "10px 10px 60px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            width: "100%",
            gap: isMobile ? "16px" : "20px",
            marginBottom: "2px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: isMobile
                ? "2rem"
                : isTablet
                  ? "2.2rem"
                  : "2.5rem",
            }}
          >
            Birthdays
          </h1>

          <button
            type="button"
            className="glow-top"
            onClick={() => setShowForm(true)}
            style={{
              width: isMobile ? "100%" : "auto",
              padding: isMobile ? "14px" : "12px 22px",
              fontSize: isMobile ? ".95rem" : "1rem",
            }}
          >
            <FaPlus
              aria-hidden="true"
              size={13}
              style={{ marginRight: "5px" }}
            />
            Create Birthday
          </button>
        </div>

        {birthdays.length === 0 ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              opacity: 0.8,
            }}
          >
            <FaBirthdayCake
              aria-hidden="true"
              size={42}
              style={{
                marginBottom: "15px",
                color: "#00be9f",
              }}
            />
            <h2>No Birthdays Yet</h2>
            <p>Start celebrating by adding your first birthday.</p>
          </div>
        ) : (
          sortedBirthdays.map((birthday) => {
            const daysRemaining = getDaysUntilBirthday(birthday);

            return (
              <div
                key={birthday._id}
                ref={(element) => {
                  birthdayRefs.current[birthday._id] = element;
                }}
                style={{ minWidth: 0 }}
              >
                <Card
                  variant="glass"
                  style={{
                    width: "100%",
                    minWidth: 0,
                    margin: 0,
                    boxShadow:
                      highlightId === birthday._id
                        ? HIGHLIGHT_SHADOW
                        : undefined,
                    transition: "box-shadow .35s ease",
                  }}
                >
                  <h3
                    style={{
                      fontSize: isMobile ? "1.1rem" : "1.35rem",
                      overflowWrap: "anywhere",
                    }}
                  >
                    <strong>Name: </strong>
                    {birthday.name}
                  </h3>

                  <p>
                    <strong>
                      <FaCalendarAlt
                        aria-hidden="true"
                        style={{ marginRight: "6px", color: "#00be9f" }}
                      />
                      Birthday:{" "}
                    </strong>
                    {formatBirthday(birthday)}
                  </p>

                  {birthday.birthYear && (
                    <p>
                      <strong>
                        <FaBirthdayCake
                          aria-hidden="true"
                          style={{ marginRight: "6px", color: "#00be9f" }}
                        />
                        Age:{" "}
                      </strong>
                      {getAge(birthday)} years
                    </p>
                  )}

                  <p>
                    <strong>
                      <FaUsers
                        aria-hidden="true"
                        style={{ marginRight: "6px", color: "#00be9f" }}
                      />
                      Relationship:{" "}
                    </strong>
                    {birthday.relationship}
                  </p>

                  <p>
                    <strong>
                      <FaHourglassHalf
                        aria-hidden="true"
                        style={{
                          marginRight: "6px",
                          color: "#00be9f",
                          verticalAlign: "middle",
                        }}
                      />
                      Next Birthday:
                    </strong>{" "}
                    <strong
                      style={{
                        color: darkMode ? "yellow" : "red",
                      }}
                    >
                      {daysRemaining === 0 ? (
                        <>
                          <FaGift
                            aria-hidden="true"
                            size={14}
                            style={{ marginRight: "6px" }}
                          />
                          Today
                        </>
                      ) : (
                        `${daysRemaining} day${
                          daysRemaining !== 1 ? "s" : ""
                        } remaining`
                      )}
                    </strong>
                  </p>

                  <p
                    style={{
                      lineHeight: 1.7,
                      overflowWrap: "anywhere",
                    }}
                  >
                    <strong>
                      <FaStickyNote
                        aria-hidden="true"
                        style={{
                          marginRight: "6px",
                          color: "#00be9f",
                          verticalAlign: "middle",
                        }}
                      />
                      Birthday Note:
                    </strong>{" "}
                    {birthday.notes}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "16px",
                    }}
                  >
                    <button
                      type="button"
                      className="glow-top"
                      onClick={() => startEdit(birthday)}
                      style={{ width: isMobile ? "100%" : "auto" }}
                    >
                      <FaEdit
                        aria-hidden="true"
                        style={{ marginRight: "6px" }}
                      />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="glow-top"
                      onClick={() => exportToCalendar(birthday)}
                      style={{ width: isMobile ? "100%" : "auto" }}
                    >
                      <FaFileExport
                        aria-hidden="true"
                        style={{ marginRight: "6px" }}
                      />
                      Export Calendar
                    </button>

                    <button
                      type="button"
                      className="glow-top delete"
                      onClick={() => handleDelete(birthday._id)}
                      style={{ width: isMobile ? "100%" : "auto" }}
                    >
                      <FaTrash
                        aria-hidden="true"
                        style={{ marginRight: "6px" }}
                      />
                      Delete
                    </button>
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}

export default Birthdays;