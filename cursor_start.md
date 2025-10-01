# AI Career Coach — Cursor Bootstrap File

> Drop this **single file** into Cursor ("Create from prompt" or new file named `CURSOR_START.md`). Cursor/Copilot can scaffold the repo and generate all files from this spec.

---

## 0) Product Snapshot
- **Product**: Dynamic, skills‑aware **AI Career Coach** (real product, not just RAG demo).
- **Why different**: Skills‑gap visualization, *actionable* roadmaps, grounded "Why matched?" with JD snippets, and **scenario simulation** ("If I learn X, how many more jobs do I unlock?").
- **Architecture**: Next.js (App Router) + Tailwind + Framer Motion (UI). FastAPI MCP‑style backend (jobs = endpoints). Postgres for metadata; Qdrant/FAISS for vectors. Hybrid retrieval (BM25 later) + cross‑encoder rerank (future).
- **MCP Jobs (concept → endpoints)**: `resume_ingest`, `job_ingest`, `match`, `skill_gap`, `planner`, `qa`, `eval`.

---

## 1) Repo Layout
```
ai-career-coach/
├─ README.md
├─ .env.example
├─ docker-compose.yml
├─ frontend/
│  ├─ package.json
│  ├─ next.config.js
│  ├─ postcss.config.js
│  ├─ tailwind.config.ts
│  ├─ tsconfig.json
│  └─ src/
│     ├─ app/
│     │  ├─ layout.tsx
│     │  └─ page.tsx
│     ├─ components/
│     │  └─ App.tsx
│     └─ styles/globals.css
└─ backend/
   ├─ pyproject.toml
   └─ app/
      ├─ main.py
      ├─ schemas.py
      ├─ routes/
      │  ├─ ingest.py
      │  ├─ match.py
      │  ├─ planner.py
      │  └─ qa.py
      └─ services/
         ├─ embeddings.py
         ├─ index.py
         └─ resume_parser.py
```

---

## 2) Environment and Services
**.env.example**
```
# Backend
PORT=8000
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/postgres
QDRANT_URL=http://localhost:6333
EMBEDDINGS_MODEL=bge-base-en
```

**docker-compose.yml**
```
version: "3.8"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
  qdrant:
    image: qdrant/qdrant:latest
    ports: ["6333:6333"]
```

> Run vectors/DB via docker-compose. Start backend and frontend locally.

---

## 3) Frontend (Next.js 14 App Router)

**frontend/package.json**
```
{
  "name": "ai-career-coach-frontend",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000"
  },
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.454.0",
    "next": "14.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.0"
  }
}
```

**frontend/next.config.js**
```
/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };
module.exports = nextConfig;
```

**frontend/postcss.config.js**
```
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

**frontend/tailwind.config.ts**
```
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
export default config;
```

**frontend/tsconfig.json**
```
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "src/**/*"],
  "exclude": ["node_modules"]
}
```

**frontend/src/styles/globals.css**
```
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
body { @apply bg-gray-50 text-gray-900; }
```

**frontend/src/app/layout.tsx**
```
export const metadata = { title: 'AI Career Coach' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**frontend/src/app/page.tsx**
```tsx
"use client";
import App from "../components/App";
export default function Page() { return <App />; }
```

**frontend/src/components/App.tsx**
> Use the exact file already in your canvas named **“Ai Career Coach – Clickable Mockup (react)”**. Cursor: create `frontend/src/components/App.tsx` with the content from that canvas file.

---

## 4) Backend (FastAPI, MCP‑style)

**backend/pyproject.toml**
```
[project]
name = "career-coach-backend"
version = "0.1.0"
dependencies = [
  "fastapi",
  "uvicorn[standard]",
  "pydantic>=2",
  "python-multipart",
  "qdrant-client",
  "psycopg2-binary"
]
```

**backend/app/main.py**
```py
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
```

**backend/app/schemas.py**
```py
from pydantic import BaseModel
from typing import List, Optional

class ResumeIn(BaseModel):
    text: str

class JobDoc(BaseModel):
    id: str
    title: str
    company: str
    location: Optional[str] = None
    skills_required: List[str] = []
    skills_preferred: List[str] = []
    snippet: Optional[str] = None

class MatchQuery(BaseModel):
    skills: List[str]
    top_k: int = 20

class MatchResult(BaseModel):
    job: JobDoc
    score: float
    matched: List[str]
    missing: List[str]
```

**backend/app/routes/ingest.py**
```py
from fastapi import APIRouter
from ..schemas import ResumeIn

router = APIRouter()

@router.post("/resume")
def ingest_resume(payload: ResumeIn):
    # TODO: real parsing; demo: naive token skills
    tokens = payload.text.split()
    skills = sorted(set([t.strip(",.;").capitalize() for t in tokens if t.isalpha() and len(t) > 2]))
    return {"skills": skills[:50]}
```

**backend/app/routes/match.py**
```py
from fastapi import APIRouter
from ..schemas import MatchQuery, MatchResult, JobDoc

router = APIRouter()

_DUMMY_JOBS = [
    JobDoc(id="1", title="Software Engineer Intern", company="Scale AI", skills_required=["Python", "SQL"], skills_preferred=["Flask", "Docker"], snippet="We are seeking Python + SQL; Flask/Docker preferred."),
    JobDoc(id="2", title="ML Engineering Intern", company="Censys", skills_required=["Python"], skills_preferred=["TensorFlow", "Kubernetes"], snippet="ML pipelines; TF + K8s a plus."),
]

@router.post("/jobs", response_model=list[MatchResult])
def match_jobs(q: MatchQuery):
    results: list[MatchResult] = []
    for job in _DUMMY_JOBS:
        matched = [s for s in q.skills if s in job.skills_required]
        missing = [s for s in job.skills_required if s not in q.skills]
        score = len(matched) / max(1, len(job.skills_required))
        results.append(MatchResult(job=job, score=score, matched=matched, missing=missing))
    results.sort(key=lambda x: x.score, reverse=True)
    return results[: q.top_k]
```

**backend/app/routes/planner.py**
```py
from fastapi import APIRouter

router = APIRouter()

@router.post("/roadmap")
def roadmap(skills: list[str]):
    # naive demo roadmap
    plan = [
        {"milestone": "Next 3 Months", "items": [{"skill": "Flask", "resource": "Flask Mega-Tutorial", "hours": 25}]},
        {"milestone": "3–6 Months", "items": [{"skill": "Docker", "resource": "Docker Get Started", "hours": 12}]},
    ]
    return {"plan": plan}
```

**backend/app/routes/qa.py**
```py
from fastapi import APIRouter

router = APIRouter()

@router.post("/ask")
def ask(question: str):
    # placeholder: wire to retrieval later
    return {"answer": "(demo) This will cite job description snippets and resources.", "citations": []}
```

**backend/app/services/**
> Placeholders for future implementation (embeddings, vector index, resume parsing). Not required for first run.

---

## 5) UI/UX Flow (for reference while coding)
- **Welcome/Upload** → parse resume (or skip).
- **Profile & Skill Map** → edit detected skills.
- **Job Matches** → cards with score, **Why?** (matched/missing), modal + **Add to Plan**.
- **Career Planner** → milestones with skills, resources, mark progress, **Simulate** (later).
- **Insights** → opportunity growth, weekly summary.
- **Chat Dock** → grounded answers w/ links (wire later to `/qa/ask`).

---

## 6) Milestones Checklist (semester‑friendly)
1) Frontend mock running (this spec) ✅
2) Wire `/ingest/resume` → populate Profile skills
3) Wire `/match/jobs` → replace mock cards
4) Implement `/planner/roadmap` based on gaps
5) Add **Why matched?** using real JD snippets
6) Add **Scenario simulation**: add skill → recompute matches
7) Persist user state (Postgres)
8) (Stretch) Qdrant vectors + reranker; `/qa/ask` with citations

---

## 7) Run Instructions
```bash
# 1) services
cp .env.example .env
docker compose up -d

# 2) backend
cd backend
uvicorn app.main:app --reload --port 8000

# 3) frontend
cd ../frontend
npm i
npm run dev
# open http://localhost:3000
```

---

## 8) API Contracts (for Cursor to respect)
- **POST /ingest/resume** `{ text: string } → { skills: string[] }`
- **POST /match/jobs** `{ skills: string[], top_k?: number } → MatchResult[]`
- **POST /planner/roadmap** `string[] → { plan: { milestone, items[{skill,resource,hours}] }[] }`
- **POST /qa/ask** `{ question: string } → { answer: string, citations: any[] }`

---

## 9) Notes for Cursor
- Generate exact files as above.
- For `frontend/src/components/App.tsx`, **use the content from the canvas file** “Ai Career Coach – Clickable Mockup (react)”.
- Keep TypeScript strict. Prefer functional components, Tailwind classes, and no external UI kit.
- Leave services placeholders empty; we’ll implement real RAG later.

---

## 10) Stretch Tasks (later)
- Real resume parser (pdfminer/docx + skill NER).
- Job ingestion (Greenhouse/Lever scrape), embeddings (BGE/E5) → Qdrant.
- Cross‑encoder reranker (mxbai/colbert) for high‑precision order.
- Scenario simulator: compute Δ in eligible jobs per added skill.
- Auth + user progress persistence.

---

**End of file.**

