from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from Routers import Customer, Notes
from database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow your React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(Customer.router)
app.include_router(Notes.router)

@app.get("/health")
async def health():
    return {"msg": "ok"}