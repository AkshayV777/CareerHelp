from fastapi import APIRouter
from fastapi import Body

router = APIRouter()

@router.post("/roadmap")
def roadmap(skills: list[str] = Body(...)):
    # naive demo roadmap
    plan = [
        {"milestone": "Next 3 Months", "items": [{"skill": "Flask", "resource": "Flask Mega-Tutorial", "hours": 25}]},
        {"milestone": "3–6 Months", "items": [{"skill": "Docker", "resource": "Docker Get Started", "hours": 12}]},
    ]
    return {"plan": plan}
