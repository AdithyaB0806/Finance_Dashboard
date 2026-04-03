from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import Transaction, TransactionType, User, UserRole
from schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from auth import require_role, get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    """Admin only: create a new transaction."""
    tx = Transaction(
        amount=payload.amount,
        type=payload.type,
        category=payload.category,
        date=payload.date,
        notes=payload.notes,
        user_id=current_user.id,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.get("/", response_model=List[TransactionResponse])
def list_transactions(
    category: Optional[str] = Query(None, description="Filter by category"),
    type: Optional[TransactionType] = Query(None, description="Filter by type: income or expense"),
    date_from: Optional[datetime] = Query(None, description="Filter from this date (ISO format)"),
    date_to: Optional[datetime] = Query(None, description="Filter up to this date (ISO format)"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(50, ge=1, le=200, description="Number of results to return"),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.viewer, UserRole.analyst, UserRole.admin)),
):
    """All roles: list transactions with optional filters and pagination."""
    query = db.query(Transaction).filter(Transaction.deleted_at.is_(None))

    if category:
        query = query.filter(Transaction.category.ilike(f"%{category}%"))
    if type:
        query = query.filter(Transaction.type == type)
    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)

    return query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.viewer, UserRole.analyst, UserRole.admin)),
):
    """All roles: get a single transaction by ID."""
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.deleted_at.is_(None)
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin)),
):
    """Admin only: update a transaction."""
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.deleted_at.is_(None)
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if payload.amount is not None:
        tx.amount = payload.amount
    if payload.type is not None:
        tx.type = payload.type
    if payload.category is not None:
        tx.category = payload.category
    if payload.date is not None:
        tx.date = payload.date
    if payload.notes is not None:
        tx.notes = payload.notes

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.admin)),
):
    """Admin only: soft-delete a transaction (sets deleted_at timestamp)."""
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.deleted_at.is_(None)
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    tx.deleted_at = datetime.utcnow()
    db.commit()