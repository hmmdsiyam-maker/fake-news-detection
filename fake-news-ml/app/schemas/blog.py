"""
schemas/blog.py
---------------
Schemas for blog post creation, updates, and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any

class BlogCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=512)
    slug: Optional[str] = None
    excerpt: str = Field(min_length=5)
    content: str = Field(min_length=10)
    category: str = Field(default="AI Research")
    author_name: str = Field(default="Veritas Research Team")
    author_role: str = Field(default="Lead Researcher")
    author_avatar: Optional[str] = ""
    date: Optional[str] = ""
    read_time: Optional[str] = "5 min read"
    tags: Optional[str] = ""
    featured: bool = False

class BlogUpdateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=512)
    slug: str = Field(min_length=3, max_length=255)
    excerpt: str = Field(min_length=5)
    content: str = Field(min_length=10)
    category: str = Field(default="AI Research")
    author_name: str = Field(default="Veritas Research Team")
    author_role: str = Field(default="Lead Researcher")
    author_avatar: Optional[str] = ""
    date: Optional[str] = ""
    read_time: Optional[str] = "5 min read"
    tags: Optional[str] = ""
    featured: bool = False
