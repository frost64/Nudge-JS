import { useEffect, useState, useRef} from "react";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { LayoutContext } from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import birthdayLightBg from "../assets/backgrounds/birthday-light.png";
import birthdayDarkBg from "../assets/backgrounds/birthday-dark.png";
import toast from "react-hot-toast";
import { FaBirthdayCake, FaPlus, FaGift } from "react-icons/fa";


function Birthdays() {
  const { user } = useContext(AuthContext);
  const confirm = useConfirm();
  const { isMobile } = useContext(LayoutContext);
  const darkMode = user?.theme === "dark";
  const formBackground = darkMode
  ? birthdayDarkBg
  : birthdayLightBg;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedBirthdayId = searchParams.get("birthdayId");
  const shouldCreate = searchParams.get("create");
  const birthdayRefs = useRef({});
  const [birthdays, setBirthdays] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [name, setName] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
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
    } catch (error) {
      console.log(error);

      toast.error(
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
      toast.error(
        error.response?.data?.message ||
        "Failed to load upcoming birthdays."
      );
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    else if (!birthDay) {
      toast.error("Birth Day is required");
      return;
    }
    else if (!birthMonth) {
      toast.error("Birth Month is required");
      return;
    }
    else if (!relationship) {
      toast.error("Relationship is required");
      return;
    }
    else if (!notes.trim()) {
      toast.error("Birthday Note is required");
      return;
    }
    try {
      const birthdayData = {
        name,
        birthDay: Number(birthDay),
        birthMonth: Number(birthMonth),
        birthYear: birthYear ? Number(birthYear) : null,
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
      toast.success(
          editingId
            ? "Birthday updated successfully."
            : "Birthday added successfully."
        );

      setName("");
      setBirthDay("");
      setBirthMonth("");
      setBirthYear("");
      setRelationship("");
      setNotes("");
      setEditingId(null);
      setShowForm(false);

      fetchBirthdays();
      fetchUpcoming();
    } 
    catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to save birthday."
      );
    }
  };

  const startEdit = (birthday) => {
    setEditingId(birthday._id);
    setShowForm(true);
    setName(birthday.name);
    setBirthDay(birthday.birthDay);
    setBirthMonth(birthday.birthMonth);
    setBirthYear(birthday.birthYear || "");
    setRelationship(birthday.relationship);
    setNotes(birthday.notes);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setBirthDay("");
    setBirthMonth("");
    setBirthYear("");
    setRelationship("");
    setNotes("");
    setShowForm(false);
  };

  const exportToCalendar = (birthday) => {
  const year = new Date().getFullYear();

  const eventDate = new Date(
    year,
    birthday.birthMonth - 1,
    birthday.birthDay
  );

  const formatDate = (date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";

  const start = formatDate(eventDate);

  const endDate = new Date(eventDate);
  endDate.setDate(endDate.getDate() + 1);

  const end = formatDate(endDate);

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nudge//Birthdays//EN
BEGIN:VEVENT
UID:${birthday._id}@nudge
DTSTAMP:${formatDate(new Date())}
DTSTART:${start}
DTEND:${end}
SUMMARY:${birthday.name}'s Birthday
DESCRIPTION:${birthday.notes}
RRULE:FREQ=YEARLY
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${birthday.name}-birthday.ics`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  toast.success("Calendar exported successfully.");
};

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Birthday",
      message:
        "Are you sure you want to delete this birthday? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      await api.delete(
        `/birthdays/${id}`
      );
      toast.success("Birthday deleted successfully.");
      fetchBirthdays();
      fetchUpcoming();
    } catch (error) {
        console.log(error);
        toast.error(
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
      }, 1200);
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
useEffect(() => {
    if (showForm) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }

    return () => {
        document.body.style.overflow = "";
    };
}, [showForm]);

useEffect(() => {
  return () => {
    if (highlightTimeout.current) {
      clearTimeout(highlightTimeout.current);
    }
  };
}, []);

const defaultCardShadow = undefined;

const highlightShadow = `
  0 0 25px rgba(0,255,204,.45),
  0 0 70px rgba(0,255,204,.18),
  0 20px 60px rgba(0,0,0,.45)
`;

const getAge = (birthday) => {
  if (!birthday.birthYear) return null;
  const today = new Date();
  let age = today.getFullYear() - birthday.birthYear;
  if (
    today.getMonth() + 1 < birthday.birthMonth ||
    (
      today.getMonth() + 1 === birthday.birthMonth &&
      today.getDate() < birthday.birthDay
    )
  ) {
    age--;
  }
  return age;
};

const getDaysUntilBirthday = (birthday) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const nextBirthday = new Date(
    today.getFullYear(),
    birthday.birthMonth - 1,
    birthday.birthDay
  );

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  return Math.round(
    (nextBirthday - today) /
    (1000 * 60 * 60 * 24)
  );
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const daysInMonth = birthMonth
  ? new Date(2024, Number(birthMonth), 0).getDate()
  : 31;

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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <FaBirthdayCake />
      Upcoming
    </h1>
    {upcoming?.length === 0 ? (
            <p style={{paddingLeft: "20px"}}>No upcoming birthdays</p>
          ) : (
            upcoming?.slice(0, 5).map((birthday) => (
              <div
                className="glow-top left"
                style={{
                  paddingLeft: "20px",
                  marginBottom: "10px",
                  content: "center",
                  cursor: "pointer",
                  borderRadius: "10px",
                }} 
                key={birthday._id}
                onClick={() => highlightBirthday(birthday._id)}
                >
                {birthday.name}{" "}
                {birthday.daysRemaining === 0
                  ? <>
                      <FaGift size={14} style={{marginLeft:"25px"}}/> Today!
                    </>
                  : <span style={{marginLeft:"25px"}}> {birthday.daysRemaining} day{birthday.daysRemaining !== 1 ? "s" : ""} left!</span>
                }
              </div>
            ))
          )}
  </Card>
);
  const sortedBirthdays = [...birthdays].sort(
    (a, b) =>
      getDaysUntilBirthday(a) -
      getDaysUntilBirthday(b)
  );


  return (
    <Layout
      sidebar={sidebar}
      backgroundImage={formBackground}
      blurBackground={showForm}
      cardVariant="glass"
    >
      {showForm && (
        <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1100,
        }}
      >
        <Card
          variant="glass"
          style={{
            width: "100%",
            maxWidth: "400px",
            borderRadius: "24px",
            boxShadow: darkMode
              ? `
                  0 0 35px rgba(0,255,204,.22),
                  0 0 90px rgba(0,160,255,.14),
                  0 30px 80px rgba(0,0,0,.55)
                `
              : `
                  0 0 30px rgba(0,180,255,.18),
                  0 0 70px rgba(0,255,200,.14),
                  0 25px 70px rgba(0,0,0,.18)
                `,
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

          <div className="birthday-date-row">
            <select
              className="input-glow"
              value={birthMonth}
              onChange={(e) => {
                setBirthMonth(e.target.value);

                // Reset day if it becomes invalid
                if (
                  birthDay &&
                  Number(birthDay) >
                    new Date(2024, Number(e.target.value), 0).getDate()
                ) {
                  setBirthDay("");
                }
              }}
            >
              <option value="">Month</option>

              {months.map((month, index) => (
                <option
                  key={month}
                  value={index + 1}
                >
                  {month}
                </option>
              ))}
            </select>

            <select
              className="input-glow"
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
            >
              <option value="">Day</option>

              {Array.from(
                { length: daysInMonth },
                (_, i) => i + 1
              ).map((day) => (
                <option
                  key={day}
                  value={day}
                >
                  {day}
                </option>
              ))}
            </select>

            <input
              className="input-glow"
              type="number"
              placeholder="Year (Optional)"
              min="1900"
              max={new Date().getFullYear()}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />
          </div>

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
          </div>
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
              onClick= {cancelEdit}
            >
              Cancel
            </button>
          </div>
      </Card>
      </div>
  )}
{/* -------------------------- Content -------------------------------------- */}


      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          padding: "10px 10px 40px",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            width: "100%"
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
            style={{
              padding: "12px 22px",
              fontSize: "1rem",
            }}
            onClick={() => setShowForm(true)}
          >
            <>
              <FaPlus size={13} style={{marginRight: "5px"}}/>
              Create Birthday
            </>
          </button>
        </div>
            {birthdays.length === 0 ? (
              <p>
                Add your first birthday!
              </p>
            ) : (
              sortedBirthdays.map((birthday) => {
                const daysRemaining = getDaysUntilBirthday(birthday);
                const formatBirthday = (birthday) => {
                  const date = new Date(
                    birthday.birthYear || 2000, // dummy year if none provided
                    birthday.birthMonth - 1,
                    birthday.birthDay
                  );
                  const options = {
                    day: "2-digit",
                    month: "long",
                    ...(birthday.birthYear && { year: "numeric" }),
                  };
                  return date.toLocaleDateString("en-GB", options);
                };
                return (
                  <div
                    key={birthday._id}
                    ref={(el) =>{
                      birthdayRefs.current[
                        birthday._id
                      ] = el;
                    }}
                  >
                    <Card
                      variant="glass"
                      style={{
                        boxShadow:
                          highlightId === birthday._id
                            ? highlightShadow
                            : defaultCardShadow,
                        transition: "box-shadow .35s ease",
                      }}
                    >
                    <h3>
                      <strong>Name: </strong>{birthday.name}
                    </h3>

                    <p>
                      <strong>Birthday:</strong>{" "}
                      {formatBirthday(birthday)}
                    </p>

                    {birthday.birthYear && (
                      <p>
                        <strong>Age: </strong>
                        {getAge(birthday)} years
                      </p>
                    )}

                    <p>
                      <strong>Relationship: </strong>
                      {birthday.relationship}
                    </p>

                    <p>
                      <strong>Next Birthday: </strong>
                      <strong style={{
                          color: darkMode
                          ? "yellow"
                          : "red",
                        }}>
                      {daysRemaining === 0
                        ? <>
                            <FaGift size={14} /> Today!
                          </>
                        : `${daysRemaining} day${
                            daysRemaining !== 1 ? "s" : ""
                          } remaining`}
                        </strong>
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
                      className="glow-top"
                      onClick={() => exportToCalendar(birthday)}
                    >
                      Export Calendar
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
                  </Card>
                </div>
                );
              })
            )}
      </div>
    </Layout>
  );}
export default Birthdays;