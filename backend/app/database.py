"""
JobShield AI — FastAPI Backend
database.py — All Firestore read/write operations
Place at: backend/app/database.py

Collection structure:
  users/{uid}/scans/{scanId}   — per-user job analysis history
  scam_reports/{reportId}      — community scam submissions
  verified_companies/{docId}   — admin-curated safe company list
"""

import logging
from datetime import datetime
from pydoc import doc
from typing import Optional

from google.cloud.firestore_v1.base_query import FieldFilter
from firebase_admin import firestore

from app.firebase_admin import get_firestore_client
from app.schemas import (
    JobAnalysisResponse,
    HistoryItem,
    HistoryResponse,
    DashboardStats,
    ReportResponse,
)

logger = logging.getLogger(__name__)


# ─── Helpers ─────────────────────────────────────────────────────────────────
def _doc_to_history_item(doc_id: str, data: dict) -> HistoryItem:
    """Convert a raw Firestore document dict into a HistoryItem schema."""
    # Firestore Timestamps come back as datetime objects
    date_val = data.get("date") or data.get("created_at") or ""
    if hasattr(date_val, "isoformat"):
        date_str = date_val.isoformat()
    else:
        date_str = str(date_val)

    return HistoryItem(
        id=doc_id,
        title=data.get("title", ""),
        company=data.get("company", ""),
        recruiter_email=data.get("recruiter_email", data.get("recruiterEmail", "")),
        salary=data.get("salary"),
        location=data.get("location"),
        trust_score=data.get("trust_score", data.get("trustScore", 0)),
        risk_level=data.get("risk_level", data.get("riskLevel", "")),
        status=data.get("status", ""),
        date=date_str,
    )


# ─── Save Analysis ────────────────────────────────────────────────────────────
async def save_analysis(uid: str, analysis: JobAnalysisResponse) -> str:
    """
    Persist a completed job analysis to Firestore under:
      users/{uid}/scans/{auto-id}

    Returns the new document ID.
    """
    db = get_firestore_client()

    doc_data = {
        "uid":            uid,
        "title":          analysis.title,
        "company":        analysis.company,
        "recruiter_email": analysis.recruiter_email,
        "salary":         analysis.salary,
        "location":       analysis.location,
        "description":    analysis.description,
        "trust_score":    analysis.trust_score,
        "risk_level":     analysis.risk_level.value,
        "status":         analysis.status.value,
        "flags":          analysis.flags,
        "scam_indicators": analysis.scam_indicators,
        "recommendations": analysis.recommendations,
        "breakdown": {
            "email_score":   analysis.breakdown.email_score,
            "company_score": analysis.breakdown.company_score,
            "nlp_score":     analysis.breakdown.nlp_score,
            "salary_score":  analysis.breakdown.salary_score,
            "urgency_score": analysis.breakdown.urgency_score,
            "contact_score": analysis.breakdown.contact_score,
        },
        "processing_time_ms": analysis.processing_time_ms,
        "date":           firestore.SERVER_TIMESTAMP,   # set by Firestore server clock
        "created_at":     datetime.utcnow().isoformat(),
    }

    # Add document to the user's scans sub-collection (auto-generated ID)
    _, doc_ref = db.collection("users").document(uid).collection("scans").add(doc_data)
    doc = doc_ref.get()

    print("Firestore document:", doc.to_dict())
    print("Date field:", doc.get("date"))

    analysis.date = doc.get("date").isoformat() if doc.get("date") else ""
    
    
    logger.info("Saved analysis %s for user %s", doc_ref.id, uid)
    return doc_ref.id


# ─── Get Analysis History ─────────────────────────────────────────────────────
async def get_analysis_history(
    uid: str,
    limit: int = 20,
    start_after: Optional[str] = None,
) -> HistoryResponse:
    """
    Return paginated scan history for a user from:
      users/{uid}/scans — ordered by created_at descending.
    """
    db    = get_firestore_client()
    col   = db.collection("users").document(uid).collection("scans")
    query = col.order_by("created_at", direction=firestore.Query.DESCENDING)

    # Cursor-based pagination
    if start_after:
        cursor_doc = col.document(start_after).get()
        if cursor_doc.exists:
            query = query.start_after(cursor_doc)

    # Fetch one extra to determine has_more
    docs = list(query.limit(limit + 1).stream())

    has_more    = len(docs) > limit
    page_docs   = docs[:limit]
    items       = [_doc_to_history_item(d.id, d.to_dict()) for d in page_docs]

    # Total count (note: Firestore doesn't have a cheap COUNT; use a counter doc in production)
    all_docs    = list(col.stream())
    total       = len(all_docs)

    return HistoryResponse(scans=items, total=total, has_more=has_more)


# ─── Get Single Analysis ──────────────────────────────────────────────────────
async def get_analysis_by_id(uid: str, scan_id: str) -> Optional[dict]:
    """Fetch a single scan document by its Firestore document ID."""
    db  = get_firestore_client()
    doc = db.collection("users").document(uid).collection("scans").document(scan_id).get()
    if doc.exists:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    return None


# ─── Delete Analysis ──────────────────────────────────────────────────────────
async def delete_analysis(uid: str, scan_id: str) -> bool:
    """
    Permanently delete a scan document from:
      users/{uid}/scans/{scan_id}
    Returns True if the document existed and was deleted.
    """
    db      = get_firestore_client()
    doc_ref = db.collection("users").document(uid).collection("scans").document(scan_id)
    doc     = doc_ref.get()

    if not doc.exists:
        return False

    doc_ref.delete()
    logger.info("Deleted analysis %s for user %s", scan_id, uid)
    return True


# ─── Dashboard Statistics ─────────────────────────────────────────────────────
async def get_dashboard_stats(uid: str) -> DashboardStats:
    """
    Compute live aggregate statistics from the user's scan history.
    Reads all scan documents for the user — suitable for moderate volume.
    For large datasets (1000+ scans), maintain a summary counter document instead.
    """
    db   = get_firestore_client()
    docs = list(
        db.collection("users").document(uid).collection("scans").stream()
    )

    total      = len(docs)
    safe       = sum(1 for d in docs if d.to_dict().get("trust_score", 0) >= 75)
    caution    = sum(1 for d in docs if 40 <= d.to_dict().get("trust_score", 0) < 75)
    high_risk  = sum(1 for d in docs if d.to_dict().get("trust_score", 0) < 40)

    safe_pct   = round((safe  / total * 100), 1) if total else 0.0
    scam_pct   = round((high_risk / total * 100), 1) if total else 0.0

    return DashboardStats(
        total_analyzed=total,
        scam_detected=high_risk,
        verified_jobs=safe,
        caution_jobs=caution,
        safe_percentage=safe_pct,
        scam_percentage=scam_pct,
    )


# ─── Generate User Report ─────────────────────────────────────────────────────
async def generate_user_report(
    uid: str,
    start_date: Optional[str] = None,
    end_date:   Optional[str] = None,
) -> ReportResponse:
    """
    Build a comprehensive summary report for the user.
    Optionally filter by date range (ISO 8601 strings).
    """
    db    = get_firestore_client()
    col   = db.collection("users").document(uid).collection("scans")
    query = col.order_by("created_at", direction=firestore.Query.DESCENDING)

    # Apply date filters if provided
    if start_date:
        query = query.where(filter=FieldFilter("created_at", ">=", start_date))
    if end_date:
        query = query.where(filter=FieldFilter("created_at", "<=", end_date))

    docs = list(query.stream())

    # Aggregate statistics
    total     = len(docs)
    safe      = sum(1 for d in docs if d.to_dict().get("trust_score", 0) >= 75)
    caution   = sum(1 for d in docs if 40 <= d.to_dict().get("trust_score", 0) < 75)
    high_risk = sum(1 for d in docs if d.to_dict().get("trust_score", 0) < 40)

    stats = DashboardStats(
        total_analyzed=total,
        scam_detected=high_risk,
        verified_jobs=safe,
        caution_jobs=caution,
        safe_percentage=round(safe / total * 100, 1) if total else 0.0,
        scam_percentage=round(high_risk / total * 100, 1) if total else 0.0,
    )

    # Collect and rank the most common scam indicator phrases
    from collections import Counter
    all_indicators: list[str] = []
    for d in docs:
        all_indicators.extend(d.to_dict().get("scam_indicators", []))
    top_patterns = [pattern for pattern, _ in Counter(all_indicators).most_common(5)]

    # Recent scans for the report body (up to 10)
    recent = [_doc_to_history_item(d.id, d.to_dict()) for d in docs[:10]]

    period = (
        f"{start_date} to {end_date}"
        if (start_date and end_date)
        else "All time"
    )

    return ReportResponse(
        user_uid=uid,
        generated_at=datetime.utcnow().isoformat(),
        period=period,
        total_scans=total,
        risk_distribution={"safe": safe, "caution": caution, "high_risk": high_risk},
        top_scam_patterns=top_patterns,
        stats=stats,
        recent_scans=recent,
    )
