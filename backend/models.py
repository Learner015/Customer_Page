from datetime import datetime, timezone
from pydantic import EmailStr
from sqlalchemy import  ARRAY, JSON, Boolean, Column, Date, DateTime, ForeignKey,Integer, String, Time
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class users(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email:EmailStr = Column(String, index=True, unique=True)
    country = Column(String, index=True)
    key_customer = Column(Boolean, index=True)
    ledger_type = Column(ARRAY(String))
    raised_date = Column(Date,index= True)
    sub_grid_notes =Column(JSON,nullable=False) 
 

class sub_grid(Base):
    __tablename__ = "sub_grid"

    notes_id = Column(Integer, primary_key=True, index=True,autoincrement=True)
    notes = Column(String)
    reminder = Column(DateTime, index=True)
    # reminderTime = Column(Time, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    
