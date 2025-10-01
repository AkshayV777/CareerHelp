import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { fetch } from 'undici';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Utility to POST JSON to backend
async function postJson<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend error ${res.status}: ${text}`);
  }
  return (await res.json()) as TRes;
}

async function main() {
  const server = new Server(
    { name: 'career-coach-mcp', version: '0.1.0' },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // resume_ingest: { text } -> { skills: string[] }
  (server as any).tool(
    'resume_ingest',
    {
      description: 'Extract skills from a resume text via backend /ingest/resume',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
        },
        required: ['text'],
      },
    },
    async (input: { text: string }) => {
      return await postJson<{ text: string }, { skills: string[] }>(
        '/ingest/resume',
        { text: input.text }
      );
    }
  );

  // match_jobs: { skills: string[], top_k?: number } -> MatchResult[]
  (server as any).tool(
    'match_jobs',
    {
      description: 'Get job matches for a set of skills via backend /match/jobs',
      inputSchema: {
        type: 'object',
        properties: {
          skills: { type: 'array', items: { type: 'string' } },
          top_k: { type: 'number' },
          job_type: { type: 'string', enum: ['full_time', 'internship'] },
          categories: { type: 'array', items: { type: 'string' } },
        },
        required: ['skills'],
      },
    },
    async (input: { skills: string[]; top_k?: number; job_type?: 'full_time' | 'internship'; categories?: string[] }) => {
      return await postJson<typeof input, any[]>('/match/jobs', input);
    }
  );

  // planner_roadmap: { skills: string[] } -> { plan: ... }
  (server as any).tool(
    'planner_roadmap',
    {
      description: 'Generate a learning roadmap via backend /planner/roadmap',
      inputSchema: {
        type: 'object',
        properties: {
          skills: { type: 'array', items: { type: 'string' } },
        },
        required: ['skills'],
      },
    },
    async (input: { skills: string[] }) => {
      return await postJson<string[], any>('/planner/roadmap', input.skills);
    }
  );

  // qa_ask: { question } -> { answer, citations }
  (server as any).tool(
    'qa_ask',
    {
      description: 'Ask a question via backend /qa/ask',
      inputSchema: {
        type: 'object',
        properties: {
          question: { type: 'string' },
        },
        required: ['question'],
      },
    },
    async (input: { question: string }) => {
      return await postJson<typeof input, any>('/qa/ask', input);
    }
  );

  // Health check tool
  (server as any).tool(
    'health',
    {
      description: 'Check backend health at /health',
      inputSchema: { type: 'object', properties: {} },
    },
    async () => {
      const res = await fetch(`${BACKEND_URL}/health`);
      return await res.json();
    }
  );

  await server.connect(new StdioServerTransport());
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('MCP server failed to start', err);
  process.exit(1);
});
