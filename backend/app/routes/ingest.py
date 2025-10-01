from fastapi import APIRouter
from ..schemas import ResumeIn

router = APIRouter()

@router.post("/resume")
def ingest_resume(payload: ResumeIn):
    # TODO: real parsing; demo: naive token skills
    tokens = payload.text.split()
    skills = sorted(set([t.strip(",.;").capitalize() for t in tokens if t.isalpha() and len(t) > 2]))
    return {"skills": skills[:50]}
