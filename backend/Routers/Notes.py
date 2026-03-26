from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from database import sessionLocal
import models

router = APIRouter()


def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()


class CreateNotes(BaseModel):
    notes: str = Field(..., min_length=1, max_length=500)
    reminder: datetime


class NotesResponse(BaseModel):
    notes_id: int
    notes: str
    reminder: datetime
    user_id: int



@router.get("/notes/{user_id}", response_model=list[NotesResponse])
def get_notes(user_id: int, db: Session = Depends(get_db)):

    notes = (
        db.query(models.sub_grid)
        .filter(models.sub_grid.user_id == user_id)
        .all()
    )
    if not notes:
        return []
    return notes



@router.post("/notes/{user_id}", response_model=NotesResponse)
def create_notes(
    user_id: int,
    item: CreateNotes,
    db: Session = Depends(get_db)
):
    new_note = models.sub_grid(
        notes=item.notes,
        reminder=item.reminder,
        user_id=user_id
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


@router.put("/notes/modifyNotes/{notes_id}", response_model=NotesResponse)
def modify_notes(
    notes_id: int,
    updated_note: CreateNotes,
    db: Session = Depends(get_db)
):
    existing_note = (
        db.query(models.sub_grid)
        .filter(models.sub_grid.notes_id == notes_id)  # <-- fixed
        .first()
    )

    if not existing_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID {notes_id} not found"
        )

    existing_note.notes = updated_note.notes
    existing_note.reminder = updated_note.reminder

    db.commit()
    db.refresh(existing_note)

    return existing_note


@router.delete("/notes/deletenotes/{notes_id}", status_code=status.HTTP_200_OK)
def delete_notes(notes_id: int, db: Session = Depends(get_db)):
    existing_note = (
        db.query(models.sub_grid)
        .filter(models.sub_grid.notes_id == notes_id)  # <-- fixed
        .first()
    )

    if not existing_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID {notes_id} not found"
        )

    db.delete(existing_note)
    db.commit()

    return {"message": f"Deleted note with id {notes_id}"}