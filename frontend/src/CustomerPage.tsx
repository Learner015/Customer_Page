import { useEffect, useState } from "react";
import UserModifyPage from "./UserModifyPage";
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/users",
  withCredentials: true, // ensure cookies/credentials are sent if backend uses them
});

interface Notes {
  notes_id: number;
  user_id: number;
  notes: string;
  reminder: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  country: string;
  ledger_type: string[] | string;
  raised_date: string;
  key_customer: boolean;
  sub_grid_notes: Notes[];
}

export default function CustomerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newPage, setNewpage] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(false);

  const buttonStyle = {
    display: "flex",
    backgroundColor: "darkgoldenrod",
    color: "white",
    fontFamily: "monospace",
    fontWeight: 800,
    fontSize: "16px",
    border: "none",
    margin: "5px",
    height: "50px",
    width: "90px",
    padding: "5px 10px",
    textDecoration: "underline wavy",
    cursor: "pointer",
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/");
        setUsers(
          response.data.map((u: User) => ({
            ...u,
            sub_grid_notes: u.sub_grid_notes || [],
          }))
        );
      } catch (err) {
        setError("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = (user_id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    api
      .delete(`/delete/${user_id}`)
      .then(() => setUsers((prev) => prev.filter((u) => u.id !== user_id)))
      .catch(() => alert("Failed to delete. Try again!"));
  };

  const toggleNotes = (user_id: number) => {
    if (selectedId === user_id && showNotes) {
      setShowNotes(false);
      setSelectedId(0);
    } else {
      setSelectedId(user_id);
      setShowNotes(true);
    }
  };

  const selectedUser = users.find((u) => u.id === selectedId);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Customer List</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {newPage ? (
        <UserModifyPage userId={selectedId} onBack={() => setNewpage(false)} />
      ) : (
        <>
          <button
            onClick={() => {
              setSelectedId(0);
              setNewpage(true);
            }}
            style={{
              backgroundColor: "lightseagreen",
              color: "white",
              fontFamily: "monospace",
              fontWeight: 800,
              fontSize: "20px",
              border: "none",
              margin: "10px",
              padding: "10px 16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              cursor: "pointer",
              transition: "box-shadow 0.3s ease",
              boxShadow: "0px 0px 12px 4px rgba(0,0,0,0.74)",
              borderRadius: "8px",
            }}
          >
            Add New
          </button>

          <table
            border={1}
            cellPadding={8}
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead style={{ background: "#fff", position: "sticky", top: 0 }}>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Country</th>
                <th>Raised Date</th>
                <th>Ledger_type</th>
                <th>Key Customer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.country}</td>
                  <td>{new Date(u.raised_date).toLocaleDateString("en-GB")}</td>
                  <td>
                    {Array.isArray(u.ledger_type)
                      ? u.ledger_type.join(", ")
                      : u.ledger_type}
                  </td>
                  <td>{u.key_customer ? "yes" : "no"}</td>
                  <td>
                    <button
                      style={{
                        ...buttonStyle,
                        borderRadius: "8%",
                        backgroundColor: "olivedrab",
                      }}
                      onClick={() => {
                        setSelectedId(u.id);
                        setNewpage(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      style={{ ...buttonStyle, borderRadius: "8%" }}
                      onClick={() => toggleNotes(u.id)}
                    >
                      {selectedId === u.id && showNotes ? "Hide Notes" : "Show Notes"}
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        backgroundColor: "mediumorchid",
                        borderRadius: "8%",
                        animation: "ease-in-out 5s",
                      }}
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {/* Notes Section */}
{/* Notes Section */}
{showNotes && selectedUser && (
  <tr>
    <td colSpan={8} style={{ padding: "0" }}>
      {selectedUser.sub_grid_notes.length === 0 ? (
        <p
          style={{
            color: "red",
            fontWeight: "bold",
            textAlign: "center",
            margin: "10px",
          }}
        >
          Notes Not Found
        </p>
      ) : (
        <table
          border={1}
          style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Note ID</th>
              <th>Notes</th>
              <th>Reminder</th>
            </tr>
          </thead>
          <tbody>
            {selectedUser.sub_grid_notes.map((note, idx) => (
              <tr key={idx}>
                <td>{note.notes_id || idx + 1}</td>
                <td>{note.notes}</td>
                <td>
                  {note.reminder
                    ? new Date(note.reminder).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </td>
  </tr>
)}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}