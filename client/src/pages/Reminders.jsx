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
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaExclamationTriangle,
  FaFlag,
  FaHeading,
  FaPlus,
  FaTags,
  FaTasks,
  FaTrash,
  FaUndo,
} from "react-icons/fa";

import reminderDarkBg from "../assets/backgrounds/reminder-dark.png";
import reminderLightBg from "../assets/backgrounds/reminder-light.png";

import AutocompleteInput from "../components/AutocompleteInput";
import Card from "../components/Card";
import GlassModal from "../components/GlassModal";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";

import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";

import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";

const DEFAULT_REMINDER_TIME = "09:00";
const HIGHLIGHT_DURATION = 1200;

const PRIORITY_OPTIONS = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
];

const HIGHLIGHT_SHADOW = `
  0 0 25px rgba(0,255,204,.45),
  0 0 70px rgba(0,255,204,.18),
  0 20px 60px rgba(0,0,0,.45)
`;

const OVERDUE_SHADOW = `
  0 0 25px rgba(255,70,70,.45),
  0 0 70px rgba(255,70,70,.18),
  0 20px 60px rgba(0,0,0,.45)
`;

function getReminderDateTime(reminder) {
  if (!reminder?.dueDate) {
    return null;
  }

  const datePart = String(
    reminder.dueDate
  ).split("T")[0];

  const timePart =
    reminder.reminderTime || "00:00";

  const dateTime = new Date(
    `${datePart}T${timePart}:00`
  );

  return Number.isNaN(
    dateTime.getTime()
  )
    ? null
    : dateTime;
}

function getOverdueDays(
  reminder,
  now = new Date()
) {
  if (reminder.completed) {
    return 0;
  }

  const dueDateTime =
    getReminderDateTime(reminder);

  if (
    !dueDateTime ||
    dueDateTime >= now
  ) {
    return 0;
  }

  return Math.max(
    1,
    Math.ceil(
      (now.getTime() -
        dueDateTime.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
}

function formatReminderDate(date) {
  if (!date) {
    return "Not set";
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Invalid date";
  }

  return parsedDate.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function Reminders() {
  const location = useLocation();
  const confirm = useConfirm();

  const { user } =
    useContext(AuthContext);

  const {
    isMobile,
    isTablet,
  } = useBreakpoint();

  const reminderRefs = useRef({});
  const highlightTimeoutRef =
    useRef(null);

  const firstInputRef =
    useRef(null);

  const [
    reminders,
    setReminders,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    dueDate,
    setDueDate,
  ] = useState("");

  const [
    reminderTime,
    setReminderTime,
  ] = useState(
    DEFAULT_REMINDER_TIME
  );

  const [
    priority,
    setPriority,
  ] = useState("");

  const [
    category,
    setCategory,
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
    highlightId,
    setHighlightId,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    busyReminderId,
    setBusyReminderId,
  ] = useState(null);

  const [
    exportingId,
    setExportingId,
  ] = useState(null);

  const darkMode =
    user?.theme === "dark";

  const formBackground = darkMode
    ? reminderDarkBg
    : reminderLightBg;

  const searchParams = useMemo(
    () =>
      new URLSearchParams(
        location.search
      ),
    [location.search]
  );

  const shouldCreate =
    searchParams.get("create") ===
    "true";

  const selectedReminderId =
    searchParams.get("reminderId");

  const resetForm = useCallback(
    () => {
      setTitle("");
      setDueDate("");

      setReminderTime(
        DEFAULT_REMINDER_TIME
      );

      setPriority("");
      setCategory("");
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

  const fetchReminders =
    useCallback(async (signal) => {
      try {
        setLoading(true);

        const response =
          await api.get(
            "/reminders",
            {
              signal,
            }
          );

        const reminderData =
          Array.isArray(
            response.data?.data
          )
            ? response.data.data
            : [];

        setReminders(reminderData);
        setLoadError("");
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

        const message =
          error.response?.data
            ?.message ||
          "Failed to load reminders.";

        setLoadError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    const controller =
      new AbortController();

    fetchReminders(
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, [fetchReminders]);

  useEffect(() => {
    if (shouldCreate) {
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
    if (!showForm) {
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
  }, [showForm]);

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

  const highlightReminder =
    useCallback((id) => {
      setHighlightId(id);

      reminderRefs.current[
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

  useEffect(() => {
    if (
      selectedReminderId &&
      reminderRefs.current[
        selectedReminderId
      ]
    ) {
      highlightReminder(
        selectedReminderId
      );
    }
  }, [
    highlightReminder,
    reminders,
    selectedReminderId,
  ]);

  const pendingReminders =
    useMemo(
      () =>
        reminders
          .filter(
            (reminder) =>
              !reminder.completed
          )
          .sort(
            (
              first,
              second
            ) => {
              const firstDate =
                getReminderDateTime(
                  first
                );

              const secondDate =
                getReminderDateTime(
                  second
                );

              return (
                (firstDate?.getTime() ||
                  Number.MAX_SAFE_INTEGER) -
                (secondDate?.getTime() ||
                  Number.MAX_SAFE_INTEGER)
              );
            }
          )
          .slice(0, 5),
      [reminders]
    );

  const reminderCategories =
    useMemo(
      () =>
        [
          ...new Set(
            reminders
              .map((reminder) =>
                reminder.category?.trim()
              )
              .filter(Boolean)
          ),
        ].sort(
          (first, second) =>
            first.localeCompare(
              second
            )
        ),
      [reminders]
    );

  const handleSave =
    useCallback(async () => {
      if (saving) {
        return;
      }

      const normalizedTitle =
        title.trim();

      const normalizedCategory =
        category.trim();

      if (
        !normalizedTitle ||
        !dueDate ||
        !reminderTime ||
        !priority ||
        !normalizedCategory
      ) {
        toast.error(
          "Please fill in all fields."
        );

        return;
      }

      const reminderData = {
        title: normalizedTitle,
        dueDate,
        reminderTime,
        priority,
        category:
          normalizedCategory,
      };

      try {
        setSaving(true);

        if (editingId) {
          await api.put(
            `/reminders/${editingId}`,
            reminderData
          );

          toast.success(
            "Reminder updated successfully."
          );
        } else {
          await api.post(
            "/reminders",
            reminderData
          );

          toast.success(
            "Reminder added successfully."
          );
        }

        resetForm();
        setShowForm(false);

        await fetchReminders();
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to save reminder."
        );
      } finally {
        setSaving(false);
      }
    }, [
      category,
      dueDate,
      editingId,
      fetchReminders,
      priority,
      reminderTime,
      resetForm,
      saving,
      title,
    ]);

  const handleDelete =
    useCallback(
      async (id) => {
        if (busyReminderId) {
          return;
        }

        const confirmed =
          await confirm({
            title:
              "Delete Reminder",

            message:
              "Are you sure you want to delete this reminder?",

            confirmText:
              "Delete",

            cancelText:
              "Cancel",
          });

        if (!confirmed) {
          return;
        }

        try {
          setBusyReminderId(id);

          await api.delete(
            `/reminders/${id}`
          );

          setReminders(
            (current) =>
              current.filter(
                (reminder) =>
                  reminder._id !== id
              )
          );

          toast.success(
            "Reminder deleted successfully."
          );
        } catch (error) {
          console.error(error);

          toast.error(
            error.response?.data
              ?.message ||
              "Failed to delete reminder."
          );
        } finally {
          setBusyReminderId(null);
        }
      },
      [
        busyReminderId,
        confirm,
      ]
    );

  const handleToggle =
    useCallback(
      async (id) => {
        if (busyReminderId) {
          return;
        }

        const currentReminder =
          reminders.find(
            (reminder) =>
              reminder._id === id
          );

        try {
          setBusyReminderId(id);

          await api.patch(
            `/reminders/${id}/toggle`
          );

          setReminders(
            (current) =>
              current.map(
                (reminder) =>
                  reminder._id === id
                    ? {
                        ...reminder,
                        completed:
                          !reminder.completed,
                      }
                    : reminder
              )
          );

          toast.success(
            currentReminder?.completed
              ? "Reminder marked as pending."
              : "Reminder marked as completed."
          );
        } catch (error) {
          console.error(error);

          toast.error(
            error.response?.data
              ?.message ||
              "Failed to update reminder."
          );
        } finally {
          setBusyReminderId(null);
        }
      },
      [
        busyReminderId,
        reminders,
      ]
    );

  const handleExport =
    useCallback(
      async (reminder) => {
        if (exportingId) {
          return;
        }

        let fileUrl = "";

        try {
          setExportingId(
            reminder._id
          );

          const response =
            await api.get(
              `/calendar/reminder/${reminder._id}`,
              {
                responseType:
                  "blob",
              }
            );

          fileUrl =
            window.URL.createObjectURL(
              new Blob(
                [response.data],
                {
                  type:
                    "text/calendar;charset=utf-8",
                }
              )
            );

          const link =
            document.createElement(
              "a"
            );

          const safeTitle =
            reminder.title
              ?.trim()
              .replace(
                /[^a-z0-9-_]+/gi,
                "-"
              ) || "reminder";

          link.href = fileUrl;

          link.download =
            `${safeTitle}.ics`;

          document.body.appendChild(
            link
          );

          link.click();
          link.remove();

          toast.success(
            "Calendar exported successfully."
          );
        } catch (error) {
          console.error(error);

          toast.error(
            error.response?.data
              ?.message ||
              "Failed to export calendar."
          );
        } finally {
          if (fileUrl) {
            window.URL.revokeObjectURL(
              fileUrl
            );
          }

          setExportingId(null);
        }
      },
      [exportingId]
    );

  const startEdit = useCallback(
    (reminder) => {
      setEditingId(
        reminder._id
      );

      setTitle(
        reminder.title || ""
      );

      setDueDate(
        reminder.dueDate
          ? String(
              reminder.dueDate
            ).split("T")[0]
          : ""
      );

      setReminderTime(
        reminder.reminderTime ||
          DEFAULT_REMINDER_TIME
      );

      setPriority(
        reminder.priority || ""
      );

      setCategory(
        reminder.category || ""
      );

      setShowForm(true);
    },
    []
  );

  const openCreateForm =
    useCallback(() => {
      resetForm();
      setShowForm(true);
    }, [resetForm]);

  const sidebar = useMemo(
    () => (
      <Card
        className="nudge-sidebar"
        variant="glass"
      >
        <h1 className="nudge-sidebar-title">
          <FaClock
            aria-hidden="true"
          />

          <span>Pending</span>
        </h1>

        {pendingReminders.length ===
        0 ? (
          <p className="nudge-sidebar-empty">
            No pending reminders
          </p>
        ) : (
          <nav
            className="nudge-sidebar-actions"
            aria-label="Pending reminders"
          >
            {pendingReminders.map(
              (reminder) => (
                <button
                  key={
                    reminder._id
                  }
                  type="button"
                  className="glow-top left nudge-sidebar-button"
                  onClick={() =>
                    highlightReminder(
                      reminder._id
                    )
                  }
                >
                  <span className="nudge-sidebar-button-text">
                    {
                      reminder.title
                    }
                  </span>
                </button>
              )
            )}
          </nav>
        )}
      </Card>
    ),
    [
      highlightReminder,
      pendingReminders,
    ]
  );

  if (
    loading &&
    reminders.length === 0
  ) {
    return (
      <Layout
        backgroundImage={
          formBackground
        }
        cardVariant="glass"
      >
        <LoadingSpinner text="Loading Reminders..." />
      </Layout>
    );
  }

  if (
    loadError &&
    reminders.length === 0
  ) {
    return (
      <Layout
        backgroundImage={
          formBackground
        }
        cardVariant="glass"
      >
        <Card
          variant="glass"
          style={{
            width: "100%",
            maxWidth: "650px",
            margin: "40px auto",
            textAlign: "center",
          }}
        >
          <h2>
            Unable to load reminders
          </h2>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            {loadError}
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
      sidebar={sidebar}
      sidebarTitle="Pending Reminders"
      backgroundImage={
        formBackground
      }
      blurBackground={showForm}
      cardVariant="glass"
    >
      
      {showForm && (
        <GlassModal
          ariaLabel={
            editingId
              ? "Edit Reminder"
              : "New Reminder"
          }
        >
          <Card
            variant="glass"
            style={{
              width: "100%",
              maxWidth: "420px",
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

                alignItems:
                  "center",

                flexWrap: "wrap",

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

                  Edit Reminder
                </>
              ) : (
                <>
                  <FaClock
                    aria-hidden="true"
                  />

                  New Reminder
                </>
              )}
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",

                width: "100%",
                maxWidth: "100%",
                minWidth: 0,

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
                  autoComplete="off"
                  placeholder="Reminder Title"
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

              <div
                className="input-icon-wrapper"
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              >
                <FaCalendarAlt
                  className="input-icon"
                  aria-hidden="true"
                />

                <input
                  className="input-glow"
                  type="date"
                  value={dueDate}
                  disabled={saving}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                className="input-icon-wrapper"
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              >
                <FaClock
                  className="input-icon"
                  aria-hidden="true"
                />

                <input
                  className="input-glow"
                  type="time"
                  value={reminderTime}
                  disabled={saving}
                  onChange={(event) =>
                    setReminderTime(
                      event.target.value
                    )
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div className="input-icon-wrapper">
                <FaFlag
                  className="input-icon"
                  aria-hidden="true"
                />

                <select
                  className="input-glow"
                  value={priority}
                  disabled={saving}
                  onChange={(
                    event
                  ) =>
                    setPriority(
                      event.target
                        .value
                    )
                  }
                >
                  <option
                    value=""
                    disabled
                  >
                    Priority
                  </option>

                  {PRIORITY_OPTIONS.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="input-icon-wrapper">
                <FaTags
                  className="input-icon"
                  aria-hidden="true"
                />

                <AutocompleteInput
                  value={category}
                  onChange={
                    setCategory
                  }
                  options={
                    reminderCategories
                  }
                  placeholder="Create/Select Category"
                  darkMode={
                    darkMode
                  }
                  className="input-glow"
                  emptyMessage="No matching categories"
                />
              </div>

              <div
                style={{
                  display: "flex",

                  flexDirection:
                    isMobile
                      ? "column"
                      : "row",

                  gap: "10px",

                  marginTop:
                    isMobile
                      ? "2px"
                      : "4px",
                }}
              >
                <button
                  type="button"
                  className="glow-top"
                  disabled={saving}
                  onClick={
                    handleSave
                  }
                  style={{
                    width: isMobile
                      ? "100%"
                      : "auto",

                    padding:
                      isMobile
                        ? "10px 12px"
                        : undefined,
                  }}
                >
                  {editingId ? (
                    <FaEdit
                      aria-hidden="true"
                      style={{
                        marginRight:
                          "6px",
                      }}
                    />
                  ) : (
                    <FaPlus
                      aria-hidden="true"
                      style={{
                        marginRight:
                          "6px",
                      }}
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Reminder"
                      : "Add Reminder"}
                </button>

                <button
                  type="button"
                  className="glow-top delete"
                  disabled={saving}
                  onClick={
                    closeForm
                  }
                  style={{
                    width: isMobile
                      ? "100%"
                      : "auto",

                    padding:
                      isMobile
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
            </div>
          </Card>
        </GlassModal>
      )}

      <div
        style={{
          display: "flex",

          flexDirection:
            "column",

          gap: isMobile
            ? "20px"
            : "28px",

          width: "100%",
          minWidth: 0,

          padding: isMobile
            ? "0 0 24px"
            : "10px 10px 40px",

          boxSizing:
            "border-box",
        }}
      >
        <header
          style={{
            display: "flex",
            flexDirection: "row",

            alignItems: "center",

            justifyContent:
              "space-between",

            gap: isMobile
              ? "10px"
              : "20px",

            width: "100%",
            minWidth: 0,

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
            Reminders
          </h1>

          <button
            type="button"
            className="glow-top"
            onClick={
              openCreateForm
            }
            style={{
              width: "auto",
              flexShrink: 0,

              padding: isMobile
                ? "9px 12px"
                : "12px 22px",

              fontSize: isMobile
                ? ".82rem"
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
                marginRight: "5px",
              }}
            />

            {isMobile
              ? "Create"
              : "Create Reminder"}
          </button>
        </header>

        {reminders.length === 0 ? (
          <div
            style={{
              padding:
                "50px 20px",

              textAlign:
                "center",

              opacity: 0.8,
            }}
          >
            <FaClock
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
              No Reminders Yet
            </h2>

            <p
              style={{
                marginBottom: 0,
              }}
            >
              Stay organized by
              creating your first
              reminder.
            </p>
          </div>
        ) : (
          reminders.map(
            (reminder) => {
              const overdueDays =
                getOverdueDays(
                  reminder
                );

              const isOverdue =
                overdueDays > 0;

              const isBusy =
                busyReminderId ===
                reminder._id;

              const isExporting =
                exportingId ===
                reminder._id;

              return (
                <div
                  key={
                    reminder._id
                  }
                  ref={(element) => {
                    if (element) {
                      reminderRefs.current[
                        reminder._id
                      ] = element;
                    } else {
                      delete reminderRefs.current[
                        reminder._id
                      ];
                    }
                  }}
                  style={{
                    minWidth: 0,
                  }}
                >
                  <Card
                    variant="glass"
                    style={{
                      width: "100%",
                      minWidth: 0,
                      margin: 0,

                      boxShadow:
                        highlightId ===
                        reminder._id
                          ? HIGHLIGHT_SHADOW
                          : isOverdue
                            ? OVERDUE_SHADOW
                            : undefined,

                      border: isOverdue
                        ? "2px solid rgba(255,70,70,.38)"
                        : undefined,

                      transition:
                        "box-shadow .35s ease, border-color .35s ease",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        flexDirection:
                          isMobile
                            ? "column"
                            : "row",

                        alignItems:
                          isMobile
                            ? "flex-start"
                            : "center",

                        justifyContent:
                          "space-between",

                        gap: "12px",

                        marginBottom:
                          "12px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,

                          overflowWrap:
                            "anywhere",
                        }}
                      >
                        <strong>
                          Title:
                        </strong>{" "}

                        {
                          reminder.title
                        }
                      </h3>

                      {isOverdue && (
                        <span
                          style={{
                            display:
                              "inline-flex",

                            alignItems:
                              "center",

                            gap: "6px",

                            color:
                              "#ff4d4d",

                            fontSize:
                              ".92rem",

                            fontWeight:
                              700,

                            whiteSpace:
                              isMobile
                                ? "normal"
                                : "nowrap",
                          }}
                        >
                          <FaExclamationTriangle
                            aria-hidden="true"
                          />

                          Overdue by{" "}
                          {
                            overdueDays
                          }{" "}
                          day
                          {overdueDays !==
                          1
                            ? "s"
                            : ""}
                        </span>
                      )}
                    </div>

                    <ReminderDetail
                      icon={
                        FaCalendarAlt
                      }
                      label="Due Date"
                      value={formatReminderDate(
                        reminder.dueDate
                      )}
                    />

                    <ReminderDetail
                      icon={FaClock}
                      label="Time"
                      value={
                        reminder.reminderTime ||
                        "Not set"
                      }
                    />

                    <ReminderDetail
                      icon={FaFlag}
                      label="Priority"
                      value={
                        reminder.priority ||
                        "Not set"
                      }
                      capitalize
                    />

                    <ReminderDetail
                      icon={FaTags}
                      label="Category"
                      value={
                        reminder.category ||
                        "Not set"
                      }
                    />

                    <p
                      style={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        flexWrap:
                          "wrap",

                        gap: "8px",
                      }}
                    >
                      <strong
                        style={{
                          display:
                            "inline-flex",

                          alignItems:
                            "center",
                        }}
                      >
                        <FaTasks
                          aria-hidden="true"
                          style={{
                            marginRight:
                              "6px",

                            color:
                              "#00be9f",
                          }}
                        />

                        Status:
                      </strong>

                      {reminder.completed ? (
                        <span
                          style={{
                            display:
                              "inline-flex",

                            alignItems:
                              "center",

                            gap: "6px",
                          }}
                        >
                          <FaCheckCircle
                            aria-hidden="true"
                            color="#00be9f"
                          />

                          Completed
                        </span>
                      ) : (
                        <span
                          style={{
                            display:
                              "inline-flex",

                            alignItems:
                              "center",

                            gap: "6px",
                          }}
                        >
                          <FaClock
                            aria-hidden="true"
                            color="#f59e0b"
                          />

                          Pending
                        </span>
                      )}
                    </p>

                    <div
                      style={{
                        display:
                          "flex",

                        flexDirection:
                          isMobile
                            ? "column"
                            : "row",

                        flexWrap:
                          "wrap",

                        gap: "10px",

                        marginTop:
                          "18px",
                      }}
                    >
                      <ReminderActionButton
                        icon={FaEdit}
                        label="Edit"
                        disabled={
                          isBusy ||
                          isExporting
                        }
                        isMobile={
                          isMobile
                        }
                        onClick={() =>
                          startEdit(
                            reminder
                          )
                        }
                      />

                      <ReminderActionButton
                        icon={
                          reminder.completed
                            ? FaUndo
                            : FaCheckCircle
                        }
                        label={
                          isBusy
                            ? "Updating..."
                            : reminder.completed
                              ? "Mark Pending"
                              : "Mark Complete"
                        }
                        disabled={
                          isBusy ||
                          isExporting
                        }
                        isMobile={
                          isMobile
                        }
                        onClick={() =>
                          handleToggle(
                            reminder._id
                          )
                        }
                      />

                      <ReminderActionButton
                        icon={
                          FaCalendarAlt
                        }
                        label={
                          isExporting
                            ? "Exporting..."
                            : "Export Calendar"
                        }
                        disabled={
                          isBusy ||
                          isExporting
                        }
                        isMobile={
                          isMobile
                        }
                        onClick={() =>
                          handleExport(
                            reminder
                          )
                        }
                      />

                      <ReminderActionButton
                        icon={FaTrash}
                        label={
                          isBusy
                            ? "Deleting..."
                            : "Delete"
                        }
                        disabled={
                          isBusy ||
                          isExporting
                        }
                        isMobile={
                          isMobile
                        }
                        deleteVariant
                        onClick={() =>
                          handleDelete(
                            reminder._id
                          )
                        }
                      />
                    </div>
                  </Card>
                </div>
              );
            }
          )
        )}
      </div>
    </Layout>
  );
}

function ReminderDetail({
  icon: Icon,
  label,
  value,
  capitalize = false,
}) {
  return (
    <p
      style={{
        overflowWrap:
          "anywhere",

        textTransform:
          capitalize
            ? "capitalize"
            : "none",
      }}
    >
      <strong>
        <Icon
          aria-hidden="true"
          style={{
            marginRight: "6px",
            color: "#00be9f",

            verticalAlign:
              "middle",
          }}
        />

        {label}:{" "}
      </strong>

      {value}
    </p>
  );
}

function ReminderActionButton({
  icon: Icon,
  label,
  disabled,
  isMobile,
  onClick,
  deleteVariant = false,
}) {
  return (
    <button
      type="button"
      className={`glow-top${
        deleteVariant
          ? " delete"
          : ""
      }`}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: isMobile
          ? "100%"
          : "auto",

        margin: 0,
      }}
    >
      <Icon
        aria-hidden="true"
        size={13}
        style={{
          marginRight: "6px",
        }}
      />

      {label}
    </button>
  );
}

export default Reminders;