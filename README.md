# AI Career Coach

This project is a dynamic, skills-aware AI Career Coach. It includes a Next.js 14 frontend and a FastAPI backend.

## Quick Start

1) Services

```bash
cp .env.example .env
docker compose up -d
```

2) Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

3) Frontend

```bash
cd ../frontend
npm i
npm run dev
# open http://localhost:3000
```

4) MCP Server (Model Context Protocol)

The MCP server exposes tools that proxy to the FastAPI backend. Useful for IDE agents (Cursor/Windsurf) to call `resume_ingest`, `match_jobs`, `planner_roadmap`, and `qa_ask` via MCP.

```bash
# in a new terminal
cd mcp-server
cp .env.example .env
npm i
npm run dev
# The server runs over stdio; configure your IDE/agent to launch `npm run dev` here.
# BACKEND_URL can be set in mcp-server/.env (defaults to http://localhost:8000)
```

See `cursor_start.md` for full details, architecture, and API contracts.
