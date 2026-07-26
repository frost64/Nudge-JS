import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutContext } from "../components/Layout";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import dashboardLightBg from "../assets/backgrounds/dashboard-light.png";
import dashboardDarkBg from "../assets/backgrounds/dashboard-dark.png";
import toast from "react-hot-toast";
import WeatherWidget from "../components/WeatherWidget";
import LoadingSpinner from "../components/LoadingSpinner";

import {
  FaSun,
  FaCloudSun,
  FaMoon,
} from "react-icons/fa";

import {
  FaBolt,
  FaClock,
  FaStickyNote,
  FaBirthdayCake,
  FaLink,
  FaStar,
  FaGift,
  FaExclamationTriangle,
  FaTasks,
  FaPlus,
} from "react-icons/fa";


function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const { isMobile } = useContext(LayoutContext);
  
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
      return <>
                Let's get your day organized. Your nudges are waiting!{" "}
                <FaSun style={{ color: "#facc15" }} />
              </>
    }
    if (hour < 17) {
      return <>
                Hope your day is going well. Stay on top of today's nudges.{" "}
                <FaCloudSun style={{ color: "#f59e0b" }} />
              </>
    }
    return <>
              Time to wrap things up. Here's what's still left for today.{" "}
              <FaMoon style={{ color: "#a78bfa" }} />
            </>
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
        <LoadingSpinner text="Loading Dashboard..." />
      </Layout>
    );
  }
  const quickAccess = (
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
        whiteSpace: "nowrap",
        textAlign: "center",
        marginBottom: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <FaBolt />
      Quick Access
    </h1>

    <button
      className="glow-top left"
      style={{ 
        width: "100%",
        marginBottom: "12px",
      }}
      onClick={() => navigate("/reminders?create=true")}
    >
      <>
        <FaClock size={13} style={{ marginRight: "6px" }} />
        New Reminder
      </>
    </button>

    <button
      className="glow-top left"
      style={{ 
        width: "100%",
        marginBottom: "12px", 
      }}
      onClick={() => navigate("/notes?create=true")}
    >
      <>
        <FaStickyNote size={13} style={{ marginRight: "6px" }} />
        New Note
      </>
    </button>

    <button
      className="glow-top left"
      style={{ 
        width: "100%",
        marginBottom: "12px", 
      }}
      onClick={() => navigate("/birthdays?create=true")}
    >
      <>
        <FaBirthdayCake size={13} style={{ marginRight: "6px" }} />
        Add Birthday
      </>
    </button>

    <button
      className="glow-top left"
      style={{ 
        width: "100%",
        marginBottom: "12px", 
      }}
      onClick={() => navigate("/links?create=true")}
    >
      <>
        <FaLink size={13} style={{ marginRight: "6px" }} />
        Save Link
      </>
    </button>
  </Card>
  );
  return (
  <Layout
    sidebar={quickAccess}
    backgroundImage={dashboardBackground}
    cardVariant="glass"
  >
      <Card variant="glass">
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "30px",
      flexWrap: "wrap",
    }}
  >
    {/* Left Side */}
    <div
      style={{
        flex: 1,
        minWidth: "280px",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "2rem",
          fontWeight: "800",
          letterSpacing: "-1px",
          userSelect: "none",
        }}
      >
        👋{" "}
        <span
          style={{
            background:
              "linear-gradient(90deg, #8d7cff 0%, #7d8dff 22%, #6da6ff 55%, #7fb9ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {getGreeting()}
        </span>
        , {user?.fullName}
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

    {/* Right Side */}
    <div
      style={{
        minWidth: "220px",
        textAlign: "right",
      }}
    >
      <div
        style={{
          fontSize: "1rem",
          fontWeight: "600",
          marginBottom: "12px",
          opacity: 0.85,
        }}
      >
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric"
        })}
      </div>
      <WeatherWidget />
    </div>
  </div>
</Card>

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
          <h3 className="underline" onClick={() => navigate("/reminders")}>
            <FaClock style={{ marginRight: "6px" }} />
            Reminders
          </h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalReminders ?? 0}</h1>
        </Card>
        
        <Card variant="glass">
          <h3 className="underline" onClick={() => navigate("/notes")}>
            <FaStickyNote style={{ marginRight: "6px" }} />
            Notes
          </h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalNotes ?? 0}</h1>
        </Card>

        <Card variant="glass">
          <h3 className="underline" onClick={() => navigate("/birthdays")}>
            <FaBirthdayCake style={{ marginRight: "6px" }} />
            Birthdays
          </h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalBirthdays ?? 0}</h1>
        </Card>

        <Card variant="glass">
          <h3 className="underline" onClick={() => navigate("/links")}>
            <FaLink style={{ marginRight: "6px" }} />
            Links
          </h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalLinks ?? 0}</h1>
        </Card>
      </div>
      
      
      <div  
        className="dashboard-container"
      >
        <Card variant="glass">
          <h2>
            <FaStar style={{ marginRight: "8px" }} />
            Favorite Links
          </h2>

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
          <h2>
            <FaBirthdayCake style={{ marginRight: "8px" }} />
            Upcoming Birthdays
          </h2>

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
                  ? (
                      <>
                        <FaGift size={13} style={{ marginRight: "4px" }} />
                        Today!
                      </>
                    )
                  : `(${birthday.daysRemaining} day${birthday.daysRemaining !== 1 ? "s" : ""} left)`
                }
              </div>
            ))
          )}
        </Card>

        <Card variant="glass">
          <h2>
            <FaExclamationTriangle
              style={{
                marginRight: "8px",
                color: "#ff6b6b",
              }}
            />
            Overdue Reminders
          </h2>

          {data.overdueReminders?.length === 0 ? (
            <p>
              No overdue reminders{" "}
              <FaGift style={{ color: "#ffd43b" }} />
            </p>
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
          <h2>
            <FaTasks style={{ marginRight: "8px" }} />
            Pending Reminders
          </h2>

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