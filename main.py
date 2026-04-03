from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models
from models import User, Transaction
from transaction import router as transaction_router
from auth_routes import router as auth_router
from users import router as users_router
from dashboard import router as dashboard_router

app = FastAPI(
    title="Finance Dashboard API",
    description="Role-based financial records and analytics backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(transaction_router)
app.include_router(dashboard_router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Finance Dashboard API is running"}