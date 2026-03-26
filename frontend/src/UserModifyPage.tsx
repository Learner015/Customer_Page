import axios from "axios";
import { useEffect, useState } from "react";
// import CustomerPage from "./CustomerPage";
// import type { SelectChangeEvent } from "@mui/material";
import SubGridPage from "./SubGridPage";


const api = axios.create({
    baseURL: "http://127.0.0.1:8000/users"
});

interface User {
    id: number;
    name: string;
    email: string;
    country: string;
    ledger_type: string[] | string;
    raised_date: string;
    key_customer: boolean;
    sub_grid_notes: Note[]
}

interface CreateUser {
    email: string;
    name: string;
    country: string;
    key_customer: boolean;
    ledger_type: string[];
    raised_date: string;
    sub_grid_notes: Note[]
}

interface Props {
    userId: number | 0;
    onBack: () => void;
}

interface ErrorsNotes {
    notes?: string;
    reminder?: string;
    time?: string;
}

interface Note {
    notes_id: number;
    notes: string;
    reminder: string;
}

export default function UserModifyPage({ userId, onBack }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [error_N, setNameError] = useState<string | null>(null);
    const [error_E, setEmailError] = useState<string | null>(null);
    const [error_R, setR_DateError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ledgerError, setLedgerError] = useState<string | null>(null);
    const [note_errors, setNoteErrors] = useState<ErrorsNotes>({});

    const editUser = users.find(u => u.id === userId);

    const [checked, setChecked] = useState(false);
    const [name, setName] = useState("");
    const [country, setCountry] = useState("USA");
    const [ledger, setLedger] = useState<string[]>([]);
    const [email, setEmail] = useState("");
    const [subGridNotes, setSubGridNotes] = useState<Note[]>([]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [raisedDate, setRaised] = useState<Date>(today);

    const ledgerOptions = ["Credit", "Debit", "Savings", "Loan"];
    const countries = ["USA", "UK", "India"];

    const buttonStyle = (bg: string) => ({
        backgroundColor: bg,
        color: "white",
        fontFamily: 'monospace',
        fontWeight: 800,
        fontSize: "18px",
        border: "none",
        margin: "10px",
        padding: '10px',
        cursor: "pointer"
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/");
                setUsers(response.data);
            } catch {
                setError("Failed to fetch users");
            }
        };
        fetchUsers();
    }, []);

    const handleChange = (id: number, field: keyof User, value: any) => {
        setUsers(prev =>
            prev.map(u => u.id === id ? { ...u, [field]: value } : u)
        );

        if (field === "name") setNameError(null);
        if (field === "email") setEmailError(null);
        if (field === "raised_date") setR_DateError(null);
    };

    const handleLedgerCheckbox = (id: number, value: string, checked: boolean) => {
        setUsers(prev =>
            prev.map(u => {
                if (u.id === id) {
                    let updatedLedger: string[] = Array.isArray(u.ledger_type) ? [...u.ledger_type] : [u.ledger_type];

                    if (checked && !updatedLedger.includes(value)) updatedLedger.push(value);
                    if (!checked) updatedLedger = updatedLedger.filter(item => item !== value);

                    return { ...u, ledger_type: updatedLedger };
                }
                return u;
            })
        );
        setLedgerError(null);
    };


    const handleNewLedgerCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setLedger(prev =>
            prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        setLedgerError(null);
    };


    const handleSetDate = (dateStr: string) => {
        const setDate = new Date(dateStr);
        if (isNaN(setDate.getTime())) {
            alert("Invalid date format!");
            return;
        }
        if (setDate < today) {
            alert("Please select a valid future date!");
            return;
        }
        setRaised(setDate);
    };

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        const newUser: CreateUser = {
            email,
            name,
            country,
            key_customer: checked,
            ledger_type: ledger,
            raised_date: raisedDate.toISOString().split('T')[0],
            sub_grid_notes: subGridNotes
        };


        if (!newUser.name.trim()) {
            return setNameError("* Please fill out your name");
        }
        if (!newUser.email.trim()) {
            return setEmailError("* Please fill out your email");

        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(newUser.email)) {

            return setEmailError("* Invalid email format");
        }
        if (!newUser.ledger_type.length) {

            return setLedgerError("Please select at least one ledger type");
        }
        const emailExists = users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
        if (emailExists) {
            return setEmailError("* A user with this email already exists");
        }

        try {
            await api.post("/register", newUser);
            alert("User added successfully");

            setName("");
            setEmail("");
            setCountry("");
            setLedger([]);
            setChecked(false);
            setRaised(today);

        } catch (err: any) {
            console.error("Error saving user:", err);
            alert(err.response?.data?.message || "Failed to save user");
        }
    };

    const handleEditSave = async (user: User) => {

        if (!user.name.trim()) {
            return setNameError("* Please fill out your name");
        }

        if (!user.email.trim()) {
            return setEmailError("* Please fill out your email");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
            return setEmailError("* Invalid email format");
        }

        if (!Array.isArray(user.ledger_type) || !user.ledger_type.length) {
            return setLedgerError("Please select at least one ledger type");
        }

        for (let note of subGridNotes) {
            if (!note.notes.trim()) {
                setNoteErrors({ notes: "All notes must have text" });
                return;
            }
        }


        const formattedNotes = subGridNotes.map(note => ({
            ...note,
            reminder: note.reminder
                ? note.reminder
                : new Date().toISOString()
        }));

        try {
            await api.put(`/update/${user.id}`, {
                ...user,
                sub_grid_notes: formattedNotes
            });

            alert(`User ${user.id} updated successfully`);
        } catch (err) {
            alert("Failed to update user");
        }
    };

    return (
        
        <form style={{ margin: "10px", padding: "20px", border: "double" }}>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {userId === 0 ? (
                <>
                    <h1>New User</h1>
                    <label htmlFor="id">Current ID</label>
                    <input type="number" disabled value={userId} />
                    <br /><br />
                    <label>Name: <span style={{ color: "red" }}>*</span></label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} />
                    {error_N && <p style={{ color: "red" }}>{error_N}</p>}
                    <br /><br />

                    <label>Email: <span style={{ color: "red" }}>*</span></label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    {error_E && <p style={{ color: "red" }}>{error_E}</p>}
                    <br /><br />


                    <label>Country:<span style={{ color: "red" }}>*</span>  </label>
                    <select required value={country} onChange={e => setCountry(e.target.value)}>

                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <br />
                    <br />


                    <label>Ledger Type: <span style={{ color: "red" }}>*</span></label>
                    <div>
                        {ledgerOptions.map(option => (
                            <label key={option}>
                                <input required type="checkbox"
                                    value={option}
                                    checked={ledger.includes(option)}
                                    onChange={handleNewLedgerCheckbox} />
                                {option}
                            </label>
                        ))}
                        {ledgerError && <p style={{ color: "red" }}>{ledgerError}</p>}
                    </div>

                    <br /><br />

                    <label>Raised Date: <span style={{ color: "red" }}>*</span></label>
                    <input type="date" required
                        value={raisedDate.toISOString().split('T')[0]}
                        min={today.toISOString().split('T')[0]}
                        onChange={e => handleSetDate(e.target.value)} />
                    {error_R && <p style={{ color: "red" }}>{error_R}</p>}

                    <br /><br />

                    <label>Key Customer:</label>
                    <input required type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />
                    <br /><br />


                    <SubGridPage userId={userId} subGridNotes={subGridNotes} setSubGridNotes={setSubGridNotes} />
                    {note_errors.notes && <p style={{ color: 'red' }}>{note_errors.notes}</p>}
                    <br />
                    <br />


                    <button type="button" onClick={handleSave} style={buttonStyle('darkolivegreen')}>Save</button>
                </>
            ) : (
                <>
                    <h1>Edit User</h1>
                    {editUser && (
                        <>
                            {/* {alert(userId)} */}
                            <label>User Id:</label>
                            <input type="text" disabled value={userId} />
                            <br />
                            <br />
                            <label>Name: <span style={{ color: "red" }}>*</span></label>
                            <input type="text" value={editUser.name} onChange={e => handleChange(editUser.id, "name", e.target.value)} />
                            {error_N && <p style={{ color: "red" }}>{error_N}</p>}

                            <br /><br />

                            <label>Email: <span style={{ color: "red" }}>*</span></label>
                            <input value={editUser.email} onChange={e => handleChange(editUser.id, "email", e.target.value)} />
                            {error_E && <p style={{ color: "red" }}>{error_E}</p>}
                            <br />
                            <br />
                            <label>Country:</label>
                            <select required value={editUser.country} onChange={e => handleChange(editUser.id, "country", e.target.value)}>
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <br />
                            <br />
                            <label>Ledger Type:</label>
                            <div>
                                {ledgerOptions.map(type => (
                                    <label key={type}>
                                        <input type="checkbox"
                                            value={type}
                                            checked={Array.isArray(editUser.ledger_type) ? editUser.ledger_type.includes(type) : editUser.ledger_type === type}
                                            onChange={e => handleLedgerCheckbox(editUser.id, type, e.target.checked)} />
                                        {type}
                                    </label>
                                ))}
                                {ledgerError && <p style={{ color: "red" }}>{ledgerError}</p>}
                            </div>
                            <br />
                            <br />
                            <label>Raised Date:</label>
                            <input type="date"
                                value={editUser.raised_date}
                                min={today.toISOString().split('T')[0]}
                                onChange={e => handleChange(editUser.id, "raised_date", e.target.value)} />
                            {error_R && <p style={{ color: "red" }}>{error_R}</p>}
                            <br />
                            <br />
                            <label>Key Customer:</label>
                            <input type="checkbox" checked={editUser.key_customer} onChange={e => handleChange(editUser.id, "key_customer", e.target.checked)} />
                            <br />
                            <br />
                            <SubGridPage userId={userId} subGridNotes={subGridNotes} setSubGridNotes={setSubGridNotes} />
                            
                      
                            <br />
                            <br />
                            <button type="button" onClick={() => handleEditSave(editUser)} style={buttonStyle('darkolivegreen')}>Save</button>
                        </>
                    )}
                </>
            )}
            <button type='button' style={buttonStyle('darkgray')} onClick={onBack}>Cancel</button>
        </form>
        
     
    );
}