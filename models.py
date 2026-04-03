import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


# ✅ ENUMS FIRST
class UserRole(str, enum.Enum):
    viewer = "viewer"
    analyst = "analyst"
    admin = "admin"


class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"


# ✅ USER TABLE
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    role = Column(
        SAEnum(UserRole, name="userrole", create_type=True),
        default=UserRole.viewer,
        nullable=False
    )

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="owner")


# ✅ TRANSACTION TABLE
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)

    type = Column(
        SAEnum(TransactionType, name="transactiontype", create_type=True),
        nullable=False
    )

    category = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    notes = Column(String, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    owner = relationship("User", back_populates="transactions")