from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case, extract
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import Transaction, TransactionType, User, UserRole
from schemas import DashboardSummary, CategoryTotal, MonthlyTotal
from auth import require_role

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

_read_roles = (UserRole.analyst, UserRole.admin)


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(*_read_roles)),
):
    query = db.query(Transaction).filter(Transaction.deleted_at.is_(None))

    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)

    result = query.with_entities(
        func.sum(case((Transaction.type == TransactionType.income, Transaction.amount), else_=0)),
        func.sum(case((Transaction.type == TransactionType.expense, Transaction.amount), else_=0)),
        func.count(Transaction.id),
    ).first()

    total_income = result[0] or 0.0
    total_expenses = result[1] or 0.0

    return DashboardSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=total_income - total_expenses,
        transaction_count=result[2] or 0,
    )


@router.get("/by-category", response_model=List[CategoryTotal])
def get_by_category(
    type: Optional[TransactionType] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(*_read_roles)),
):
    query = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(Transaction.deleted_at.is_(None))

    if type:
        query = query.filter(Transaction.type == type)

    rows = query.group_by(Transaction.category).all()

    return [CategoryTotal(category=r.category, total=r.total) for r in rows]


@router.get("/monthly", response_model=List[MonthlyTotal])
def get_monthly_trends(
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(*_read_roles)),
):
    query = db.query(
        extract('year', Transaction.date).label("year"),
        extract('month', Transaction.date).label("month"),
        func.sum(case((Transaction.type == TransactionType.income, Transaction.amount), else_=0)).label("income"),
        func.sum(case((Transaction.type == TransactionType.expense, Transaction.amount), else_=0)).label("expense"),
    ).filter(Transaction.deleted_at.is_(None))

    if year:
        query = query.filter(extract('year', Transaction.date) == year)

    rows = query.group_by("year", "month").order_by("year", "month").all()

    return [
        MonthlyTotal(
            month=f"{int(r.year)}-{int(r.month):02d}",
            income=r.income or 0.0,
            expense=r.expense or 0.0
        )
        for r in rows
    ]


@router.get("/recent", response_model=List[dict])
def get_recent_activity(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(*_read_roles)),
):
    rows = db.query(Transaction).filter(
        Transaction.deleted_at.is_(None)
    ).order_by(Transaction.date.desc()).limit(limit).all()

    return [
        {
            "id": tx.id,
            "amount": tx.amount,
            "type": tx.type,
            "category": tx.category,
            "date": tx.date.isoformat(),
            "notes": tx.notes,
        }
        for tx in rows
    ]