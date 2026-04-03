from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional
from models import UserRole, TransactionType


# ── Auth ──────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None


# ── User ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.viewer

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, v):
        return v.lower() if isinstance(v, str) else v


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Transaction ───────────────────────────────────────────────────────────────

class TransactionCreate(BaseModel):
    amount: float
    type: TransactionType
    category: str
    date: datetime
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v

    @field_validator("category")
    @classmethod
    def category_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("Category cannot be empty")
        return v.strip()


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    category: Optional[str] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v


class TransactionResponse(BaseModel):
    id: int
    amount: float
    type: TransactionType
    category: str
    date: datetime
    notes: Optional[str]
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Dashboard ─────────────────────────────────────────────────────────────────

class CategoryTotal(BaseModel):
    category: str
    total: float


class MonthlyTotal(BaseModel):
    month: str
    income: float
    expense: float


class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float
    transaction_count: int