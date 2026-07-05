import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";

function AdminDashboard() {

const [stats, setStats] = useState(null);
const [users, setUsers] = useState([]);
const fetchStats =
async () => {
  try {
    const res =
      await api.get(
        "/admin/stats"
      );

    setStats(
      res.data
    );
  } catch (error) {
    console.log(error);
  }
};

const fetchUsers =
async () => {
  try {
    const res =
      await api.get(
        "/admin/users"
      );

    setUsers(
      res.data
    );

  } catch (error) {
    console.log(error);
  }

};

const handleDelete =
async (id) => {

  const confirmed =
    window.confirm(
      "Delete this user?"
    );

  if (!confirmed) {
    return;
  }

  try {

    await api.delete(
      `/admin/users/${id}`
    );

    fetchUsers();
    fetchStats();

  } catch (error) {

    console.log(error);

  }

};

useEffect(() => {

  fetchStats();
  fetchUsers();

}, []);

return (

<Layout>

  <h1>
    Admin Dashboard
  </h1>

  {stats && (
    <>
      <h2>
        Statistics
      </h2>

      <Card>
        <p>Total Users: {stats.users}</p>
        <p>Total Notes: {stats.notes}</p>
        <p>Total Reminders: {stats.reminders}</p>
        <p>Total Birthdays: {stats.birthdays}</p>
        <p>Total Links: {stats.links}</p>
      </Card>
    </>
  )}

  <hr />

  <h2>
    Manage Users
  </h2>

  {users.length === 0 ? (

    <p>No users found</p>

  ) : (

    users.map((user) => (

      <Card
        key={user._id}
      >

        <p><strong>Username: </strong><strong>{user.username}</strong></p>
        <p><strong>Email: </strong>{user.email}</p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "12px",
          }}
        >

          {user.role === "user" && (
            <button
              className="glow-top delete"
              onClick={() => handleDelete(user._id)}
            >
              Delete User
            </button>
          )}
        </div>

      </Card>

    ))

  )}

</Layout>

);

}

export default AdminDashboard;