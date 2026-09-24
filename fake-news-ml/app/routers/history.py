"""
routers/history.py
------------------
Personal user prediction history endpoints (Raw SQL).
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.auth import get_current_user
from app.database import (
    raw_get_user_history,
    raw_delete_history_item,
    raw_clear_user_history
)

router = APIRouter(prefix="/api/v1/history", tags=["Search History"])

@router.get("")
async def get_my_history(
    q: Optional[str] = None,
    verdict: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Retrieve personal prediction search history with search and verdict filtering."""
    records = raw_get_user_history(current_user["id"], search=q, verdict=verdict, limit=limit, offset=offset)
    return {"history": records, "count": len(records)}

@router.delete("/{history_id}")
async def delete_single_history_item(
    history_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete a single prediction history entry belonging to current user."""
    success = raw_delete_history_item(history_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History record not found or not owned by you."
        )
    return {"status": "deleted", "id": history_id}

@router.delete("")
async def clear_my_history(current_user: dict = Depends(get_current_user)):
    """Clear all prediction search history for the logged in user."""
    raw_clear_user_history(current_user["id"])
    return {"status": "cleared", "user_id": current_user["id"]}
