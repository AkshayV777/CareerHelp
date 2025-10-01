from fastapi import APIRouter
from ..schemas import MatchQuery, MatchResult, JobDoc

router = APIRouter()

_DUMMY_JOBS = [
    # Tech
    JobDoc(id="1", title="Software Engineer Intern", company="Scale AI", category="Software Engineering", job_type="internship", skills_required=["Python", "SQL"], skills_preferred=["Flask", "Docker"], snippet="We are seeking Python + SQL; Flask/Docker preferred."),
    JobDoc(id="2", title="ML Engineer", company="Censys", category="Machine Learning", job_type="full_time", skills_required=["Python"], skills_preferred=["TensorFlow", "Kubernetes"], snippet="ML pipelines; TF + K8s a plus."),
    # Marketing
    JobDoc(id="3", title="Digital Marketing Specialist", company="Acme Corp", category="Marketing", job_type="full_time", skills_required=["SEO", "Analytics"], skills_preferred=["Google Ads", "Content"], snippet="Own SEO and analytics reporting; Google Ads a plus."),
    JobDoc(id="4", title="Marketing Intern", company="Globex", category="Marketing", job_type="internship", skills_required=["Research", "Writing"], skills_preferred=["Canva"], snippet="Assist with campaign research and content drafts."),
    # Design
    JobDoc(id="5", title="Product Designer", company="Initech", category="Design", job_type="full_time", skills_required=["Figma", "User Research"], skills_preferred=["Prototyping"], snippet="Design flows and wireframes; partner with PM/Eng."),
    # Sales
    JobDoc(id="6", title="Sales Development Representative", company="Umbrella", category="Sales", job_type="full_time", skills_required=["Outbound", "CRM"], skills_preferred=["HubSpot"], snippet="Prospect and qualify leads; maintain CRM hygiene."),
    # Finance
    JobDoc(id="7", title="Financial Analyst Intern", company="Wayne Enterprises", category="Finance", job_type="internship", skills_required=["Excel", "Modeling"], skills_preferred=["SQL"], snippet="Support modeling and quarterly reporting."),
    # Healthcare
    JobDoc(id="8", title="Healthcare Operations Associate", company="Stark Health", category="Healthcare", job_type="full_time", skills_required=["Scheduling", "Communication"], skills_preferred=["EMR"], snippet="Coordinate patient scheduling and ops tasks."),
]

@router.post("/jobs", response_model=list[MatchResult])
def match_jobs(q: MatchQuery):
    # Filter by job_type and categories if provided
    jobs = _DUMMY_JOBS
    if q.job_type:
        jobs = [j for j in jobs if j.job_type == q.job_type]
    if q.categories:
        cats = {c.lower() for c in q.categories}
        jobs = [j for j in jobs if (j.category or "").lower() in cats]

    results: list[MatchResult] = []
    for job in jobs:
        matched = [s for s in q.skills if s in job.skills_required]
        missing = [s for s in job.skills_required if s not in q.skills]
        score = len(matched) / max(1, len(job.skills_required))
        results.append(MatchResult(job=job, score=score, matched=matched, missing=missing))
    results.sort(key=lambda x: x.score, reverse=True)
    return results[: q.top_k]
