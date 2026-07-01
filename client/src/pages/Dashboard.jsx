import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useContext(AuthContext); // remove completely if not needed
  const navigate = useNavigate();
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        setData(res.data);
      } catch (error) {
        console.log(error);
        setError("Failed to load dashboard");
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return (
      <Layout>
        <h2>{error}</h2>
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
    <div 
    className="quick-access">

      <h1>
        ⚡ Quick Access
      </h1>
      
      <button className = "hidden"></button>
      
      <button
        className="glow-button"
        onClick={() => navigate("/reminders")}
      >
        ⏰ New Reminder
      </button>

      <button
        className="glow-button"
        onClick={() => navigate("/notes")}
      >
        📝 New Note
      </button>

      <button
        className="glow-button"
        onClick={() => navigate("/birthdays")}
      >
        🎂 Add Birthday
      </button>

      <button
        className="glow-button"
        onClick={() => navigate("/links")}
      >
        🔗 Save Link
      </button>

    </div>
  );

  return (
      <Layout sidebar={quickAccess}>
      <h1>Statistics</h1>
      <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "30px",
          width: "100%",
        }}>
        <Card>
          <h3
          className="underline"
          onClick={() =>
            navigate("/reminders")
          }>⏰ Reminders</h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalReminders ?? 0}</h1>
        </Card>
        
        <Card>
          <h3
          className="underline"
          onClick={() =>
            navigate("/notes")
          }>📝 Notes</h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalNotes ?? 0}</h1>
        </Card>

        <Card>
          <h3
          className="underline"
          onClick={() =>
            navigate("/birthdays")
          }>🎂 Birthdays</h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalBirthdays ?? 0}</h1>
        </Card>

        <Card>
          <h3
          className="underline"
          onClick={() =>
            navigate("/links")
          }>🔗 Links</h3>
          <h1 style={{userSelect: "none"}}>{data.stats?.totalLinks ?? 0}</h1>
        </Card>
      </div>
      
      
      <div  
        style={{ 
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
      <Card>
        <h2>Recent Notes</h2>

        {data.recentNotes?.length === 0 ? (
          <p>No notes found</p>
        ) : (
          data.recentNotes?.map((note, index) => (
            <div
              className="search-result-item" 
              key={note._id}
              onClick={() =>
                navigate(
                  `/notes?noteId=${note._id}`
                )
              }>
              {index+1}. {note.title}
            </div>
          ))
        )}
      </Card>

      <Card>
        <h2>Favorite Links</h2>

        {data.favoriteLinks?.length === 0 ? (
          <p>No favorite links</p>
        ) : (
          data.favoriteLinks?.map((link, index) => (
            <div
              className="search-result-item" 
              key={link._id}
              onClick={() =>
                navigate(
                  `/links?linkId=${link._id}`
                )
              }>
              {index+1}. {link.title}
            </div>
          ))
        )}
      </Card>

      <Card>
        <h2>Pending Reminders</h2>

        {data.pendingReminders?.length === 0 ? (
          <p>No pending reminders</p>
        ) : (
          data.pendingReminders?.map((reminder, index) => (
            <div
              className="search-result-item" 
              key={reminder._id}
              onClick={() =>
                navigate(
                  `/reminders?reminderId=${reminder._id}`
                )
              }>
              {index+1}. {reminder.title}
            </div>
          ))
        )}
      </Card>
      </div>
    </Layout>
  );
}

export default Dashboard;