"""
JobShield AI — FastAPI Backend
schemas.py — All Pydantic v2 request and response models
Place at: backend/app/schemas.py
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────
class RiskLevel(str, Enum):
    SAFE        = "Safe"
    CAUTION     = "Caution"
    HIGH_RISK   = "High Risk"


class AnalysisStatus(str, Enum):
    VERIFIED = "Verified"
    CAUTION  = "Caution"
    FLAGGED  = "Flagged"


# ─── Auth Schemas ─────────────────────────────────────────────────────────────
class TokenRequest(BaseModel):
    """Firebase ID token sent by the React frontend after login."""
    id_token: str = Field(..., description="Firebase ID token from the client SDK")


class UserInfo(BaseModel):
    """Decoded user info returned after token verification."""
    uid: str
    email: str
    name: Optional[str] = None
    email_verified: bool = False


# ─── Job Analysis Schemas ─────────────────────────────────────────────────────
class JobAnalysisRequest(BaseModel):
    """
    Payload sent by AnalyzeJob.jsx when the user submits a job for scanning.
    Maps exactly to the form fields in the React frontend.
    """
    title:           str  = Field(..., min_length=2,  max_length=200,  description="Job title")
    company:         str  = Field(..., min_length=2,  max_length=200,  description="Company name")
    recruiter_email: str  = Field(..., min_length=5,  max_length=320,  description="Recruiter email address")
    salary:          Optional[str] = Field(None, max_length=100,       description="Salary range as text")
    location:        Optional[str] = Field(None, max_length=200,       description="Job location")
    description:     str  = Field(..., min_length=20, max_length=5000, description="Full job description text")

    @field_validator("recruiter_email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email format")
        return v

    @field_validator("description")
    @classmethod
    def strip_html(cls, v: str) -> str:
        """Remove any HTML tags before NLP processing."""
        import re
        clean = re.sub(r"<[^>]+>", "", v)
        return clean.strip()


class ScoreBreakdown(BaseModel):
    """Individual sub-scores that feed into the final Trust Score."""
    email_score:   int = Field(..., ge=0, le=100)
    company_score: int = Field(..., ge=0, le=100)
    nlp_score:     int = Field(..., ge=0, le=100)
    salary_score:  int = Field(..., ge=0, le=100)
    urgency_score: int = Field(..., ge=0, le=100)
    contact_score: int = Field(..., ge=0, le=100)


class JobAnalysisResponse(BaseModel):
    """Full trust report returned by POST /api/analyze."""
    id:                  Optional[str]   = None
    title:               str
    company:             str
    recruiter_email:     str
    salary:              Optional[str]   = None
    location:            Optional[str]   = None
    description:         str
    trust_score:         int             = Field(..., ge=0, le=100)
    risk_level:          RiskLevel
    status:              AnalysisStatus
    flags:               List[str]       = []
    recommendations:     List[str]       = []
    scam_indicators:     List[str]       = []
    breakdown:           ScoreBreakdown
    processing_time_ms:  int
    date:                Optional[str]   = None


# ─── Dashboard Schemas ────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    """Aggregate stats returned by GET /api/dashboard/stats."""
    total_analyzed:  int
    scam_detected:   int
    verified_jobs:   int
    caution_jobs:    int
    safe_percentage: float
    scam_percentage: float


# ─── History Schemas ──────────────────────────────────────────────────────────
class HistoryItem(BaseModel):
    """Single analysis record stored in Firestore and returned by GET /api/history."""
    id:              str
    title:           str
    company:         str
    recruiter_email: str
    salary:          Optional[str] = None
    location:        Optional[str] = None
    trust_score:     int
    risk_level:      str
    status:          str
    date:            str


class HistoryResponse(BaseModel):
    """Paginated history list."""
    scans:    List[HistoryItem]
    total:    int
    has_more: bool


# ─── Delete Schema ────────────────────────────────────────────────────────────
class DeleteResponse(BaseModel):
    success: bool
    message: str


# ─── Report Schema ────────────────────────────────────────────────────────────
class ReportRequest(BaseModel):
    """
    Optional filters for the summary report.
    GET /api/report — generates a statistics summary for the user.
    """
    start_date: Optional[str] = None
    end_date:   Optional[str] = None


class ReportResponse(BaseModel):
    """Summary report returned to the frontend."""
    user_uid:          str
    generated_at:      str
    period:            str
    total_scans:       int
    risk_distribution: Dict[str, int]
    top_scam_patterns: List[str]
    stats:             DashboardStats
    recent_scans:      List[HistoryItem]


# ─── Generic API Response ────────────────────────────────────────────────────
class APIResponse(BaseModel):
    """Generic success/error wrapper."""
    success: bool
    message: str
    data:    Optional[Any] = None
