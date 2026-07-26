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

  const confirm = useConfirm();

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
      }}
    >
      Admin 📊
    </h1>

    {!stats ? (
      <p style={{ paddingLeft: "20px" }}>
        Loading statistics...
      </p>
    ) : (
      <>
        <div
          className="glow-top left"
          style={{
            paddingLeft: "20px",
            marginBottom: "12px",
            borderRadius: "10px",
          }}
        >
          👥 Users: {stats.users}
        </div>

        <div
          className="glow-top left"
          style={{
            paddingLeft: "20px",
            marginBottom: "12px",
            borderRadius: "10px",
          }}
        >
          📝 Notes: {stats.notes}
        </div>

        <div
          className="glow-top left"
          style={{
            paddingLeft: "20px",
            marginBottom: "12px",
            borderRadius: "10px",
          }}
        >
          ⏰ Reminders: {stats.reminders}
        </div>

        <div
          className="glow-top left"
          style={{
            paddingLeft: "20px",
            marginBottom: "12px",
            borderRadius: "10px",
          }}
        >
          🎂 Birthdays: {stats.birthdays}
        </div>

        <div
          className="glow-top left"
          style={{
            paddingLeft: "20px",
            marginBottom: "12px",
            borderRadius: "10px",
          }}
        >
          🔗 Links: {stats.links}
        </div>
      </>
    )}
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
          gap: "28px",
          padding: "10px 10px 40px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "2.5rem",
          }}
        >
          Admin Control Panel
        </h1>

        {stats && (
          <>
            <h2>Statistics</h2>

            <Card variant="glass">
              <p><strong>Total Users:</strong> {stats.users}</p>
              <p><strong>Total Notes:</strong> {stats.notes}</p>
              <p><strong>Total Reminders:</strong> {stats.reminders}</p>
              <p><strong>Total Birthdays:</strong> {stats.birthdays}</p>
              <p><strong>Total Links:</strong> {stats.links}</p>
            </Card>
          </>
        )}

        <h2>Manage Users</h2>

        {users.length === 0 ? (
          <Card variant="glass">
            <p>No users found.</p>
          </Card>
        ) : (
          users.map((user) => (
            <Card
              key={user._id}
              variant="glass"
            >
              <p>
                <strong>Full Name:</strong> {user.fullName}
              </p>

              <p>
                <strong>Username:</strong> {user.username}
              </p>

              <p>
                <strong>Email:</strong> {user.email}
              </p>

              <p>
                <strong>Role:</strong> {user.role}
              </p>

              {user.role === "user" && (
                <button
                  className="glow-top delete"
                  onClick={() => handleDelete(user._id)}
                >
                  Delete User
                </button>
              )}
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}

export default AdminDashboard;