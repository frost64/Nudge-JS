import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import dashboardLightBg from "../assets/backgrounds/dashboard-light.png";
import dashboardDarkBg from "../assets/backgrounds/dashboard-dark.png";
import toast from "react-hot-toast";



function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  
  const getGreeting = () => {
  const hour = new Date().getHours();
    if (hour < 12) {
      return "Good Morning";
    }
    if (hour < 17) {
      return "Good Afternoon";
    }
    return "Good Evening";
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Let's get your day organized. Your nudges are waiting! 🌅";
    }
    if (hour < 17) {
      return "Hope your day is going well. Stay on top of today's nudges. ☀️";
    }
    return "Time to wrap things up. Here's what's still left for today. 🌙";
  };

  const { user } = useContext(AuthContext);
  const darkMode = user?.theme === "dark";
  const dashboardBackground = darkMode
    ? dashboardDarkBg
    : dashboardLightBg;



  const navigate = useNavigate();
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        setData(res.data);
      } catch (error) {
          console.log(error);
          const message =
            error.response?.data?.message ||
            "Failed to load dashboard.";
          toast.error(message);
          setError(message);
        }
    };

    fetchDashboard();
  }, []);

 if (error) {
  return (
    <Layout>
      <Card variant="glass">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
      </Card>
    </Layout>
  );
}

  if (!data) {
    return (
      <Layout>
        <h2>Loading...</h2>
      </Layout>
    );
  }
  const quickAccess = (
  <Card
    variant="glass"
    style={{
      position: "fixed",
      top: "15%",
      left: "2%",
      width: "20%",
      minHeight: "65%",
      padding: "24px",
      borderRadius: "22px",

      display: "flex",
      flexDirection: "column",
      gap: "16px",
      
    }}
  >
    <h1
      style={{
        whiteSpace: "nowrap",
        textAlign: "center",
        marginBottom: "10px",
      }}
    >
      Quick Access ⚡
    </h1>

    <button
      className="glow-top left"
      style={{ width: "100%" }}
      onClick={() => navigate("/reminders?create=true")}
    >
      ⏰ New Reminder
    </button>

    <button
      className="glow-top left"
      style={{ width: "100%" }}
      onClick={() => navigate("/notes?create=true")}
    >
      📝 New Note
    </button>

    <button
      className="glow-top left"
      style={{ width: "100%" }}
      onClick={() => navigate("/birthdays?create=true")}
    >
      🎂 Add Birthday
    </button>

    <button
      className="glow-top left"
      style={{ width: "100%" }}
      onClick={() => navigate("/links?create=true")}
    >
      🔗 Save Link
    </button>
  </Card>
  );
  return (
  <Layout
    sidebar={quickAccess}
    backgroundImage={dashboardBackground}
    cardVariant="glass"
  >
      <div
        style={{
          marginBottom: "35px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "2.0rem",
            fontWeight: "700",
            color: darkMode ? "#f9fafb" : "#0b5b82",
          }}
        >
          👋 {getGreeting()}, {user?.username}
        </h1>

        <p
          style={{
            marginTop: "10px",
            fontSize: "1.1rem",
            opacity: 0.75,
          }}
        >
          {getGreetingMessage()}
        </p>
      </div>

      <h1>Statistics</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          gap: "24px",
          marginBottom: "35px",
          width: "100%",
        }}
      >
        <Card variant="glass">
          <h3
          className="underline"
          onClick={() =>
            navigate("/reminders")
          }>⏰ Reminders</h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalReminders ?? 0}</h1>
        </Card>
        
        <Card variant="glass">
          <h3
          className="underline"
          onClick={() =>
            navigate("/notes")
          }>📝 Notes</h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalNotes ?? 0}</h1>
        </Card>

        <Card variant="glass">
          <h3
          className="underline"
          onClick={() =>
            navigate("/birthdays")
          }>🎂 Birthdays</h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalBirthdays ?? 0}</h1>
        </Card>

        <Card variant="glass">
          <h3
          className="underline"
          onClick={() =>
            navigate("/links")
          }>🔗 Links</h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalLinks ?? 0}</h1>
        </Card>
      </div>
      
      
      <div  
        className="dashboard-container"
      >
        <Card variant="glass">
          <h2>Favorite Links</h2>

          {data.favoriteLinks?.length === 0 ? (
            <p>No favorite links</p>
          ) : (
            data.favoriteLinks?.map((link) => (
              <div
                className="search-result-item" 
                key={link._id}
                onClick={() =>
                  navigate(
                    `/links?linkId=${link._id}`
                  )
                }>
                {link.title}
              </div>
            ))
          )}
        </Card>

        <Card variant="glass">
          <h2>Upcoming Birthdays</h2>

          {data.upcomingBirthdays?.length === 0 ? (
            <p>No upcoming birthdays</p>
          ) : (
            data.upcomingBirthdays?.slice(0, 5).map((birthday) => (
              <div
                className="search-result-item" 
                key={birthday._id}
                onClick={() =>
                  navigate(
                    `/birthdays?birthdayId=${birthday._id}`
                  )
                }>
                {birthday.name}{" "}
                {birthday.daysRemaining === 0
                  ? "🎉 Today!"
                  : `(${birthday.daysRemaining} day${birthday.daysRemaining !== 1 ? "s" : ""} left)`
                }
              </div>
            ))
          )}
        </Card>

        <Card variant="glass">
          <h2>⚠️ Overdue Reminders</h2>

          {data.overdueReminders?.length === 0 ? (
            <p>No overdue reminders 🎉</p>
          ) : (
            data.overdueReminders.map((reminder) => (
              <div
                key={reminder._id}
                className="search-result-item"
                style={{
                  color: "#ff6b6b",
                  fontWeight: "bold",
                }}
                onClick={() =>
                  navigate(`/reminders?reminderId=${reminder._id}`)
                }
              >
                {reminder.title}
              </div>
            ))
          )}
        </Card>

        <Card variant="glass">
          <h2>Pending Reminders</h2>

          {data.pendingReminders?.length === 0 ? (
            <p>No pending reminders</p>
          ) : (
            data.pendingReminders?.map((reminder) => (
              <div
                className="search-result-item" 
                key={reminder._id}
                onClick={() =>
                  navigate(
                    `/reminders?reminderId=${reminder._id}`
                  )
                }>
                {reminder.title}
              </div>
            ))
          )}
        </Card>
      </div>
    </Layout>
  );
}

export default Dashboard;