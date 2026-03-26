import React, { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import axios from "axios";

// Axios instance
const api = axios.create({
    baseURL: "http://127.0.0.1:8000"
});


interface Note {
    notes_id: number;
    notes: string;
    reminder: string;
}

interface FormState {
    noteText: string;
    reminderDate: string;
    reminderTime: string;
}

interface UserProps {
    userId: number;
    subGridNotes: Note[];
    setSubGridNotes: Dispatch<SetStateAction<Note[]>>;
}

interface Errors {
    notes?: string;
    reminder?: string;
    time?: string;
}


const SubGridPage = ({ userId, subGridNotes, setSubGridNotes }: UserProps) => {
    const today = new Date().toISOString().split("T")[0];

    const [errors, setErrors] = useState<Errors>({});
    const [form, setForm] = useState<FormState>({
        noteText: "",
        reminderDate: "",
        reminderTime: ""
    });


    useEffect(() => {
        if (userId) fetchNotes();
    }, [userId]);

    const fetchNotes = async () => {
        try {
            const res = await api.get(`/notes/${userId}`);
            setSubGridNotes(res.data || []);
        } catch (err: any) {
            console.error("Fetch error:", err.response?.data || err.message);
        }
    };


    const handleAddNote = (e: React.SyntheticEvent) => {
        e.preventDefault();

        const newErrors: Errors = {};
        let hasError = false;

        if (!form.noteText.trim()) {
            newErrors.notes = "Add notes to submit";
            hasError = true;
        }

        if (!form.reminderDate) {
            newErrors.reminder = "Add reminder date to submit";
            hasError = true;
        }

        if (!form.reminderTime) {
            newErrors.time = "Add time to submit";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        const combinedDateTime = new Date(`${form.reminderDate}T${form.reminderTime}`);
        if (combinedDateTime < new Date()) {
            alert("Reminder cannot be in the past");
            return;
        }

        const newNote: Note = {
            notes_id: 0,
            
            notes: form.noteText,
            reminder: combinedDateTime.toISOString()
        };

        setSubGridNotes(prev => {
            const updatedNotes = [...prev, newNote];
            localStorage.setItem("notesData", JSON.stringify(updatedNotes));
            return updatedNotes;
        });

        setForm({ noteText: "", reminderDate: "", reminderTime: "" });
        setErrors({});
    };

    // Save note to DB
    // const saveToDb = async (note: Note) => {
    //     if (!userId) return alert("UserId does not exist!");
    //     try {
    //         const res = await api.post(`/notes/${userId}`, {
    //             notes: note.notes,
    //             reminder: note.reminder
    //         });

    //         const savedNote = res.data;
    //         setSubGridNotes(prev =>
    //             prev.map(n => (n === note ? { ...n, notes_id: savedNote.notes_id } : n))
    //         );

    //         alert("Saved to DB");
    //     } catch (err: any) {
    //         console.error(err.response?.data || err.message);
    //         alert("Save failed");
    //     }
    // };

    // Delete note from DB
    const deleteFromDb = async (note: Note) => {
        if (!note.notes_id) {
            setSubGridNotes(prev => prev.filter(n => n !== note));
            alert("Removed unsaved note");
            return;
        }

        try {
            await api.delete(`/notes/deletenotes/${note.notes_id}`);
            setSubGridNotes(prev => prev.filter(n => n !== note));
            alert("Deleted successfully");
        } catch (err: any) {
            console.error(err.response?.data || err.message);
            alert("Delete failed");
        }
    };

    
    const formatForDateTimeLocal = (iso?: string) => {
        const date = iso ? new Date(iso) : new Date();
        if (isNaN(date.getTime())) return new Date().toISOString().substring(0, 16);
        return date.toISOString().substring(0, 16);
    };

    return (
        <div style={{ margin: "20px", fontFamily: "sans-serif" }}>
            <h2 style={{ textDecoration: "underline double" }}>Customer Notes & Reminders</h2>

         
            <div style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "20px" }}>
                <label>Notes:</label> &nbsp;
                <textarea
                    placeholder="Enter note..."
                    value={form.noteText}
                    onChange={e => setForm({ ...form, noteText: e.target.value })}
                    style={{ width: "300px", height: "60px" }}
                />
                {errors.notes && <p style={{ color: "red" }}>{errors.notes}</p>}

                <br /><br />
                <label>Reminder date and time:</label> &nbsp;
                <input
                    type="date"
                    min={today}
                    value={form.reminderDate}
                    onChange={e => setForm({ ...form, reminderDate: e.target.value })}
                />
                {errors.reminder && <p style={{ color: "red" }}>{errors.reminder}</p>}

                <input
                    type="time"
                    value={form.reminderTime}
                    onChange={e => setForm({ ...form, reminderTime: e.target.value })}
                    style={{ marginLeft: "10px" }}
                />
                {errors.time && <p style={{ color: "red" }}>{errors.time}</p>}

                <br /><br />
                <button onClick={handleAddNote}>Add Note</button>
            </div>

            {/* Notes Table */}
            <table border={1} cellPadding={10}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Notes</th>
                        <th>Reminder</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {subGridNotes.map(note => (
                        <tr key={note.notes_id || note.notes}>
                            <td>{note.notes_id || 0}</td>
                            <td>
                                <textarea
                                    value={note.notes}
                                    onChange={e =>
                                        setSubGridNotes(prev =>
                                            prev.map(n => (n === note ? { ...n, notes: e.target.value } : n))
                                        )
                                    }
                                    style={{ width: "250px", height: "50px" }}
                                />
                            </td>
                            <td>
                                <input
                                    type="datetime-local"
                                    value={formatForDateTimeLocal(note.reminder)}
                                    onChange={e =>
                                        setSubGridNotes(prev =>
                                            prev.map(n =>
                                                n === note
                                                    ? { ...n, reminder: new Date(e.target.value).toISOString() }
                                                    : n
                                            )
                                        )
                                    }
                                />
                            </td>
                            <td>
                                {note.notes_id === 0 ? (
                                    <>
                                        {/* <button
                                            style={{ border: 'none', backgroundColor: 'lightcoral', fontSize: '16px', color: 'white' }}
                                            onClick={() => saveToDb(note)}
                                        >
                                            Save
                                        </button> */}
                                        <button
                                            onClick={() => deleteFromDb(note)}
                                            style={{ marginLeft: 5, border: 'none', backgroundColor: 'darkmagenta', fontSize: '16px', color: 'white' }}
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => deleteFromDb(note)}
                                        style={{ marginLeft: 5, border: 'none', backgroundColor: 'darkmagenta', color: 'white', fontSize: '16px' }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SubGridPage;