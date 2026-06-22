import { useEffect, useState, useRef} from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";

function Birthdays() {
  const location = useLocation();
  const birthdayRefs = useRef({});
  const searchParams =
      new URLSearchParams(
        location.search
      );
  const selectedBirthdayId =
    searchParams.get(
      "birthdayId"
    );
  const [birthdays, setBirthdays] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [relationship, setRelationship] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchBirthdays = async () => {
    try {
      const res = await api.get("/birthdays");
      setBirthdays(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const res = await api.get("/birthdays/upcoming");
      setUpcoming(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !birthDate) {
      alert("Name and Birth Date are required");
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

      fetchBirthdays();
      fetchUpcoming();
    } catch (error) {
      console.log(error);
    }
  };

  const startEdit = (birthday) => {
    setEditingId(
      birthday._id
    );

    setName(
      birthday.name
    );

   setBirthDate(
      birthday.birthDate
      ? birthday.birthDate.split("T")[0]
      : ""
    );

    setRelationship(
      birthday.relationship
    );

    setNotes(
      birthday.notes
    );
  };

  const cancelEdit = () => {
    setEditingId(null);

    setName("");
    setBirthDate("");
    setRelationship("");
    setNotes("");
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
    }
  };

  useEffect(() => {
    fetchBirthdays();
    fetchUpcoming();
  }, []);
  
  useEffect(() => {

      if (
        selectedBirthdayId &&
        birthdayRefs.current[selectedBirthdayId]
      ) {

        birthdayRefs.current[
          selectedBirthdayId
        ].scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      }

    }, [
      birthdays,
      selectedBirthdayId
    ]);
    
  return (
    <Layout>
      <h1>Birthdays</h1>

      <h2>
        Upcoming Birthdays
      </h2>

      {upcoming.length === 0 ? (
        <p>
          No upcoming birthdays
        </p>
      ) : (
        upcoming.map(
          (birthday) => (
            <p
              key={birthday._id}
            >
              🎂 {birthday.name}
            </p>
          )
        )
      )}

         
      
      <div
        style={{
          maxWidth: "600px"
        }}
      >
        <h2>
          {editingId
            ? "Edit Birthday"
            : "Create Birthday"}
        </h2>

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

        <br />
        <br />

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

        <br />
        <br />

        <input
          className="input-glow"
          type="text"
          placeholder="Relationship"
          value={relationship}
          onChange={(e) =>
            setRelationship(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <textarea
          className="input-glow"
          rows="4"
          placeholder="Notes"
          value={notes}
          onChange={(e) =>
            setNotes(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <button
          onClick={handleSave}
        >
          {editingId
            ? "Update Birthday"
            : "Add Birthday"}
        </button>

            

        {editingId && (
          <button
            onClick={cancelEdit}
          >
            Cancel
          </button>
        )}
      </div>
      <hr />

      {birthdays.length === 0 ? (
        <p>
          No birthdays found
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
                    boxShadow:
                      selectedBirthdayId === birthday._id
                        ? "0 0 15px rgba(59,130,246,0.3)"
                        : "none",
                    border:
                      selectedBirthdayId === birthday._id
                        ? "2px solid #3b82f6"
                        : "none",

                    backgroundColor:
                      selectedBirthdayId === birthday._id
                        ? "rgba(59,130,246,0.08)"
                        : "transparent",

                    borderRadius: "8px",

                    padding:
                      selectedBirthdayId === birthday._id
                        ? "8px"
                        : "0",

                    transition:
                      "all 0.3s ease"
                  }}
                >
              <h3>
                {birthday.name}
              </h3>

              <p>
                Birth Date: {" "}  
                {new Date(
                  birthday.birthDate
                ).toLocaleDateString()}
              </p>

              <p>
                Relationship:   {" "}
                {birthday.relationship}
              </p>

              <p>
                Notes:   {" "}
                {birthday.notes}
              </p>

              <button
                onClick={() =>
                  startEdit(
                    birthday
                  )
                }
              >
                Edit
              </button>

                 

              <button
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
    </Layout>
  );
}

export default Birthdays;