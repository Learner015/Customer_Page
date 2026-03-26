from ast import Delete
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Annotated, Any, Dict, List, Optional
from sqlalchemy import text
from sqlalchemy.orm import Session
# import Notes
from models import sub_grid, users
from database import get_db

class NoteItem(BaseModel):
    notes_id: int = None
    notes: str
    reminder: Optional[datetime] = None  

class CreateUser(BaseModel):
    email: EmailStr
    name: str
    country: str
    raised_date: date
    ledger_type: List[str] = Field(..., example=["Credit", "Debit"])
    key_customer: bool
    sub_grid_notes: Optional[List[NoteItem]] = None  

class UpdateUser(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    country: Optional[str]
    key_customer: Optional[bool]
    ledger_type: Optional[List[str]]
    raised_date: Optional[date]
    sub_grid_notes: Optional[List[NoteItem]] = None




class UserResponse(BaseModel):
    user_id: int
    email: EmailStr
    name: str
    country: str
    raised_date: date  
    ledger_type: List[str] = Field(..., examples=[["Credit", "Debit"]])
    key_customer: bool
    sub_grid_notes: Optional[List[Dict[str,Any]]]=None



router = APIRouter()
db_dependency = Annotated[Session, Depends(get_db)]





#create user


@router.post("/users/register", response_model=UserResponse)
def register_user(user: CreateUser, db: Session = Depends(get_db)):

    if db.query(users).filter(users.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    # Create user first (without notes)
    new_user = users(
        name=user.name,
        email=user.email,
        country=user.country,
        ledger_type=user.ledger_type,
        raised_date=user.raised_date,
        key_customer=user.key_customer,
        sub_grid_notes=[]
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    updated_notes = []

    if user.sub_grid_notes:
        for note in user.sub_grid_notes:
            new_note = sub_grid(
                user_id=new_user.user_id,
                notes=note.notes,
                reminder=note.reminder
            )
            db.add(new_note)
            db.commit()
            db.refresh(new_note)

            updated_notes.append({
                "notes_id": new_note.notes_id,
                "notes": new_note.notes,
                "reminder": new_note.reminder.isoformat() if new_note.reminder else None
            })

 
    new_user.sub_grid_notes = updated_notes
    db.commit()
    db.refresh(new_user)

    return new_user

# get all users
@router.get("/users")
async def get_users(db: Session = Depends(get_db)):

    users_list = db.query(users).all()
    response = []

    for u in users_list:

     
        notes = db.query(sub_grid).filter(
            sub_grid.user_id == u.user_id
        ).all()

        notes_list = [
            {
                "notes_id": n.notes_id,
                "notes": n.notes,
                "reminder": n.reminder.isoformat() if n.reminder else None
            }
            for n in notes
        ]

        response.append({
            "id": u.user_id,
            "name": u.name,
            "email": u.email,
            "country": u.country,
            "ledger_type": u.ledger_type,
            "raised_date": u.raised_date,
            "key_customer": u.key_customer,
            "sub_grid_notes": notes_list 
        })

    return response



#get user by user id
@router.get("/users/{user_id}")
async def check_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(users).filter(users.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Please register first")
    return {"User exist": user}


#create user

@router.get("/users/{user_id}")
async def check_user_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(users).filter(users.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Please register first")
    return {"User exist": user}


# Update user
@router.put("/users/update/{user_id}")
def update_user(user_id: int, user_data: UpdateUser, db: Session = Depends(get_db)):

    db_user = db.query(users).filter(users.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update simple fields
    if user_data.name is not None:
        db_user.name = user_data.name
    if user_data.email is not None:
        db_user.email = user_data.email
    if user_data.country is not None:
        db_user.country = user_data.country
    if user_data.raised_date is not None:
        db_user.raised_date = user_data.raised_date
    if user_data.ledger_type is not None:
        db_user.ledger_type = user_data.ledger_type
    if user_data.key_customer is not None:
        db_user.key_customer = user_data.key_customer

    updated_notes = []

    if user_data.sub_grid_notes is not None:

        # Delete old notes
        db.query(sub_grid).filter(
            sub_grid.user_id == user_id
        ).delete(synchronize_session=False)

        db.commit()

        
        for note in user_data.sub_grid_notes:
            new_note = sub_grid(
                user_id=user_id,
                notes=note.notes,
                reminder=note.reminder
            )
            db.add(new_note)
            db.commit()
            db.refresh(new_note)

            updated_notes.append({
                "notes_id": new_note.notes_id,
                "notes": new_note.notes,
                "reminder": new_note.reminder.isoformat() if new_note.reminder else None
            })

       
        db_user.sub_grid_notes = updated_notes

    db.commit()
    db.refresh(db_user)

    return {"message": f"User {user_id} updated successfully"}

# delete user

@router.delete("/users/delete/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(users).filter(users.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    

    db.query(sub_grid).filter(sub_grid.user_id == user_id).delete(synchronize_session=False)
    

    db.delete(db_user)
    db.commit()

    return {"message": f"User {user_id} deleted successfully"}
    