from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import ingest, match, planner, qa

app = FastAPI(title="AI Career Coach MCP")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], allow_credentials=True
)

app.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
app.include_router(match.router, prefix="/match", tags=["match"])
app.include_router(planner.router, prefix="/planner", tags=["planner"])
app.include_router(qa.router, prefix="/qa", tags=["qa"])

@app.get("/health")
def health():
    return {"ok": True}
