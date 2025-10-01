from pydantic import BaseModel
from typing import List, Optional, Literal

class ResumeIn(BaseModel):
    text: str

class JobDoc(BaseModel):
    id: str
    title: str
    company: str
    location: Optional[str] = None
    category: Optional[str] = None
    job_type: Optional[Literal["full_time", "internship"]] = None
    skills_required: List[str] = []
    skills_preferred: List[str] = []
    snippet: Optional[str] = None

class MatchQuery(BaseModel):
    skills: List[str]
    top_k: int = 20
    job_type: Optional[Literal["full_time", "internship"]] = None
    categories: Optional[List[str]] = None

class MatchResult(BaseModel):
    job: JobDoc
    score: float
    matched: List[str]
    missing: List[str]
