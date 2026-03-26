from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine

DATABASE_URL = "postgresql://devteam:D3vteaM#21@172.16.1.8:5432/Notes_Database"
engine= create_engine(DATABASE_URL,pool_pre_ping=True)
sessionLocal = sessionmaker(autocommit=False,autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()