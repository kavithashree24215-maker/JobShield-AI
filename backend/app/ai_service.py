import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

print("Gemini Key Loaded:", os.getenv("GEMINI_API_KEY") is not None)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

from app.schemas import (
    JobAnalysisResponse,
    ScoreBreakdown,
    RiskLevel,
    AnalysisStatus,
)

model = genai.GenerativeModel("gemini-2.5-flash")

def analyze_with_gemini(job):

    prompt = f"""
You are an expert AI Job Scam Detection System.

Analyze this job posting.

Job Title:
{job.title}

Company:
{job.company}

Recruiter Email:
{job.recruiter_email}

Salary:
{job.salary}

Location:
{job.location}

Description:
{job.description}

Return ONLY valid JSON.

Format:

{{
  "trust_score":85,
  "risk_level":"SAFE",
  "flags":["..."],
  "recommendations":["..."]
}}
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()

    data = json.loads(text)

    trust = int(data["trust_score"])

    if trust >= 75:
        risk = RiskLevel.SAFE
        status = AnalysisStatus.VERIFIED

    elif trust >= 40:
        risk = RiskLevel.CAUTION
        status = AnalysisStatus.CAUTION

    else:
        risk = RiskLevel.HIGH_RISK
        status = AnalysisStatus.FLAGGED

    return JobAnalysisResponse(
        title=job.title,
        company=job.company,
        recruiter_email=job.recruiter_email,
        salary=job.salary,
        location=job.location,
        description=job.description,

        trust_score=trust,
        risk_level=risk,
        status=status,

        flags=data["flags"],
        scam_indicators=data["flags"],
        recommendations=data["recommendations"],

        breakdown=ScoreBreakdown(
            email_score=0,
            company_score=0,
            nlp_score=0,
            salary_score=0,
            urgency_score=0,
            contact_score=0,
        ),

        processing_time_ms=0,
        date=""
    )