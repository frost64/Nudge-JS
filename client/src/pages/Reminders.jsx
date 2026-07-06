import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import api from "../services/api";
import Layout from "../components/Layout";
import GlassModal from "../components/GlassModal";

function Reminders() {
const { user } = useContext(AuthContext);
const darkMode = user?.theme === "dark";
const formBackground = darkMode
  ? reminderDarkBg
  : reminderLightBg;
const [reminders, setReminders] = useState([]);
const [title, setTitle] = useState("");
const [dueDate, setDueDate] = useState("");
const [editingId, setEditingId] = useState(null);
const [reminderTime, setReminderTime] = useState("09:00");
const [priority, setPriority] = useState("");
const [category, setCategory] = useState("");
const [showForm, setShowForm] = useState(false);
const [highlightId, setHighlightId] = useState(null);

const location = useLocation();
const searchParams = new URLSearchParams(location.search);
const shouldCreate = searchParams.get("create");

const reminderRefs = useRef({});
const highlightTimeout = useRef(null);
const selectedReminderId = new URLSearchParams(location.search).get("reminderId");
const pendingReminders = reminders.filter(reminder => !reminder.completed)
  .sort(
    (a, b) =>
      new Date(a.dueDate) - new Date(b.dueDate)
  )
  .slice(0, 5);

const fetchReminders = async () => {
  try {
    const res = await api.get("/reminders");
    setReminders(res.data.data);
  } 
  catch (error) {
    console.log(error);
  }
};

const handleSave = async () => {
  if (
    !title.trim() ||
    !dueDate ||
    !reminderTime ||
    !priority ||
    !category.trim()
  ) {
    alert("Please fill in all fields.");
    return;
  }
  try {
    const reminderData = {
      title,
      dueDate,
      reminderTime,
      priority,
      category,
    };
    if (editingId) {
      await api.put(
        `/reminders/${editingId}`,
        reminderData
      );
    } 
    else {
      await api.post(
        "/reminders",
        reminderData
      );
    }
    setTitle("");
    setDueDate("");
    setReminderTime("09:00");
    setPriority("");
    setCategory("");
    setEditingId(null);
    setShowForm(false);
    fetchReminders();
  } 
  catch (error) {
    console.log(error);
    alert(
      error.response?.data?.message ||
      "Failed to save reminder."
    );
  }
};

const handleDelete = async (id) => {
const confirmed = window.confirm(
"Delete this reminder?"
);

   
if (!confirmed) {
  return;
}

try {
  await api.delete(
    `/reminders/${id}`
  );

  fetchReminders();
} catch (error) {
  console.log(error);
}
   

};

const handleToggle = async (id) => {
try {
await api.patch(
`/reminders/${id}/toggle`
);

   
  fetchReminders();
} catch (error) {
  console.log(error);
}
   

};

const handleExport = async (id) => {
try {
const response = await api.get(
`/calendar/reminder/${id}`,
{
responseType: "blob",
}
);

   
  const fileURL =
    window.URL.createObjectURL(
      new Blob([response.data])
    );

  const link =
    document.createElement("a");

  link.href = fileURL;

  link.setAttribute(
    "download",
    "reminder.ics"
  );

  document.body.appendChild(link);

  link.click();

  link.remove();
} catch (error) {
  console.log(error);
}
   

};

const startEdit = (reminder) => {
  setEditingId(reminder._id)
  setShowForm(true);
  setTitle(reminder.title);
  setDueDate(reminder.dueDate.split("T")[0]);
  setReminderTime(reminder.reminderTime || "09:00");
  setPriority(reminder.priority || "");
  setCategory(reminder.category || "");
};

const cancelEdit = () => {
  setEditingId(null);
  setTitle("");
  setDueDate("");
  setReminderTime("09:00");
  setPriority("");
  setCategory("");
};


const highlightReminder = (id) => {
  setHighlightId(id);

  reminderRefs.current[id]?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  if (highlightTimeout.current) {
    clearTimeout(highlightTimeout.current);
  }

  highlightTimeout.current = setTimeout(() => {
    setHighlightId(null);
  }, 2000);
};

useEffect(() => {
  if (
    selectedReminderId &&
    reminderRefs.current[selectedReminderId]
  ) {
    highlightReminder(selectedReminderId);
  }
}, [reminders, selectedReminderId]);

useEffect(() => {
  return () => {
    if (highlightTimeout.current) {
      clearTimeout(highlightTimeout.current);
    }
  };
}, []);

useEffect(() => {
  if (shouldCreate === "true") {
    setShowForm(true);
  }
}, [shouldCreate]);

useEffect(() => {
  fetchReminders();
}, []);


const sidebar = (
  <div 
    style={{
      userSelect: "none",
      position: "fixed",
      top: "15%",
      left: "2%",
      width: "20%",
      height: "70%",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <h1 style={{textAlign: "center"}}>Pending ⏰</h1>
    {pendingReminders.length === 0 ? (
      <p style={{paddingLeft: "20px"}}>No pending reminders</p>
    ) : (
      pendingReminders.map((reminder) => (
        <div
          key={reminder._id}
          className="glow-top left"
          style={{
            paddingLeft: "20px",
            marginBottom: "10px",
            content: "center",
            cursor: "pointer",
            borderRadius: "10px",
          }}
          onClick={() => highlightReminder(reminder._id)}
        >
          {reminder.title}
        </div>
      ))
    )}
  </div>
);


return ( 
  <Layout sidebar={!showForm ? sidebar : null}>
  {showForm && (
  <GlassModal
    backgroundImage={formBackground}
    darkMode={darkMode}
    width="40%"
  >
    <h2>
      {editingId
        ? "Edit Reminder"
        : "New Reminder"}
    </h2>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <input
        className="input-glow"
        type="text"
        placeholder="Reminder Title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <input
        className="input-glow"
        type="date"
        value={dueDate}
        onChange={(e) =>
          setDueDate(e.target.value)
        }
      />

      <input
        className="input-glow"
        type="time"
        value={reminderTime}
        onChange={(e) =>
          setReminderTime(e.target.value)
        }
      />

      <select
        className="input-glow"
        value={priority}
        onChange={(e) =>
          setPriority(e.target.value)
        }
      >
        <option value="" disabled>
          Priority
        </option>

        <option value="low">
          Low
        </option>

        <option value="medium">
          Medium
        </option>

        <option value="high">
          High
        </option>
      </select>

      <input
        className="input-glow"
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) =>
          setCategory(e.target.value)
        }
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          className="glow-top"
          onClick={handleSave}
        >
          {editingId
            ? "Update Reminder"
            : "Add Reminder"}
        </button>

        <button
          className="glow-top delete"
          onClick={() => {
            if (editingId) {
              cancelEdit();
            }
            setShowForm(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </GlassModal>
)}

{!showForm && (
  <>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        width: "100%"
      }}
    >
      <h1 style={{ 
          margin: 0,
          fontSize: "2.5rem"
        }}>
        Reminders
      </h1>

      <button
        className="glow-top"
        style={{
          padding: "12px 22px",
          fontSize: "1rem"
        }}
        onClick={() => setShowForm(true)}
      >
        ⏰ Create Reminder
      </button>
    </div>

    {reminders.length === 0 ? (<p>Create your first reminder!</p>) : 
    (
      reminders.map((reminder) => {
        const isOverdue =
          !reminder.completed &&
          new Date(reminder.dueDate) < new Date();

        const dueDateObj = new Date(reminder.dueDate);

        const overdueDays = isOverdue
          ? Math.floor(
              (new Date() - dueDateObj) /
              (1000 * 60 * 60 * 24)
            )
          : 0;

        return (

        <div
          key={reminder._id}
          ref={(el) => {
            reminderRefs.current[
              reminder._id
            ] = el;
          }}
        >
          <Card>
            <div
              style={{
                backgroundColor:
                  highlightId === reminder._id
                    ? "rgba(0, 204, 255, 0.09)"
                    : isOverdue
                    ? "rgba(255, 236, 128, 0.08)" 
                    : "transparent",

                boxShadow:
                  highlightId === reminder._id
                    ? "0 0 20px rgba(0,255,204,0.45)"
                    : isOverdue
                    ? "0 0 20px rgba(255,0,0,.45)"
                    : "0 0 0 rgba(0,255,204,0)",

                border:
                  isOverdue
                    ? "2px solid #ffffff00"
                    : "2px solid transparent",

                borderRadius:"8px",

                padding:
                  highlightId === reminder._id || isOverdue
                    ? "8px"
                    : "0",

                transition:
                  "background-color 2s ease, box-shadow 2s ease, padding .3s ease"
              }}
            >
              <h3><strong>Title: </strong>{reminder.title}</h3>
        
              <p>
                <strong>Due Date: </strong>
                {new Date(reminder.dueDate).toLocaleDateString()}
              </p>

              <p>
                <strong>Time: </strong>
                {reminder.reminderTime}
              </p>

              <p>
                <strong>Priority: </strong>
                {reminder.priority}
              </p>

              <p>
                <strong>Category: </strong>
                {reminder.category}
              </p>

              <p>
                <strong>Status: </strong>
                {reminder.completed
                  ? "✅ Completed"
                  : "⏳ Pending"}
              </p>

              {isOverdue && (
                <p
                  style={{
                    color: "#ff4d4d",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  ⚠️ Overdue by {overdueDays} day{overdueDays !== 1 ? "s" : ""}
                </p>
              )}

              <button
                className="glow-top"
                onClick={() => startEdit(reminder)}
              >
                Edit
              </button>
            
              <button
                className="glow-top"
                onClick={() => handleToggle(reminder._id)}
              >
                {reminder.completed
                  ? "Mark Pending"
                  : "Mark Complete"}
              </button>

              <button
                className="glow-top"
                onClick={() => handleExport(reminder._id)}
              >
                Export Calendar
              </button>

              <button
                className="glow-top delete"
                onClick={() => handleDelete(reminder._id)}
              >
                Delete
              </button>
            </div>
          </Card>
        </div>
            );
    })
    )
  }
  </>
)}
</Layout>
);} 
export default Reminders;
