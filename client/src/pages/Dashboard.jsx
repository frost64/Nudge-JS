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
    <div className="quick-access">

      <h2>
        ⚡ Quick Access
      </h2>
      
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

      <h2 className="search-section-title">Statistics</h2>

        <Card>
          <h3>⏰ Reminders</h3>
          <h1>{data.stats?.totalReminders ?? 0}</h1>
        </Card>
        
        <Card>
          <h3>📝 Notes</h3>
          <h1>{data.stats?.totalNotes ?? 0}</h1>
        </Card>

        <Card>
          <h3>🎂 Birthdays</h3>
          <h1>{data.stats?.totalBirthdays ?? 0}</h1>
        </Card>

        <Card>
          <h3>🔗 Links</h3>
          <h1>{data.stats?.totalLinks ?? 0}</h1>
        </Card>

      <Card>
        <h2 className="search-section-title">Recent Notes</h2>

        {data.recentNotes?.length === 0 ? (
          <p>No notes found</p>
        ) : (
          data.recentNotes?.map((note) => (
            <div
              className="search-result-item" 
              key={note._id}>
              {note.title}
            </div>
          ))
        )}
      </Card>

      <Card>
        <h2 className="search-section-title">Favorite Links</h2>

        {data.favoriteLinks?.length === 0 ? (
          <p>No favorite links</p>
        ) : (
          data.favoriteLinks?.map((link) => (
            <div
              className="search-result-item" 
              key={link._id}>
              {link.title}
            </div>
          ))
        )}
      </Card>

      <Card>
        <h2 className="search-section-title">Pending Reminders</h2>

        {data.pendingReminders?.length === 0 ? (
          <p>No pending reminders</p>
        ) : (
          data.pendingReminders?.map((reminder) => (
            <div
              className="search-result-item" 
              key={reminder._id}>
              {reminder.title}
            </div>
          ))
        )}
      </Card>
    </Layout>
  );
}

export default Dashboard;