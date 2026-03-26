
import type { SelectChangeEvent } from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import UserMoifyPage from "./UserModifyPage";

// Axios instance
const api = axios.create({
    baseURL: "http://127.0.0.1:8000/users"
});

interface User {
    user_id: number;
    name: string;
    email: string;
    country: string;
    ledger_type: string[] | string;
    raised_date: string;
    key_customer: boolean;
}

interface CreateUser {
    user_id: number| 0;
    email: string;
    name: string;
    country: string;
    key_customer: boolean;
   ledger_type: string[] | string;
    raised_date: string;
}

export default function CustomerPage() {

    const [checked, setchecked] = useState(false)
    const [name, setName] = useState("")
    const [user_id, setuser_id] = useState(0)
    const [country, setCountry] = useState('');
    const [ledger, setLedger] = useState<string[]>([]);
    const [email, setEmail] = useState("")
   


    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const [raisedDate, setRaised] = useState<string>("")

    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isEdit, setEdit] = useState<boolean>(false);

    const [isNew, setNewUser] = useState(false)
    
    const countries = ["USA", "UK", "India"];
    const ledgerOptions = ["Credit", "Debit", "Savings", "Loan"];

    useEffect(() => {
        api.get("/")
            .then((res) => {
                setUsers(res.data);
            })
            .catch((err) => {
                setError(err.response?.data?.detail || err.message);
                console.error("Error fetching users:", err.response?.data || err.message);
            });
    }, []);


    const handleLedgerCheckbox = (id: number, value: string, checked: boolean) => {
        setUsers((prev) =>
            prev.map((u) => {
                if (u.user_id === id) {
                    let updatedLedger: string[] = Array.isArray(u.ledger_type)
                        ? [...u.ledger_type]
                        : [u.ledger_type];

                    if (checked) {
                        if (!updatedLedger.includes(value)) {
                            updatedLedger.push(value);
                        }
                    } else {
                        updatedLedger = updatedLedger.filter((item) => item !== value);
                    }

                    return { ...u, ledger_type: updatedLedger };
                }
                return u;
            })
        );
    };
    const handleNewLedgerCheckbox = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        
        setLedger((prev) =>
          prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value]
        );
    }

    const handleChange = (id: number, field: keyof User, value: any) => {
        setUsers((prev) =>
            prev.map((u) => (u.user_id === id ? { ...u, [field]: value } : u))
        );
    };




    const handleSetDate = (e: string) => {
        
        const setDate = new Date(e);
            // setRaised(setDate)
        
        if (isNaN(setDate.getTime())) {
            alert("Invalid date format!");
            return null;
        }

      
        
    
    
        if (setDate < today) {
            alert("Please select a valid future date!");
            return null;
        }
    
        return setRaised(e);
    };

    // const handleEditSave = (user: User) => {
    //     api.put(`/update/${user.user_id}`, {
    //         name: user.name,
    //         email: user.email,
    //         country: user.country,
    //         key_customer: user.key_customer,
    //         ledger_type: user.ledger_type,
    //         raised_date: user.raised_date
    //     })
    //         .then(() => {
    //             alert(`User ${user.user_id} updated successfully`);
    //             setEdit(null);
    //         })
    //         .catch(() => {
    //             alert("Failed to update user");
    //         });
    // };


// let Users:CreateUser = {
//     user_id:user_id,
//     email: email,
//     name:name,
//     country: country,
//     key_customer: checked,
//     ledger_type: ledger,
//     raised_date: raisedDate
    
    
 
   
// }
// const handleSave = async () => {
//     try {
     
//         if (!user_id || !name || !email) {
//             alert("Please fill in all required fields: ID, name, and email.");
//             return;
//         }

//         const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//         if (!emailRegex.test(email)) {
//             alert("Please enter a valid email address.");
//             return;
//         }

//         else{
//             // const res = await api.post("/register",Users);
//         console.log(Users)
//         const res = await api.post(`/register/`,Users);
//         return res

//         alert("User updated successfully");
//         setEdit(null);
//         }

//     } catch (err:any) {
//         console.error("Error updating user:", err);
//         alert(err.response?.data?.message || "Failed to update user");
//     }
// };



    const handleDelete = (user_id: number) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        api.delete(`/delete/${user_id}`)
            .then(() => {
                setUsers((prev) => prev.filter((u) => u.user_id !== user_id));
            })
            .catch(() => {
                alert("Failed to delete. Try again!");
            });
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Customer List</h2>
            <button onClick={() => { setNewUser(true) }}>Add New</button>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Country</th>
                        <th>Ledger Type</th>
                        <th>Raised Date</th>
                        <th>Key Customer</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.user_id}>
                                 <td>{u.user_id}</td>
                            <td>
                               {u.name}
                            </td>
                            <td>
                               {u.email}
                            </td>
                            <td>
                              {u.country}
                            </td>
                            <td>
                               { Array.isArray(u.ledger_type)
                                        ? u.ledger_type.join(", ")
                                        : u.ledger_type }
                            </td>
                            <td>
                                {u.raised_date}
                            </td>
                            <td>
                                {u.key_customer? "Yes" :"No"}
                            </td>
                            <td>
                                <button style={{margin: "5px", backgroundColor:"lightblue"}} onClick={()=>{return <></>}}> Edit </button>
                                <button style={{margin: "5px", backgroundColor:"coral"}}>Delete</button>
                            </td>
                        </tr>
                    ))}

                    {/* {isNew ? <>
                        <tr>
                            <td>
                                <input type="number" defaultValue={user_id} onChange={(e) => {
                                    const val = e.target.value;
                                    setuser_id(val === "" ? 0 : Number(val));
                                }}
                                />
                            </td>
                            <td>
                                <input type="text" placeholder="Enter Your Name" onChange={(e) => { setName(e.target.value) }}
                                />
                            </td>
                            <td>
                                <input type="email" placeholder="abc@gmail.com" onChange={(e) => { setEmail(e.target.value) }}
                                />
                            </td>
                            <td>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    {countries.map((country) => (
                                        <option key={country} value={country}>
                                            {country}
                                        </option>
                                    ))}
                                </select>

                            </td>
                                <td>

                                <div>
                                       
                                       <div
                                          
                                       >
                                           {ledgerOptions.map((name) => (
                                               <label
                                                   key={name}
                                                   style={{
                                                       display: "flex",
                                                       alignItems: "center",
                                                       padding: "4px 8px",
                                                       cursor: "pointer",
                                                   }}
                                               >
                                                   <input
                                                       type="checkbox"
                                                       value={name}
                                                       checked={ledger.includes(name)}
                                                       onChange={handleNewLedgerCheckbox}
                                                       style={{ marginRight: 8 }}
                                                       onClick={()=>{ledger.join(", ")}}
                                                   />
                                                   {name}
                                               </label>
                                           ))}
                                       </div>
                                   
                               </div>

                                </td>
                                <td>
                                    <input type="date" onChange={(e)=> handleSetDate(e.target.value)}/>
                                    <button onClick={()=>{alert(`raised date is ${raisedDate}`);}}>Click Me Temp</button>
                                </td>
                                <td>
                                    
                                    <td>
                                       
                                        <input type="checkbox" onClick={()=>{setchecked(!checked)}} defaultChecked={false} name="Key Customer" />
                                        
                                    </td>
                                </td>                                
                                <td>
                                    <button  onClick={() => { handleSave() }}> Save User To DB</button>
                                </td>
                        </tr>

                    </> :
                        ""
                    } */}

                </tbody>
            </table>
        </div>
    );
}





// Edit Logics
{/*
    1.  {isEdit === u.user_id ? (
                                    <input
                                        value={u.name}
                                        onChange={(e) => handleChange(u.user_id, "name", e.target.value)}
                                    />
                                ) : (
                                    u.name
                                )}
     
    2.  {isEdit === u.user_id ? (
                                    <input
                                        value={u.email}
                                        onChange={(e) => handleChange(u.user_id, "email", e.target.value)}
                                    />
                                ) : (
                                    u.email
                                )}
    3.   {isEdit === u.user_id ? (
                                    <select
                                        value={u.country}
                                        onChange={(e) => handleChange(u.user_id, "country", e.target.value)}
                                    >
                                        {countries.map((country) => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    u.country
                                )}

    4.  {isEdit === u.user_id ? (
                                    <div>
                                        {ledgerOptions.map((type) => (
                                            <label key={type} style={{ display: "block" }}>
                                                <input
                                                    type="checkbox"
                                                    value={type}
                                                    checked={
                                                        Array.isArray(u.ledger_type)
                                                            ? u.ledger_type.includes(type)
                                                            : u.ledger_type === type
                                                    }
                                                    onChange={(e) =>
                                                        handleLedgerCheckbox(
                                                            u.user_id,
                                                            type,
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                                {type}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    Array.isArray(u.ledger_type)
                                        ? u.ledger_type.join(", ")
                                        : u.ledger_type
                                )}

        5. {isEdit === u.user_id ? (
                                    <input
                                        type="date"

                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) =>
                                            handleChange(u.user_id, "raised_date", e.target.value)
                                        }
                                    />
                                ) : (
                                    String(u.raised_date)
                                )}
        6. {isEdit === u.user_id ? (
                                    <input
                                        type="checkbox"
                                        checked={u.key_customer}
                                        onChange={(e) =>
                                            handleChange(u.user_id, "key_customer", e.target.checked)
                                        }
                                    />
                                ) : u.key_customer ? "Yes" : "No"}


        7. {isEdit === u.user_id ? (
                                    <>
                                        <button onClick={() => handleEditSave(u)}>Save</button>
                                        <button onClick={() => setEdit(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setEdit(u.user_id)}>Edit</button>
                                        <button
                                            style={{
                                                marginLeft: "5px",
                                                border: "none",
                                                backgroundColor: "coral",
                                                color: "black",
                                                fontWeight: 600,
                                                cursor: "pointer"
                                            }}
                                            onClick={() => handleDelete(u.user_id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
    
    
    */}
    {/* // <Box p={2}>


        //   <TextField
        //     label="Reminder Date"
        //     type="date"
        //     value={form.reminderDate}
        //     onChange={(e) => {
        //       const selectedDate = e.target.value;
        //       if (selectedDate >= today) {
        //         setForm({ ...form, reminderDate: selectedDate });
        //       } else {
        //         alert("Please select today or a future date.");
        //       }
        //     }}
        //     slotProps={{
        //       inputLabel: { shrink: true },
        //       htmlInput: { min: today }
        //     }}
        //     fullWidth
        //     margin="normal"
        //   />

        //   <Button variant="contained" onClick={addNote} sx={{ mt: 1 }}>
        //     Add Note
        //   </Button>

        //   <TableContainer component={Paper} sx={{ mt: 2 }}>
        //     <Table>
        //       <TableHead>
        //         <TableRow>
        //           <TableCell>Note</TableCell>
        //           <TableCell>Reminder</TableCell>
        //           <TableCell>Actions</TableCell>
        //         </TableRow>
        //       </TableHead>
        //       <TableBody>
        //         {/* { userId ,noteId}:CustomerPageProps */}
        //         {/* key={noteId} */}
        //         {form.notes.map((note) => (
        //           <TableRow >
        //             {/* key={api.get()} */}
        //             <TableCell>{note.notes}</TableCell>
        //             <TableCell>{note.reminder}</TableCell>
        //             <TableCell>
        //               <Button variant="outlined" color ="success" onClick={() => saveToDb(note)}>Save</Button> 

        //               <Button variant="outlined" color="secondary" onClick={() => modifyInDb(note)}>Modify</Button>


        //               <Button variant="outlined" color="error" onClick={() => DeleteFromDb(note)}>Delete</Button>
        //             </TableCell>
        //             {/* <TableCell>

        //             </TableCell> */}
        //           </TableRow>
        //         ))}
        //       </TableBody>
        //     </Table>
        //   </TableContainer>
        // </Box> */}