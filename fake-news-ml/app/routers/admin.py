"""
routers/admin.py
----------------
Administrator telemetry, user management, and global audit logging (Raw SQL).
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.auth import require_admin
from app.database import (
    raw_get_admin_stats,
    raw_get_admin_users,
    raw_get_admin_global_history,
    raw_delete_user_by_admin,
    raw_get_admin_payments,
    raw_get_admin_payment_stats
)

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Panel"])

@router.get("/stats")
async def get_admin_dashboard_stats(admin_user: dict = Depends(require_admin)):
    """System overview statistics aggregated with Raw SQL."""
    stats = raw_get_admin_stats()
    return stats

@router.get("/users")
async def get_admin_users_list(
    q: Optional[str] = None,
    role: Optional[str] = None,
    tier: Optional[str] = None,
    admin_user: dict = Depends(require_admin)
):
    """List registered users with multi-column search and role/tier filtering."""
    users = raw_get_admin_users(search=q, role=role, tier=tier)
    return {"users": users, "count": len(users)}

@router.get("/history")
async def get_admin_global_history(
    q: Optional[str] = None,
    verdict: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    admin_user: dict = Depends(require_admin)
):
    """Global system audit log of all predictions with search and verdict filtering."""
    logs = raw_get_admin_global_history(search=q, verdict=verdict, limit=limit, offset=offset)
    return {"logs": logs, "count": len(logs)}

@router.get("/payments")
async def get_admin_payments_list(
    q: Optional[str] = None,
    status: Optional[str] = None,
    plan: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    admin_user: dict = Depends(require_admin)
):
    """List financial payment transactions with search, status & plan filtering (Raw SQL)."""
    payments = raw_get_admin_payments(
        search=q,
        status_filter=status,
        plan_filter=plan,
        limit=limit,
        offset=offset
    )
    return {"payments": payments, "count": len(payments)}

@router.get("/payments/stats")
async def get_admin_payment_metrics(admin_user: dict = Depends(require_admin)):
    """Aggregate financial metrics and transaction revenue totals (Raw SQL)."""
    stats = raw_get_admin_payment_stats()
    return stats

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, admin_user: dict = Depends(require_admin)):
    """Delete user account (cannot delete admin)."""
    if user_id == admin_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself as administrator."
        )
    deleted = raw_delete_user_by_admin(user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or is protected."
        )
    return {"status": "deleted", "user_id": user_id}
