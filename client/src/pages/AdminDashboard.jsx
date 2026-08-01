import { useEffect, useState, useContext } from "react";
import { LayoutContext } from "../components/Layout";
import { useConfirm } from "../context/ConfirmContext";
import toast from "react-hot-toast";
import api from "../services/api";

import { AuthContext } from "../context/AuthContext";

import Layout from "../components/Layout";
import Card from "../components/Card";

import dashboardLightBg from "../assets/backgrounds/dashboard-light.png";
import dashboardDarkBg from "../assets/backgrounds/dashboard-dark.png";
import LoadingSpinner from "../components/LoadingSpinner";

import { useNavigate } from "react-router-dom";

import {
  FaFileExport,
  FaInfoCircle,
  FaBell,
  FaQuestionCircle,
  FaUserPlus,
  FaUserMinus,
  FaEdit,
  FaTrash,
  FaCircle,
  FaChartLine,
  FaChartPie,
  FaUsersCog,
  FaClipboardList,
  FaLightbulb,
  FaHistory,
  FaSearch,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaTrashAlt,
  FaUserShield,
  FaUsers,
  FaStickyNote,
  FaClock,
  FaBirthdayCake,
  FaLink,
  FaServer,
  FaDatabase,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaCommentDots,
  FaHeading
} from "react-icons/fa";

import {
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  Label,
} from "recharts";


function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const {
  isMobile,
  isTablet,
  isDesktop,
} = useContext(LayoutContext);
  const darkMode = user?.theme === "dark";

  const backgroundImage = darkMode
    ? dashboardDarkBg
    : dashboardLightBg;

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSuggestions, setRecentSuggestions] = useState([]);
  const [systemStatus, setSystemStatus] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logSearch, setLogSearch] = useState("");
  const [logFilter, setLogFilter] = useState("all");
  const confirm = useConfirm();

  const [chartData, setChartData] = useState([]);

  const navigate = useNavigate();

  const activityIcons = {
  user_registered: FaUserPlus,
  user_deleted: FaUserMinus,

  note_created: FaStickyNote,
  note_updated: FaEdit,
  note_deleted: FaTrash,

  reminder_created: FaClock,
  reminder_updated: FaEdit,
  reminder_deleted: FaTrash,

  birthday_created: FaBirthdayCake,
  birthday_updated: FaEdit,
  birthday_deleted: FaTrash,

  link_created: FaLink,
  link_updated: FaEdit,
  link_deleted: FaTrash,

  suggestion_submitted: FaLightbulb,

  admin_deleted_user: FaUserShield,
};

const activityMeta = {
  user_registered: {
    icon: FaUserPlus,
    color: "#22c55e",
  },
  user_deleted: {
    icon: FaUserMinus,
    color: "#ef4444",
  },

  note_created: {
    icon: FaStickyNote,
    color: "#3b82f6",
  },
  note_updated: {
    icon: FaEdit,
    color: "#f59e0b",
  },
  note_deleted: {
    icon: FaTrash,
    color: "#ef4444",
  },

  reminder_created: {
    icon: FaBell,
    color: "#eab308",
  },
  reminder_updated: {
    icon: FaEdit,
    color: "#f59e0b",
  },
  reminder_deleted: {
    icon: FaTrash,
    color: "#ef4444",
  },

  birthday_created: {
    icon: FaBirthdayCake,
    color: "#ec4899",
  },
  birthday_updated: {
    icon: FaEdit,
    color: "#f59e0b",
  },
  birthday_deleted: {
    icon: FaTrash,
    color: "#ef4444",
  },

  link_created: {
    icon: FaLink,
    color: "#8b5cf6",
  },
  link_updated: {
    icon: FaEdit,
    color: "#f59e0b",
  },
  link_deleted: {
    icon: FaTrash,
    color: "#ef4444",
  },

  suggestion_created: {
    icon: FaLightbulb,
    color: "#06b6d4",
  },
};

const activityBadge = {
  user_registered: {
    label: "REGISTERED",
    color: "#22c55e",
  },
  user_deleted: {
    label: "DELETED",
    color: "#ef4444",
  },

  note_created: {
    label: "CREATED",
    color: "#22c55e",
  },
  note_updated: {
    label: "UPDATED",
    color: "#f59e0b",
  },
  note_deleted: {
    label: "DELETED",
    color: "#ef4444",
  },

  reminder_created: {
    label: "CREATED",
    color: "#22c55e",
  },
  reminder_updated: {
    label: "UPDATED",
    color: "#f59e0b",
  },
  reminder_deleted: {
    label: "DELETED",
    color: "#ef4444",
  },

  birthday_created: {
    label: "CREATED",
    color: "#22c55e",
  },
  birthday_updated: {
    label: "UPDATED",
    color: "#f59e0b",
  },
  birthday_deleted: {
    label: "DELETED",
    color: "#ef4444",
  },

  link_created: {
    label: "CREATED",
    color: "#22c55e",
  },
  link_updated: {
    label: "UPDATED",
    color: "#f59e0b",
  },
  link_deleted: {
    label: "DELETED",
    color: "#ef4444",
  },

  suggestion_created: {
    label: "NEW",
    color: "#06b6d4",
  },
};
  const statCards = stats
  ? [
      {
        title: "Users",
        value: stats.users,
        icon: FaUsers,
        color: "#38bdf8",
      },
      {
        title: "Birthdays",
        value: stats.birthdays,
        icon: FaBirthdayCake,
        color: "#ec4899",
      },
      {
        title: "Reminders",
        value: stats.reminders,
        icon: FaClock,
        color: "#f59e0b",
      },
      {
        title: "Notes",
        value: stats.notes,
        icon: FaStickyNote,
        color: "#10b981",
      },
      {
        title: "Links",
        value: stats.links,
        icon: FaLink,
        color: "#8b5cf6",
      },
    ]
  : [];

  const pieData = stats
  ? [ 
      { name: "Birthdays", value: stats.birthdays },
      { name: "Reminders", value: stats.reminders },
      { name: "Notes", value: stats.notes },
      { name: "Links", value: stats.links },
    ]
  : [];

  const COLORS = [
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
];

const totalModules = pieData.reduce(
  (sum, item) => sum + item.value,
  0
);

  const logStats = {
    all: logs.length,
    success: logs.filter((l) => l.level === "success").length,
    warning: logs.filter((l) => l.level === "warning").length,
    error: logs.filter((l) => l.level === "error").length,
    info: logs.filter((l) => l.level === "info").length,
  };

const fetchLogs = async () => {
  try {
    const res = await api.get("/admin/logs");
    setLogs(res.data);
  } catch (error) {
    console.log(error);

    toast.error(
      error.response?.data?.message ||
      "Failed to load system logs."
    );
  }
};
const filteredLogs = logs.filter((log) => {
  const search = logSearch.toLowerCase().trim();

  const matchesSearch =
    !search ||
    log.message?.toLowerCase().includes(search) ||
    log.source?.toLowerCase().includes(search) ||
    log.level?.toLowerCase().includes(search);

  const matchesFilter =
    logFilter === "all" ||
    log.level === logFilter;

  return matchesSearch && matchesFilter;
});

const getActivityDate = (date) => {
  const created = new Date(date);
  const now = new Date();

  const diffMinutes = Math.floor(
    (now - created) / 60000
  );

  if (diffMinutes < 1) return "Just now";

  if (diffMinutes < 60)
    return `${diffMinutes}m ago`;

  return created.toLocaleDateString();
};

const getSuggestionDate = (date) => {
  const created = new Date(date);
  const now = new Date();

  const diffMinutes = Math.floor(
    (now - created) / 60000
  );

  const time = created.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffMinutes < 1) {
    return `${time} • Just now`;
  }

  if (diffMinutes < 60) {
    return `${time} • ${diffMinutes}m ago`;
  }

  return `${time} • ${created.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
};

const getLogDate = (date) => {
  const created = new Date(date);
  const now = new Date();

  const diffMinutes = Math.floor(
    (now - created) / 60000
  );

  if (diffMinutes < 1) return "Just now";

  if (diffMinutes < 60) {
    return `${created.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} • ${diffMinutes}m ago`;
  }

  return created.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fetchSystemStatus = async () => {
  try {
    const res = await api.get("/admin/system-status");
    setSystemStatus(res.data);
  } catch (error) {
    console.log(error);

    toast.error(
      error.response?.data?.message ||
      "Failed to load system status."
    );
  }
};

const refreshDashboard = async () => {
  await Promise.all([
    fetchStats(),
    fetchRecentSuggestions(),
    fetchRecentActivities(),
    fetchSystemStatus(),
    fetchLogs(),
  ]);
};

const fetchActivities = async () => {
  try {
    const res = await api.get("/admin/activities");
    setActivities(res.data);
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to load activities."
    );
  }
};

const fetchUserGrowth = async () => {
  try {
    const res = await api.get("/admin/user-growth");
    setChartData(res.data);
  } catch (error) {
    console.log(error);
  }
};


const fetchSuggestions = async () => {
  try {
    const res = await api.get("/admin/suggestions");
    setSuggestions(res.data);
  } catch (error) {
    toast.error("Failed to load suggestions.");
  }
};

const markSuggestionRead = async (id) => {
  try {
    await api.patch(`/admin/suggestions/${id}/read`);

    setSuggestions((prev) =>
      prev.map((suggestion) =>
        suggestion._id === id
          ? { ...suggestion, status: "read" }
          : suggestion
      )
    );
    setRecentSuggestions((prev) =>
      prev.map((suggestion) =>
        suggestion._id === id
          ? { ...suggestion, status: "read" }
          : suggestion
      )
    );

    toast.success("Suggestion marked as read.");
    fetchRecentActivities();
  } catch (error) {
    toast.error("Failed to update suggestion.");
  }
};

const fetchRecentSuggestions = async () => {
  try {
    const res = await api.get(
      "/admin/recent-suggestions"
    );

    setRecentSuggestions(res.data);
  } catch (error) {
    console.log(error);

    toast.error(
      error.response?.data?.message ||
      "Failed to load recent suggestions."
    );
  }
};

const handleClearLogs = async () => {
  const label =
    logFilter === "all"
      ? "all system logs"
      : `${logFilter} logs`;

  const confirmed = await confirm({
    title: "Clear Logs",
    message: `Are you sure you want to permanently delete ${label}?`,
    confirmText: "Clear",
    cancelText: "Cancel",
    variant: "danger",
  });

  if (!confirmed) return;

  try {
    await api.delete(
      `/admin/logs?level=${logFilter}`
    );

    await fetchLogs();
    toast.success(
      logFilter === "all"
        ? "All logs cleared."
        : `${logFilter} logs cleared.`
    );
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Failed to clear logs."
    );
  }
};

const handleExportLogs = async () => {
  try {
    // Remove fields you don't want to export
    const exportLogs = logs.map(
      ({
        _id,
        __v,
        updatedAt,
        ...log
      }) => log
    );

    const backup = {
      application: "Nudge",
      type: "System Logs Backup",
      exportedAt: new Date().toISOString(),
      totalLogs: exportLogs.length,
      logs: exportLogs,
    };

    const blob = new Blob(
      [
        JSON.stringify(
          backup,
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "nudge-system-logs.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    toast.success(
      "Logs exported successfully."
    );

    const confirmed = await confirm({
      title: "Clear Exported Logs",
      message:
        "Do you want to clear all exported logs?",
      confirmText: "Clear",
      cancelText: "Keep Logs",
      variant: "danger",
    });

    if (!confirmed) return;

    await api.delete(
      "/admin/logs?level=all"
    );

    await fetchLogs();

    toast.success(
      "All logs cleared."
    );

  } catch (error) {
    console.log(error);

    toast.error(
      error.response?.data?.message ||
      "Failed to export logs."
    );
  }
};

const deleteSuggestion = async (id) => {
  const confirmed = await confirm({
    title: "Delete Suggestion",
    message:
      "Are you sure you want to delete this suggestion?",
    confirmText: "Delete",
    cancelText: "Cancel",
  });

  if (!confirmed) return;

  try {
    await api.delete(`/admin/suggestions/${id}`);

    setSuggestions((prev) =>
      prev.filter(
        (suggestion) => suggestion._id !== id
      )
    );
    setRecentSuggestions((prev) =>
      prev.filter(
        (suggestion) => suggestion._id !== id
      )
    );

    toast.success("Suggestion deleted.");
    fetchRecentActivities();
  } catch (error) {
    toast.error("Failed to delete suggestion.");
  }
};


  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load statistics."
      );
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load users."
      );
    }
  };

  const fetchRecentActivities = async () => {
  try {
    const res = await api.get("/admin/recent-activities");

    setRecentActivities(res.data);
  } catch (error) {
    console.log(error);

    toast.error(
      error.response?.data?.message ||
      "Failed to load recent activities."
    );
  }
};

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete User",
      message:
        "Are you sure you want to delete this user? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${id}`);

      toast.success("User deleted successfully.");

      fetchUsers();
      fetchStats();
      fetchRecentActivities();
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete user."
      );
    }
  };

const getLogMeta = (level) => {
  switch (level) {
    case "success":
      return {
        icon: FaCheckCircle,
        color: "#10b981",
      };

    case "warning":
      return {
        icon: FaExclamationTriangle,
        color: "#f59e0b",
      };

    case "error":
      return {
        icon: FaTimesCircle,
        color: "#ef4444",
      };

    default:
      return {
        icon: FaInfoCircle,
        color: "#3b82f6",
      };
  }
};


useEffect(() => {
  if (activeTab === "suggestions") {
    fetchSuggestions();
  }
}, [activeTab]);
  

useEffect(() => {
  const loadData = async () => {
    setLoading(true);

    await Promise.all([
      fetchStats(),
      fetchUsers(),
      fetchRecentSuggestions(),
      fetchRecentActivities(),
      fetchSystemStatus(),
      fetchUserGrowth(),
      fetchLogs(),
    ]);

    setLoading(false);
  };

  loadData();
}, []);

useEffect(() => {
  if (activeTab !== "dashboard") return;

  // Refresh immediately whenever Dashboard becomes active
  refreshDashboard();

  const interval = setInterval(() => {
    refreshDashboard();
  }, 30000);

  return () => clearInterval(interval);
}, [activeTab]);

useEffect(() => {
  if (activeTab !== "logs") return;

  fetchLogs();

  const interval = setInterval(() => {
    fetchLogs();
  }, 15000); // 15 seconds

  return () => clearInterval(interval);
}, [activeTab]);


useEffect(() => {
  if (activeTab === "activities") {
    fetchActivities();
  }
}, [activeTab]);

const filteredUsers = users.filter((u) => {
  const value = search.toLowerCase();

  return (
    u.fullName.toLowerCase().includes(value) ||
    u.username.toLowerCase().includes(value) ||
    u.email.toLowerCase().includes(value)
  );
});

const serviceIcons = {
  Database: <FaDatabase size={15} />,
  "API Server": <FaServer size={15} />,
  Authentication: <FaLock size={15} />,
  "Birthdays": <FaBirthdayCake size={15} />,
  "Reminders": <FaClock size={15} />,
  "Notes": <FaStickyNote size={15} />,
  "Links": <FaLink size={15} />,
};

const allOperational =
  systemStatus?.length > 0 &&
  systemStatus.every(
    (service) => service.status === "Operational"
  );

const allDown =
  systemStatus?.length > 0 &&
  systemStatus.every(
    (service) => service.status === "Down"
  );

const overallStatus = allOperational
  ? "Operational"
  : allDown
  ? "Down"
  : "Warning";

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

      display: "flex",
      flexDirection: "column",
    }}
  >
    <h1
      style={{
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <FaUserShield color="#38bdf8" />
      Admin
    </h1>
    <div>


    <div
      className="glow-top left"
      style={{ marginBottom: "12px" }}
      onClick={() => setActiveTab("dashboard")}
    >
      <FaChartPie style={{ marginRight: 10 }} />
      Dashboard
    </div>

    <div
      className="glow-top left"
      style={{ marginBottom: "12px" }}
      onClick={() => setActiveTab("users")}
    >
      <FaUsersCog style={{ marginRight: 10 }} />
      Manage Users
    </div>

    <div
      className="glow-top left"
      style={{ marginBottom: "12px" }}
      onClick={() => setActiveTab("logs")}
    >
      <FaClipboardList style={{ marginRight: 10 }} />
      System Logs
    </div>

    <div
      className="glow-top left"
      style={{ marginBottom: "12px" }}
      onClick={() => setActiveTab("suggestions")}
    >
      <FaLightbulb style={{ marginRight: 10 }} />
      Suggestions
    </div>

    <div
      className="glow-top left"
      style={{ marginBottom: "12px" }}
      onClick={() => setActiveTab("activities")}
    >
      <FaHistory style={{ marginRight: 10 }} />
      Recent Activities
    </div>
</div>


  <div style={{ marginTop: "auto" }}>
  <Card
    variant="glass"
    style={{
      padding: "18px",
    }}
  >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
  <div
    style={{
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      background:
        overallStatus === "Operational"
          ? "#10b98122"
          : overallStatus === "Down"
          ? "#ef444422"
          : "#f59e0b22",

      border: `1px solid ${
        overallStatus === "Operational"
          ? "#10b98155"
          : overallStatus === "Down"
          ? "#ef444455"
          : "#f59e0b55"
      }`,

      display: "flex",
      justifyContent: "center",
      alignItems: "center",

      boxShadow: `0 0 20px ${
        overallStatus === "Operational"
          ? "#10b98144"
          : overallStatus === "Down"
          ? "#ef444444"
          : "#f59e0b44"
      }`,
    }}
  >
    <FaShieldAlt
      size={24}
      color={
        overallStatus === "Operational"
          ? "#10b981"
          : overallStatus === "Down"
          ? "#ef4444"
          : "#f59e0b"
      }
    />
  </div>

  <div>
  <h3
    style={{
      margin: 0,
      marginBottom: "10px",
      fontSize: "1rem",
    }}
  >
    System Status
  </h3>

  <span
    style={{
      display: "inline-block",
      background:
        overallStatus === "Operational"
          ? "#10b98122"
          : overallStatus === "Down"
          ? "#ef444422"
          : "#f59e0b22",

      color:
        overallStatus === "Operational"
          ? "#10b981"
          : overallStatus === "Down"
          ? "#ef4444"
          : "#f59e0b",

      border: `1px solid ${
        overallStatus === "Operational"
          ? "#10b98155"
          : overallStatus === "Down"
          ? "#ef444455"
          : "#f59e0b55"
      }`,

      padding: "4px 8px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}
  >
    {overallStatus === "Operational"
      ? "All systems operational"
      : overallStatus === "Down"
      ? "All systems are down"
      : "Check system status"}
  </span>
</div>
      </div>
    </Card>
    </div>
  </Card>
);


if (loading) {
  return (
    <Layout backgroundImage={backgroundImage}>
      <LoadingSpinner />
    </Layout>
  );
}
  return (
    <Layout
      sidebar={sidebar}
      backgroundImage={backgroundImage}
      cardVariant="glass"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
{activeTab === "dashboard" && stats && (
  <>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
        gap: "10px",
      }}
    >
      
      {statCards.map((card) => {
        const Icon = card.icon;
        

        return (
          <Card
            key={card.title}
            variant="glass"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              padding: "10px",
              transition: ".3s",
              cursor: "default",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${card.color}22`,
                color: card.color,
                fontSize: "28px",
              }}
            >
              <Icon />
            </div>

            <div>
              <div
                style={{
                  opacity: 0.75,
                  fontSize: ".95rem",
                }}
              >
                {card.title}
              </div>

              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  marginTop: "4px",
                }}
              >
                {card.value}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
<div
  style={{
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : "2fr 1fr",
    gap: "10px",
    marginTop: "5px",
  }}
>
    <Card
  variant="glass"
  style={{
    flex: 2,
    height: "250px",
    padding: "15px",
  }}
>
  <h3
    style={{
      display: "flex",
      alignItems: "center",
      gap: "20px",
      marginBottom: "5px",
    }}
  >
    <FaChartLine color="#38bdf8" />
    User Growth
  </h3>

  <ResponsiveContainer
    width="100%"
    height={200}
  >
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="month" />

      <YAxis />

      <Tooltip />

      <Line
        type="monotone"
        dataKey="users"
        stroke="#38bdf8"
        strokeWidth={3}
        dot={{ r: 5 }}
        activeDot={{ r: 8 }}
      />
    </LineChart>
  </ResponsiveContainer>
</Card>
<Card
  variant="glass"
  style={{
    flex: 1,
    height: "250px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  }}
>
<div
  style={{
    position: "relative",
    width: "100%",
    height: "100%",
  }}
>
  
  <ResponsiveContainer>
    <PieChart>
      <Pie
  data={pieData}
  dataKey="value"
  nameKey="name"
  outerRadius={85}
  innerRadius={55}
  paddingAngle={4}
>
  {pieData.map((entry, index) => (
    <Cell
      key={entry.name}
      fill={COLORS[index % COLORS.length]}
    />
  ))}

  <Label
    content={({ viewBox }) => {
      if (!viewBox) return null;

      const { cx, cy } = viewBox;

      return (
        <g>
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            fill={darkMode ? "#9ca3af" : "#6b7280"}
            fontSize={20}
          >
            Total
          </text>

          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            fill={darkMode ? "#fff" : "#111827"}
            fontSize={28}
            fontWeight="bold"
          >
            {totalModules}
          </text>
        </g>
      );
    }}
  />
</Pie>

      <Tooltip />

      <Legend
        layout="vertical"
        align="right"
        verticalAlign="middle"
        iconType="square"
      />
    </PieChart>
  </ResponsiveContainer>
</div>
    </Card>
    
    
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile
          ? "1fr"
          : isTablet
          ? "repeat(2, 1fr)"
          : "repeat(3, 1fr)",
        gap: "20px",
        height: "100%",
        width: "100%",
      }}
    >
  <Card 
    variant="glass"
    style={{
      width: "100%",
      height: "100%",
      padding: "24px",
      borderRadius: "22px",
    }}
  >
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "18px",
    }}
  >
    <h3
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: 0,
      }}
    >
      <FaServer color="#38bdf8" />
      System Status
    </h3>
  </div>

  {systemStatus.map((service) => (
    <div
      key={service.name}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        borderBottom: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(56,189,248,.12)",
            color: "#22d3ee",
            fontSize: "24px",
          }}
        >
          {serviceIcons[service.name]}
        </div>

        <span
          style={{
            fontSize: "1rem",
            fontWeight: 500,
          }}
        >
          {service.name}
        </span>
      </div>

      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color:
          service.status === "Operational"
            ? "#22c55e"
            : "#ef4444",
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background:
              service.status === "Operational"
                ? "#22c55e"
                : "#ef4444",

            boxShadow: service.status === "Operational"
              ? "0 0 10px #22c55e"
              : "0 0 10px #ef4444",
          }}
        />
        {service.status}
      </span>
    </div>
  ))}
</Card>

<Card
  variant="glass"
  style={{
    width: "100%",
    height: "100%",
    padding: "24px",
    borderRadius: "22px",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px"
    }}
  >
    <h3
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: 0,
      }}
    >
      <FaHistory color="#38bdf8" />
      Recent Activity
    </h3>

    <button
      className="glow-top"
      onClick={() => setActiveTab("activities")}
    >
      View All
    </button>
  </div>

  {recentActivities.length === 0 ? (
  <p style={{ opacity: 0.7 }}>
    No recent activity.
  </p>
) : (
  recentActivities.map((activity) => {
    const Icon =
      activityIcons[activity.type] || FaCircle;

    return (
      <div
        key={activity._id}
        style={{
          display: "flex",
          gap: "8px",
          padding: "5px 0",
          borderBottom:
            "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${activity.color}20`,
            color: activity.color,
            flexShrink: 0,
          }}
        >
          <Icon size={15} />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <strong style={{fontSize: "13px"}}>{activity.message}</strong>
          </div>

          <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
    fontSize: ".8rem",
    opacity: 0.65,
  }}
>
  <span>
    {new Date(activity.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </span>

  <span>{getActivityDate(activity.createdAt)}</span>
</div>
        </div>
      </div>
    );
  })
)}
</Card>

  <Card 
    variant="glass"
    style={{
      width: "100%",
      height: "100%",
      padding: "24px",
      borderRadius: "22px",
    }}
  >
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "18px",
    }}
  >
    <h3
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: 0,
      }}
    >
      <FaLightbulb color="#fbbf24" />
      Suggestions
    </h3>

    <button
      className="glow-top"
      style={{
        padding: "8px 18px",
      }}
      onClick={() => setActiveTab("suggestions")}
    >
      View All
    </button>
  </div>

  {recentSuggestions.length === 0 ? (
    <p
      style={{
        opacity: 0.7,
      }}
    >
      No suggestions yet.
    </p>
  ) : (
    recentSuggestions.map((item) => (
      <div
        key={item._id}
        style={{
          padding: "4px 0",
          borderBottom:
            "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>{item.title}</strong>

          <span
            style={{
              fontSize: ".8rem",
              color:
                item.status === "new"
                  ? "#22c55e"
                  : "#38bdf8",
            }}
          >
            {item.status}
          </span>
        </div>

        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: ".9rem",
    opacity: 0.8,
  }}
>
  <span style={{color: "purple"}}>{item.fullName}</span>

  <span
    style={{
      fontSize: ".8rem",
      opacity: 0.7,
    }}
  >
    {new Date(item.createdAt).toLocaleDateString()}
  </span>
</div>
      </div>
    ))
  )}
</Card>
</div>
  </>
)}

{activeTab === "users" && (
  <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: 0,
            }}
          >
            <FaUsersCog color="#38bdf8" />
            Manage Users
          </h1>

          <div
            className="input-icon-wrapper"
            style={{
              width: "300px",
              flex: "0 0 auto",
              margin: 0,
            }}
          >
            <FaSearch className="input-icon" />

            <input
              className="input-glow"
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
              }}
            />
          </div>
        </div>

       {filteredUsers.length === 0 ? (
        <Card variant="glass">
          <p>No users found.</p>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(2, minmax(0, 1fr))",
            gap: "20px",
            width: "100%",
          }}
        >
          {filteredUsers.map((user) => (
            <Card
              key={user._id}
              variant="glass"
              style={{
                padding: "24px",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "5px",
                    }}
                  >
                    <FaUser color="#38bdf8" />

                    {user.fullName}
                  </h3>

                  <p>
                    <FaUser
                      style={{
                        marginRight: "8px",
                        color: "#00be9f",
                      }}
                    />
                    @{user.username}
                  </p>

                  <p>
                    <FaEnvelope
                      style={{
                        marginRight: "8px",
                        color: "#00be9f",
                      }}
                    />
                    {user.email}
                  </p>

                  <p>
                    <FaCalendarAlt
                      style={{
                        marginRight: "8px",
                        color: "#00be9f",
                      }}
                    />
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "15px",
                  }}
                >
                  <span
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      fontWeight: 600,
                      background:
                        user.role === "admin"
                          ? "rgba(168,85,247,.18)"
                          : "rgba(56,189,248,.18)",
                      color:
                        user.role === "admin"
                          ? "#c084fc"
                          : "#38bdf8",
                    }}
                  >
                    <FaUserShield
                      style={{
                        marginRight: "6px",
                      }}
                    />

                    {user.role}
                  </span>

                  {user.role === "user" && (
                    <button
                      className="glow-top delete"
                      onClick={() =>
                        handleDelete(user._id)
                      }
                    >
                      <FaTrashAlt
                        style={{
                          marginRight: "8px",
                        }}
                      />
                      Delete User
                    </button>
                  )}
                </div>
              </div>
            </Card>
    ))}
  </div>
        )}
        </>
        )}


{activeTab === "logs" && (
  <>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        marginBottom: "8px",
        flexWrap: "wrap",
      }}
    >
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          margin: 0,
        }}
      >
        <FaHistory color="#38bdf8" />
        System Logs
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          className="input-icon-wrapper"
          style={{
            width: "300px",
            flex: "0 0 auto",
            marginBottom: 0,
            marginLeft: 0,
          }}
        >
          <FaSearch className="input-icon" />

          <input
            type="text"
            placeholder="Search logs..."
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            className="input-glow"
          />
        </div>

        <button
          className="glow-top"
          onClick={handleExportLogs}
        >
          <FaFileExport
            style={{
              marginRight: "8px",
            }}
          />
          Export Logs
        </button>
      </div>

    </div>

    <p
      style={{
        opacity: 0.7,
        marginBottom: "24px",
      }}
    >
      Monitor backend services, security events, and infrastructure activity.
    </p>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {[
          {
            key: "all",
            label: "All",
            color: "#38bdf8",
          },
          {
            key: "success",
            label: "Success",
            color: "#10b981",
          },
          {
            key: "warning",
            label: "Warning",
            color: "#f59e0b",
          },
          {
            key: "error",
            label: "Error",
            color: "#ef4444",
          },
          {
            key: "info",
            label: "Info",
            color: "#3b82f6",
          },
        ].map((item) => (
          <button
            key={item.key}
            className="glow-top"
            onClick={() => setLogFilter(item.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 16px",
              borderRadius: "999px",

              background:
                logFilter === item.key
                  ? `${item.color}22`
                  : undefined,

              border:
                logFilter === item.key
                  ? `1px solid ${item.color}55`
                  : undefined,

              color:
                logFilter === item.key
                  ? item.color
                  : undefined,

              fontWeight:
                logFilter === item.key
                  ? 700
                  : 500,

              transition: ".25s ease",
            }}
          >
            <span>{item.label}</span>

            <span
              style={{
                minWidth: "22px",
                height: "22px",
                borderRadius: "999px",

                background:
                  logFilter === item.key
                    ? item.color
                    : "rgba(255,255,255,.08)",

                color:
                  logFilter === item.key
                    ? "#fff"
                    : "inherit",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                fontSize: ".75rem",
                fontWeight: 700,
              }}
            >
              {logStats[item.key]}
            </span>
          </button>
        ))}
      </div>

      <button
        className="glow-top delete"
        onClick={handleClearLogs}
      >
        <FaTrashAlt
          style={{
            marginRight: "8px",
          }}
        />

        {logFilter === "all"
          ? "Clear All Logs"
          : `Clear ${
              logFilter.charAt(0).toUpperCase() +
              logFilter.slice(1)
            } Logs`}
      </button>
    </div>
    
    {filteredLogs.length === 0 ? (
    <Card variant="glass">
      <p
        style={{
          textAlign: "center",
          opacity: 0.7,
          padding: "20px 0",
        }}
      >
        No matching logs found.
      </p>
    </Card>
  ) : (
  filteredLogs.map((log) => {
      const meta = getLogMeta(log.level);
      const Icon = meta.icon;
      return(
      <Card
        key={log._id}
        variant="glass"
        style={{
          padding: "20px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: `${meta.color}22`,
                border: `1px solid ${meta.color}55`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: `0 0 18px ${meta.color}33`,
                flexShrink: 0,
              }}
            >
              <Icon
                size={18}
                color={meta.color}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,

                  background:
                    log.level === "success"
                      ? "#10b98122"
                      : log.level === "warning"
                      ? "#f59e0b22"
                      : log.level === "error"
                      ? "#ef444422"
                      : "#3b82f622",

                  color: meta.color,

                  border: `1px solid ${meta.color}55`,
                }}
              >
                {log.level.toUpperCase()}
              </span>

              <span
                style={{
                  fontWeight: 600,
                  opacity: 0.8,
                }}
              >
                {log.source}
              </span>
            </div>
          </div>
        </div>

        <h3
          style={{
            margin: "20px 0 14px",
            fontSize: "1.15rem",
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          {log.message}
        </h3>
        {log.details &&
          Object.keys(log.details).length > 0 && (
            <div
              style={{
                marginTop: "14px",
                padding: "12px 16px",
                borderRadius: "14px",

                background: darkMode
                  ? "rgba(255,255,255,.04)"
                  : "rgba(0, 113, 123, 0.09)",

                border: `1px solid ${
                  darkMode
                    ? "rgba(255,255,255,.08)"
                    : "rgba(0, 229, 255, 0.11)"
                }`,

                boxShadow: darkMode
                  ? "0 8px 24px rgba(0,0,0,.18)"
                  : "0 8px 24px rgba(0,0,0,.05)",

                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {Object.entries(log.details).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <strong
                    style={{
                      minWidth: "90px",
                      fontSize: ".82rem",
                      fontWeight: 700,
                      textTransform: "capitalize",
                      color: darkMode
                        ? "rgba(255,255,255,.7)"
                        : "rgba(0,0,0,.65)"
                    }}
                  >
                    {key}:
                  </strong>

                  <span
                    style={{
                      fontSize: ".9rem",
                      wordBreak: "break-word",
                      color: darkMode
                        ? "rgba(255,255,255,.92)"
                        : "#1f2937"
                    }}
                  >
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "18px",
          }}
        >
          <small
            style={{
              opacity: 0.6,
              fontSize: ".85rem",
            }}
          >
            {getLogDate(log.createdAt)}
          </small>
        </div>
    </Card>
    );
  })
)}
  </>
)}

{activeTab === "suggestions" && (
  <>
    <h2
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <FaLightbulb color="#fbbf24" />
      User Suggestions
    </h2>

    {suggestions.length === 0 ? (
      <Card variant="glass">
        <p>No suggestions yet.</p>
      </Card>
    ) : (
      suggestions.map((suggestion) => (
        <Card
          key={suggestion._id}
          variant="glass"
          style={{
            padding: "24px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                flex: 1,
                width: "100%",
              }}
            >
              <h3>Title: {suggestion.title}</h3>
              <p
                style={{
                  lineHeight: 1.8,
                }}
              ><FaCommentDots color="#60a5fa" /> {suggestion.message}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  marginTop: "16px",
                }}
              >
                <div>
                  <strong style={{color: "green"}}>{suggestion.fullName}</strong>
                  {" • "}
                  <span style={{color:"purple", opacity: 0.8 }}>
                    @{suggestion.username}
                  </span>
                </div>

                <small
                  style={{
                    opacity: 0.7,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                > {getSuggestionDate(suggestion.createdAt)}
                </small>
              </div>
            </div>

            <span
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                background:
                  suggestion.status === "new"
                    ? "rgba(34,197,94,.15)"
                    : "rgba(59,130,246,.15)",
                color:
                  suggestion.status === "new"
                    ? "#22c55e"
                    : "#3b82f6",
                fontWeight: 600,
              }}
            >
              {suggestion.status}
            </span>
          </div>

          

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            {suggestion.status === "new" && (
              <button
                className="glow-top"
                onClick={() =>
                  markSuggestionRead(suggestion._id)
                }
              >
                Mark as Read
              </button>
            )}

            <button
              className="glow-top delete"
              onClick={() =>
                deleteSuggestion(suggestion._id)
              }
            >
              Delete
            </button>
          </div>
        </Card>
      ))
    )}
  </>
)}

{activeTab === "activities" && (
  <>
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <FaHistory color="#be24fb"/> Recent Activity
        </h2>

          {activities.length === 0 ? (
            <Card variant="glass">
              <p>No recent activity found.</p>
            </Card>
          ) : (
            activities.map((activity) => {
            const [username, ...action] = activity.message.split(" ");
            const meta =
              activityMeta[activity.type] || {
                icon: FaQuestionCircle,
                color: "#94a3b8",
              };

            const Icon = meta.icon;
            const badge =
            activityBadge[activity.type] || {
              label: activity.type.toUpperCase(),
              color: "#64748b",
            };

            return (
              <Card
                key={activity._id}
                variant="glass"
                style={{
                  padding: "10px",
                  borderRadius: "18px",
                  margin: 0
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background: meta.color,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "#fff",
                        flexShrink: 0,
                        boxShadow: `0 0 18px ${meta.color}55`,
                      }}
                    >
                      <Icon size={15} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: "6px",
                          lineHeight: "1.5",
                        }}
                      >
                        <span
                          style={{
                            color: "#9e38f8",
                            fontWeight: 700,
                          }}
                        >
                          {username}
                        </span>{" "}
                        {action.join(" ")}
                      </div>

                      <div
                        style={{
                          fontSize: "0.9rem",
                          opacity: 0.7,
                        }}
                      >
                        {activity.performedBy}
                      </div>
                    </div>
                  </div>

                 <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      background: `${badge.color}22`,
                      color: badge.color,
                      border: `1px solid ${badge.color}55`,
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {badge.label}
                  </span>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      opacity: 0.7,
                      fontSize: "0.85rem",
                    }}
                  >
                    <FaClock />
                    {activity.time}
                  </div>
                </div>
                </div>
              </Card>
          );
        })
      )}
      </>
)}
      </div>
    </Layout>
  );
}

export default AdminDashboard;