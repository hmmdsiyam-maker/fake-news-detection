"""
routers/blog.py
---------------
Blog management and editorial publishing endpoints with Raw SQL persistence.
Supports public search/view and admin create/edit/delete operations.
"""

import re
import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.blog import BlogCreateRequest, BlogUpdateRequest
from app.auth import require_admin
from app.database import (
    raw_get_all_blogs,
    raw_get_blog_by_slug,
    raw_get_blog_by_id,
    raw_create_blog,
    raw_update_blog,
    raw_delete_blog
)

router = APIRouter(prefix="/api/v1/blogs", tags=["Blog Engine"])

def slugify(text: str) -> str:
    """Generate URL-safe slug from title."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

@router.get("")
async def get_blogs(q: Optional[str] = None, category: Optional[str] = None):
    """Retrieve all published research articles with optional search and category filters."""
    posts = raw_get_all_blogs(search=q, category=category)
    return {"posts": posts, "count": len(posts)}

@router.get("/{slug}")
async def get_blog_by_slug(slug: str):
    """Retrieve a single blog post by its unique URL slug."""
    post = raw_get_blog_by_slug(slug)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog dispatch with slug '{slug}' not found."
        )
    return post

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_blog_post(
    payload: BlogCreateRequest,
    admin_user: dict = Depends(require_admin)
):
    """Admin-only: Publish a new research article or dispatch."""
    target_slug = payload.slug.strip() if payload.slug else slugify(payload.title)
    
    # Check duplicate slug
    existing = raw_get_blog_by_slug(target_slug)
    if existing:
        target_slug = f"{target_slug}-{int(datetime.datetime.now().timestamp())}"

    post_date = payload.date or datetime.datetime.now().strftime("%B %d, %Y")

    new_blog = raw_create_blog(
        slug=target_slug,
        title=payload.title.strip(),
        excerpt=payload.excerpt.strip(),
        content=payload.content.strip(),
        category=payload.category,
        author_name=payload.author_name or admin_user.get("username", "Veritas Lead"),
        author_role=payload.author_role or "Editorial Board",
        author_avatar=payload.author_avatar or "",
        date=post_date,
        read_time=payload.read_time or "5 min read",
        tags=payload.tags or "",
        featured=payload.featured
    )

    return {"status": "created", "post": new_blog}

@router.put("/{blog_id}")
async def update_blog_post(
    blog_id: int,
    payload: BlogUpdateRequest,
    admin_user: dict = Depends(require_admin)
):
    """Admin-only: Update an existing blog article."""
    existing = raw_get_blog_by_id(blog_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog ID #{blog_id} not found."
        )

    updated_blog = raw_update_blog(
        blog_id=blog_id,
        slug=payload.slug.strip(),
        title=payload.title.strip(),
        excerpt=payload.excerpt.strip(),
        content=payload.content.strip(),
        category=payload.category,
        author_name=payload.author_name,
        author_role=payload.author_role,
        author_avatar=payload.author_avatar or "",
        date=payload.date or existing["date"],
        read_time=payload.read_time,
        tags=payload.tags or "",
        featured=payload.featured
    )

    return {"status": "updated", "post": updated_blog}

@router.delete("/{blog_id}")
async def delete_blog_post(
    blog_id: int,
    admin_user: dict = Depends(require_admin)
):
    """Admin-only: Delete a blog article from PostgreSQL."""
    deleted = raw_delete_blog(blog_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog ID #{blog_id} not found."
        )
    return {"status": "deleted", "id": blog_id}
