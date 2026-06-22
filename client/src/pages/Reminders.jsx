import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { useLocation } from "react-router-dom";
import { useRef } from "react";

function Reminders() {

const [reminders, setReminders] = useState([]);
const [title, setTitle] = useState("");
const [dueDate, setDueDate] = useState("");
const [editingId, setEditingId] = useState(null);
const [reminderTime, setReminderTime] = useState("09:00");
const [priority, setPriority] = useState("");
const [category, setCategory] = useState("");
const [showForm, setShowForm] = useState(false);
const location = useLocation();

const reminderRefs = useRef({});

const searchParams =
  new URLSearchParams(
    location.search
  );

const selectedReminderId =
  searchParams.get(
    "reminderId"
  );


const fetchReminders = async () => {
try {
const res = await api.get("/reminders");
setReminders(res.data.data);
} catch (error) {
console.log(error);
}
};

const handleSave = async () => {
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
  } else {
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

  fetchReminders();
} catch (error) {
  console.log(error);
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

setDueDate(
  reminder.dueDate.split("T")[0]
);

setReminderTime(
  reminder.reminderTime || "09:00"
);

setPriority(
  reminder.priority || ""
);

setCategory(
  reminder.category || ""
);
   

};

const cancelEdit = () => {
setEditingId(null);
setTitle("");
setDueDate("");
setReminderTime("09:00");
setPriority("");
setCategory("");
};
 useEffect(() => {

  fetchReminders();

}, []);
useEffect(() => {

  if (
    selectedReminderId &&
    reminderRefs.current[selectedReminderId]
  ) {

    reminderRefs.current[
      selectedReminderId
    ].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }

}, [
  reminders,
  selectedReminderId
]);

return ( <Layout>  
  <button
    className="glow-button"
    onClick={() =>
      setShowForm(true)
    }
  >
    ⏰ Create Reminder
  </button>
  {showForm && (
  <Card>
  <h2 className="search-section-title">
    {editingId
      ? "Edit Reminder"
      : "New Reminder"}
  </h2>
  <div
  style={{
    maxWidth: "600px"
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

  <br />
  <br />

  <input
    className="input-glow"
    type="date"
    value={dueDate}
    onChange={(e) =>
      setDueDate(e.target.value)
    }
  />

  <br />
  <br />

  <input
    className="input-glow"
    type="time"
    value={reminderTime}
    onChange={(e) =>
      setReminderTime(
        e.target.value
      )
    }
  />

  <br />
  <br />

  <select
    className="input-glow"
    value={priority}
    onChange={(e) =>
      setPriority(
        e.target.value
      )
    }
  >
    <option
      value=""
      disabled
    >
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

  <br />
  <br />

  <input
  className="input-glow"
  type="text"
  placeholder="Category"
  value={category}
  onChange={(e) =>
    setCategory(
      e.target.value
    )
  }
/>

  <br />
  <br />

  <button 
    className="glow-button"
    onClick={handleSave}>
    {editingId
      ? "Update Reminder"
      : "Add Reminder"}
  </button>

  {" "}

 <button
  className="glow-button"
  type="button"
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
</Card>
)}

<h1 >  Reminders</h1>
  <hr />

  {reminders.length === 0 ? (
    <p>No reminders found</p>
  ) : (
    reminders.map(
      (reminder) => (
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
                border:
                  selectedReminderId === reminder._id
                    ? "2px solid #3b82f6"
                    : "none",

                backgroundColor:
                  selectedReminderId === reminder._id
                    ? "rgba(59,130,246,0.08)"
                    : "transparent",

                borderRadius: "8px",

                padding:
                  selectedReminderId === reminder._id
                    ? "8px"
                    : "0",

                transition:
                  "all 0.3s ease"
              }}
            >
        
          <h3>
            Title:{" "}
            {reminder.title}
          </h3>

          <p>
            Due Date:{" "}
            {new Date(
              reminder.dueDate
            ).toLocaleDateString()}
          </p>

          <p>
            Time:{" "}
            {reminder.reminderTime}
          </p>

          <p>
            Priority:{" "}
            {reminder.priority}
          </p>

          <p>
            Category:{" "}
            {reminder.category}
          </p>

          <p>
            Status:{" "}
            {reminder.completed
              ? "✅ Completed"
              : "⏳ Pending"}
          </p>

          <button
            className="glow-button"
            onClick={() =>
              startEdit(reminder)
            }
          >
            Edit
          </button>

          {" "}

          <button
            className="glow-button"
            onClick={() =>
              handleToggle(
                reminder._id
              )
            }
          >
            {reminder.completed
              ? "Mark Pending"
              : "Mark Complete"}
          </button>

          {" "}

          <button
            className="glow-button"
            onClick={() =>
              handleDelete(
                reminder._id
              )
            }
          >
            Delete
          </button>

          {" "}

          <button
            className="glow-button"
            onClick={() =>
              handleExport(
                reminder._id
              )
            }
          >
            Export Calendar
          </button>
        </div>
        </Card>
        </div>
      )
    )
  )}
</Layout>
   

);
}

export default Reminders;
