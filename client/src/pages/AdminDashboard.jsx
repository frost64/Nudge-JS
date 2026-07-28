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

import {
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
  const { isMobile } = useContext(LayoutContext);
  const darkMode = user?.theme === "dark";

  const backgroundImage = darkMode
    ? dashboardDarkBg
    : dashboardLightBg;

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const confirm = useConfirm();

  const chartData = [
  { month: "Jan", users: 5 },
  { month: "Feb", users: 9 },
  { month: "Mar", users: 15 },
  { month: "Apr", users: 22 },
  { month: "May", users: 31 },
  { month: "Jun", users: 45 },
];

  const statCards = stats
  ? [
      {
        title: "Users",
        value: stats.users,
        icon: FaUsers,
        color: "#38bdf8",
      },
      {
        title: "Notes",
        value: stats.notes,
        icon: FaStickyNote,
        color: "#10b981",
      },
      {
        title: "Reminders",
        value: stats.reminders,
        icon: FaClock,
        color: "#f59e0b",
      },
      {
        title: "Birthdays",
        value: stats.birthdays,
        icon: FaBirthdayCake,
        color: "#ec4899",
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
      { name: "Notes", value: stats.notes },
      { name: "Reminders", value: stats.reminders },
      { name: "Birthdays", value: stats.birthdays },
      { name: "Links", value: stats.links },
    ]
  : [];

  const COLORS = [
  "#10b981", // Notes
  "#f59e0b", // Reminders
  "#ec4899", // Birthdays
  "#8b5cf6", // Links
];

const totalModules = pieData.reduce(
  (sum, item) => sum + item.value,
  0
);

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
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete user."
      );
    }
  };

  useEffect(() => {
  const loadData = async () => {
    setLoading(true);

    await Promise.all([
      fetchStats(),
      fetchUsers(),
    ]);

    setLoading(false);
  };

  loadData();
}, []);

const filteredUsers = users.filter((u) => {
  const value = search.toLowerCase();

  return (
    u.fullName.toLowerCase().includes(value) ||
    u.username.toLowerCase().includes(value) ||
    u.email.toLowerCase().includes(value)
  );
});

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
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <FaUserShield color="#38bdf8" />
      Admin
    </h1>

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
              padding: "24px",
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
  </>
)}

{activeTab === "users" && (
  <>
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaUsersCog color="#38bdf8" />
          Manage Users
        </h1>

        <div
          className="input-icon-wrapper"
          style={{
            maxWidth: "500px",
            marginBottom: "5px",
          }}
        >
          <FaSearch className="input-icon" />

          <input
            className="input-glow"
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
  <Card variant="glass">
    <h2>System Logs</h2>
    <p>Coming soon...</p>
  </Card>
)}

{activeTab === "suggestions" && (
  <Card variant="glass">
    <h2>Suggestions</h2>
    <p>Coming soon...</p>
  </Card>
)}

{activeTab === "activities" && (
  <Card variant="glass">
    <h2>Recent Activities</h2>
    <p>Coming soon...</p>
  </Card>
)}
      </div>
    </Layout>
  );
}

export default AdminDashboard;