'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function App() {
  const [text, setText] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [plan, setPlan] = useState<any | null>(null);
  const [jobType, setJobType] = useState<'full_time' | 'internship' | ''>('');
  const [categories, setCategories] = useState<string[]>([]);

  const ingest = async () => {
    const res = await fetch('/api/ingest/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setSkills(data.skills ?? []);
  };

  const matchJobs = async () => {
    const res = await fetch('/api/match/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skills,
        top_k: 20,
        job_type: jobType || undefined,
        categories: categories.length ? categories : undefined,
      }),
    });
    const data = await res.json();
    setMatches(data);
  };

  const makePlan = async () => {
    const res = await fetch('/api/planner/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skills),
    });
    const data = await res.json();
    setPlan(data);
  };
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Career Coach</h1>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold">1) Paste resume text</h2>
        <textarea
          className="w-full h-40 p-3 border rounded"
          placeholder="Paste your resume text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={ingest} className="px-4 py-2 bg-blue-600 text-white rounded">
          Extract Skills
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">2) Detected skills (editable)</h2>
        <div className="flex gap-2 flex-wrap">
          {skills.map((s, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-200 rounded text-sm">
              {s}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="border p-2 rounded"
            placeholder="Add a skill"
            onKeyDown={(e) => {
              const v = (e.target as HTMLInputElement).value.trim();
              if (e.key === 'Enter' && v) {
                setSkills((prev) => Array.from(new Set([...prev, v])));
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <button onClick={matchJobs} className="px-4 py-2 bg-green-600 text-white rounded">
            Find Matches
          </button>
          <button onClick={makePlan} className="px-4 py-2 bg-purple-600 text-white rounded">
            Generate Plan
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">3) Job Filters</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded border ${jobType === 'full_time' ? 'bg-black text-white' : 'bg-white'}`}
              onClick={() => setJobType(jobType === 'full_time' ? '' : 'full_time')}
            >
              Full time
            </button>
            <button
              className={`px-3 py-1 rounded border ${jobType === 'internship' ? 'bg-black text-white' : 'bg-white'}`}
              onClick={() => setJobType(jobType === 'internship' ? '' : 'internship')}
            >
              Internship
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              className="border p-2 rounded"
              placeholder="Add category (e.g., Marketing, Sales, Finance)"
              onKeyDown={(e) => {
                const v = (e.target as HTMLInputElement).value.trim();
                if (e.key === 'Enter' && v) {
                  setCategories((prev) => Array.from(new Set([...prev, v])));
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            {categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {categories.map((c, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm">
                    {c}
                    <button
                      className="ml-2 text-xs text-red-600"
                      onClick={() => setCategories((prev) => prev.filter((x) => x !== c))}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">4) Job Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((m, idx) => (
            <motion.div
              key={idx}
              className="p-4 border rounded bg-white shadow-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{m.job.title}</div>
                  <div className="text-sm text-gray-600">
                    {m.job.company} · {m.job.category || 'General'} · {m.job.job_type || 'n/a'}
                  </div>
                </div>
                <div className="text-sm">Score: {(m.score * 100).toFixed(0)}%</div>
              </div>
              <p className="text-sm mt-2 text-gray-700">{m.job.snippet}</p>
              <div className="text-xs mt-2">
                <div>
                  <span className="font-medium">Matched:</span> {m.matched?.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Missing:</span> {m.missing?.join(', ')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">5) Planner</h2>
        {plan ? (
          <div className="space-y-3">
            {plan.plan?.map((p: any, i: number) => (
              <div key={i} className="border rounded p-3">
                <div className="font-semibold">{p.milestone}</div>
                <ul className="list-disc pl-5">
                  {p.items?.map((it: any, j: number) => (
                    <li key={j}>
                      {it.skill} — {it.resource} · {it.hours}h
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Generate a plan to see milestones.</p>
        )}
      </section>
    </div>
  );
}
