import { useEffect, useState, useRef} from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";


function Birthdays() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedBirthdayId = searchParams.get("birthdayId");
  const shouldCreate = searchParams.get("create");
  const birthdayRefs = useRef({});
  const [birthdays, setBirthdays] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [relationship, setRelationship] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const highlightTimeout = useRef(null);
  
  const fetchBirthdays = async () => {
    try {
      const res = await api.get("/birthdays");
      setBirthdays(res.data.data);
    } 
    catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Failed to load birthdays."
      );
    }
  };

  const fetchUpcoming = async () => {
    try {
      const res = await api.get("/birthdays/upcoming");
      setUpcoming(res.data);
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
        "Failed to load upcoming birthdays."
      );
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    else if (!birthDate) {
      alert("Date of Birth is required");
      return;
    }
    else if (!relationship) {
      alert("Relationship is required");
      return;
    }
    else if (!notes.trim()) {
      alert("Birthday Note is required");
      return;
    }
    try {
      const birthdayData = {
        name,
        birthDate,
        relationship,
        notes
      };

      if (editingId) {
        await api.put(
          `/birthdays/${editingId}`,
          birthdayData
        );
      } else {
        await api.post(
          "/birthdays",
          birthdayData
        );
      }

      setName("");
      setBirthDate("");
      setRelationship("");
      setNotes("");
      setEditingId(null);
      setShowForm(false);

      fetchBirthdays();
      fetchUpcoming();
    } 
    catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
        "Failed to save birthday."
      );
    }
  };

  const startEdit = (birthday) => {
    setEditingId(birthday._id);
    setShowForm(true);
    setName(birthday.name);
    setBirthDate(
      birthday.birthDate
      ? birthday.birthDate.split("T")[0]: "");
    setRelationship(birthday.relationship);
    setNotes(birthday.notes);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setBirthDate("");
    setRelationship("");
    setNotes("");
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Delete this birthday?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/birthdays/${id}`
      );

      fetchBirthdays();
      fetchUpcoming();
    } catch (error) {
        console.log(error);
        alert(
          error.response?.data?.message ||
          "Failed to delete birthday."
        );
      }
  };

  const highlightBirthday = (id) => {
    setHighlightId(id);
      birthdayRefs.current[id]?.scrollIntoView({
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
    fetchBirthdays();
    fetchUpcoming();
  }, []);
  
  useEffect(() => {
    if (shouldCreate === "true") {
      setShowForm(true);
    }
  }, [shouldCreate]);

  useEffect(() => {
  if (
    selectedBirthdayId &&
    birthdayRefs.current[selectedBirthdayId]
  ) {
    highlightBirthday(selectedBirthdayId);
  }
}, [
  birthdays,
  selectedBirthdayId
]);
    
const relationshipOptions = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
  "Grandfather",
  "Grandmother",
  "Uncle",
  "Aunt",
  "Cousin",
  "Friend",
  "Best Friend",
  "Husband",
  "Wife",
  "Boyfriend",
  "Girlfriend",
  "Fiancé",
  "Fiancée",
  "Colleague",
  "Myself",
  "Other",
];
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
    <h1 style={{ textAlign: "center" }}>
      Upcoming 🎂
    </h1>
    {upcoming?.length === 0 ? (
            <p>No upcoming birthdays</p>
          ) : (
            upcoming?.slice(0, 5).map((birthday) => (
              <div
                className="glow-top left"
                style={{
                  paddingLeft: "20px",
                  marginBottom: "10px",
                  cursor: "pointer",
                  borderRadius: "10px",
                }} 
                key={birthday._id}
                onClick={() => highlightBirthday(birthday._id)}
                >
                {birthday.name}{" "}
                {birthday.daysRemaining === 0
                  ? "🎉 Today!"
                  : `(${birthday.daysRemaining} day${birthday.daysRemaining !== 1 ? "s" : ""} left)`
                }
              </div>
            ))
          )}
  </div>
);
  return (
    <Layout sidebar={!showForm ? sidebar : null}>
      {!showForm && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px"
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "2.5rem"
            }}
          >
            Birthdays
          </h1>

          <button
            className="glow-top"
            onClick={() => setShowForm(true)}
          >
            🎂 Create Birthday
          </button>
        </div>
      )}
         
      
      {showForm && (
        <Card
          style={{
            width: "40%",
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
        <h2>
          {editingId
            ? "Edit Birthday"
            : "New Birthday"}
        </h2>

         <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px"
            }}
          >
            <input
              className="input-glow"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

          <input
            className="input-glow"
            type="date"
            value={birthDate}
            onChange={(e) =>
              setBirthDate(
                e.target.value
              )
            }
          />

          <select
            className="input-glow"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
          >
            <option value="">
              Select Relationship
            </option>

            {relationshipOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <textarea
            className="input-glow"
            rows="4"
            placeholder="Birthday Note"
            value={notes}
            onChange={(e) =>
              setNotes(
                e.target.value
              )
            }
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "15px"
            }}
          >
            <button
              className="glow-top"
              onClick={handleSave}
            >
              {editingId ? "Update Birthday" : "Add Birthday"}
            </button>

            <button
              className="glow-top delete"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      </Card>
      )}

      {!showForm && (
      <>
      {birthdays.length === 0 ? (
        <p>
          Add your first birthday!
        </p>
      ) : (
        birthdays.map(
          (birthday) => (
                        <div
              key={birthday._id}
              ref={(el) =>{
                birthdayRefs.current[
                  birthday._id
                ] = el;
              }}
            >
              <Card>
                <div
                  style={{
                    backgroundColor:
                      highlightId === birthday._id
                        ? "rgba(0, 204, 255, 0.09)"
                        : "transparent",
                    boxShadow:
                      highlightId === birthday._id
                        ? "0 0 20px rgba(0,255,204,0.45)"
                        : "0 0 0 rgba(0,255,204,0)",
                    border: "2px solid transparent",
                    borderRadius: "8px",
                    padding:
                      highlightId === birthday._id
                        ? "8px"
                        : "0",
                    transition:
                      "background-color 2s ease, box-shadow 2s ease, padding .3s ease"
                  }}
                >
              <h3>
                <strong>Name: </strong>{birthday.name}
              </h3>

              <p>
                <strong>Date of Birth: </strong>  
                {new Date(
                  birthday.birthDate
                ).toLocaleDateString()}
              </p>

              <p>
                <strong>Relationship: </strong>
                {birthday.relationship}
              </p>

              <p>
                <strong>Birthday Note: </strong>
                {birthday.notes}
              </p>

              <button
                className="glow-top"
                onClick={() =>
                  startEdit(
                    birthday
                  )
                }
              >
                Edit
              </button> 
              
              <button
                className="glow-top delete"
                onClick={() =>
                  handleDelete(
                    birthday._id
                  )
                }
              >
                Delete
              </button>

            </div>
            </Card>
            </div>
          )
        )
      )}
      </>
      )}
    </Layout>
  );}
export default Birthdays;