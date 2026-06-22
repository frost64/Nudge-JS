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

  return (
    <Layout>
      <div 
      className="quick-access"
      >
      

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px"
        }}
      >
        {/* ------Quick Access Panel------ */}
        <h1 className="search-section-title">⚡ Quick Access</h1>
        {/* ----------------Just to get rid of alignment issue------------------ */}
        <button style={{padding: "0px", opacity: "0"}}></button>
        
        <button className="glow-button" onClick={() => navigate("/reminders")}>
            <span className="btn-icon">⏰</span>
            <span>New Reminder</span>
        </button>
        

        <button className="glow-button" onClick={() => navigate("/notes")}>
          <span className="btn-icon">📝</span>
          <span>New Note</span>
        </button>

        <button className="glow-button" onClick={() => navigate("/birthdays")}>
          <span className="btn-icon">🎂</span>
          <span>Add Birthday</span>
        </button>

        <button className="glow-button" onClick={() => navigate("/links")}>
          <span className="btn-icon">🔗</span>
          <span>Save Link</span>
        </button>
      </div>
</div>
<div style={{ marginLeft: '100px' }}>
      <h2 className="search-section-title">Statistics</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}
      >
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
      </div>

      <hr />

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

      <hr />

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

      <hr />

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
      </div>
    </Layout>
  );
}

export default Dashboard;