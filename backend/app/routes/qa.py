from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class QuestionIn(BaseModel):
    question: str

@router.post("/ask")
def ask(payload: QuestionIn):
    question = payload.question
    # placeholder: wire to retrieval later
    return {"answer": "(demo) This will cite job description snippets and resources.", "citations": []}
