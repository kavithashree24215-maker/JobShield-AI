"""
JobShield AI — FastAPI Backend
routes.py — All REST API endpoints
Place at: backend/app/routes.py

Endpoint map:
  POST   /api/auth/verify           → Verify Firebase ID token
  POST   /api/analyze               → Run AI job analysis
  GET    /api/history               → Get user's scan history (paginated)
  GET    /api/history/{scan_id}     → Get single scan by ID
  DELETE /api/history/{scan_id}     → Delete a scan
  GET    /api/dashboard/stats       → Dashboard aggregate statistics
  GET    /api/report                → Generate full summary report
"""

from datetime import datetime
from unittest import result

from firebase_admin import firestore
from google.api_core.exceptions import ResourceExhausted
from fastapi import Body
from app.firebase_admin import get_firestore_client


import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.auth     import get_current_user, verify_token_endpoint
from app.schemas  import (
    TokenRequest,
    UserInfo,
    JobAnalysisRequest,
    JobAnalysisResponse,
    HistoryResponse,
    DashboardStats,
    DeleteResponse,
    ReportResponse,
    APIResponse,
)
from app.ai_service import analyze_with_gemini
from app.database import (
    save_analysis,
    get_analysis_history,
    get_analysis_by_id,
    delete_analysis,
    get_dashboard_stats,
    generate_user_report,
)
from app.utils import mask_email

logger  = logging.getLogger(__name__)
router  = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
#  AUTH
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/auth/verify",
    response_model=UserInfo,
    tags=["Authentication"],
    summary="Verify Firebase ID Token",
    description=(
        "Pass the Firebase ID token (from the React client SDK) in the request body. "
        "Returns decoded user information if the token is valid. "
        "The React frontend calls this once after login to confirm the session with the backend."
    ),
)
async def verify_token(body: TokenRequest):
    """
    Called by React after firebase.auth().signIn...() resolves.
    The frontend gets the ID token with: await user.getIdToken()
    Then sends it here to establish a backend session.
    """
    user = await verify_token_endpoint(body.id_token)
    logger.info("Token verified for user %s", mask_email(user.email))
    return user


# ═══════════════════════════════════════════════════════════════════════════════
#  ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/analyze",
    response_model=JobAnalysisResponse,
    tags=["Analysis"],
    summary="Analyze a Job Posting",
    description=(
        "Submit a job posting for AI-powered fraud analysis. "
        "Returns a Trust Score (0–100), Risk Level, individual signal scores, "
        "red flag list, scam indicators, and actionable recommendations. "
        "The result is automatically saved to the user's Firestore history."
    ),
    status_code=status.HTTP_201_CREATED,
)
async def analyze_job_posting(
    body: JobAnalysisRequest,
    user: UserInfo = Depends(get_current_user),
):
    """
    Main analysis endpoint — wired to AnalyzeJob.jsx in the React frontend.

    React call:
        const response = await axios.post('/api/analyze', formData, {
            headers: { Authorization: `Bearer ${idToken}` }
        });
    """
    logger.info(
        "Analysis request from %s for role '%s' at '%s'",
        mask_email(user.email), body.title, body.company
    )

    # Run AI analysis engine
    result = analyze_with_gemini(body)

    # Persist to Firestore
    scan_id = await save_analysis(user.uid, result)

    result.id = scan_id
    result.date = datetime.utcnow().strftime("%d-%m-%Y %I:%M %p")

    logger.info(
        "Analysis complete — score: %d, risk: %s, saved: %s",
        result.trust_score,
        result.risk_level.value,
        scan_id,
    )

    return result

    


# ═══════════════════════════════════════════════════════════════════════════════
#  HISTORY
# ═══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/history",
    response_model=HistoryResponse,
    tags=["History"],
    summary="Get Analysis History",
    description="Returns the authenticated user's paginated job analysis history from Firestore.",
)
async def get_history(
    limit:       int           = Query(default=20,   ge=1,  le=100, description="Items per page"),
    start_after: Optional[str] = Query(default=None,description="Last document ID for cursor-based pagination"),
    user: UserInfo = Depends(get_current_user),
):
    """
    Wired to AnalysisHistory.jsx.

    React call:
        const { data } = await axios.get('/api/history', {
            headers: { Authorization: `Bearer ${idToken}` },
            params:  { limit: 20 }
        });
    """
    return await get_analysis_history(user.uid, limit=limit, start_after=start_after)


@router.get(
    "/history/{scan_id}",
    response_model=APIResponse,
    tags=["History"],
    summary="Get Single Analysis",
    description="Fetch a specific scan result by its Firestore document ID.",
)
async def get_single_analysis(
    scan_id: str,
    user: UserInfo = Depends(get_current_user),
):
    """
    Used when the user clicks 'View Report' on a history row.

    React call:
        const { data } = await axios.get(`/api/history/${scanId}`, {
            headers: { Authorization: `Bearer ${idToken}` }
        });
    """
    doc = await get_analysis_by_id(user.uid, scan_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{scan_id}' not found for this user",
        )
    return APIResponse(success=True, message="Analysis retrieved", data=doc)


@router.delete(
    "/history/{scan_id}",
    response_model=DeleteResponse,
    tags=["History"],
    summary="Delete an Analysis",
    description="Permanently delete a scan from the user's history.",
)
async def delete_scan(
    scan_id: str,
    user: UserInfo = Depends(get_current_user),
):
    """
    React call:
        await axios.delete(`/api/history/${scanId}`, {
            headers: { Authorization: `Bearer ${idToken}` }
        });
    """
    deleted = await delete_analysis(user.uid, scan_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{scan_id}' not found or already deleted",
        )
    return DeleteResponse(success=True, message=f"Analysis '{scan_id}' deleted successfully")


# ═══════════════════════════════════════════════════════════════════════════════
#  DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/dashboard/stats",
    response_model=DashboardStats,
    tags=["Dashboard"],
    summary="Get Dashboard Statistics",
    description=(
        "Returns aggregate statistics (total scans, scam counts, safe %, etc.) "
        "for the authenticated user. Wired to DashboardOverview.jsx."
    ),
)
async def dashboard_stats(user: UserInfo = Depends(get_current_user)):
    """
    React call:
        const { data } = await axios.get('/api/dashboard/stats', {
            headers: { Authorization: `Bearer ${idToken}` }
        });
    """
    return await get_dashboard_stats(user.uid)


# ═══════════════════════════════════════════════════════════════════════════════
#  REPORT
# ═══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/report",
    response_model=ReportResponse,
    tags=["Report"],
    summary="Generate Summary Report",
    description=(
        "Generates a comprehensive analysis report for the user. "
        "Optionally filter by date range using ISO 8601 start_date/end_date query params."
    ),
)
async def get_report(
    start_date: Optional[str] = Query(default=None, description="ISO 8601 start date filter, e.g. 2026-01-01"),
    end_date:   Optional[str] = Query(default=None, description="ISO 8601 end date filter,   e.g. 2026-12-31"),
    user: UserInfo = Depends(get_current_user),
):
    """
    React call:
        const { data } = await axios.get('/api/report', {
            headers: { Authorization: `Bearer ${idToken}` },
            params:  { start_date: '2026-01-01', end_date: '2026-12-31' }
        });
    """
    return await generate_user_report(user.uid, start_date=start_date, end_date=end_date)

@router.post("/scam-reports")
async def create_scam_report(report: dict = Body(...)):
    db = get_firestore_client()

    doc_ref = db.collection("scam_reports").document()

    report["id"] = doc_ref.id

    doc_ref.set(report)

    return {
        "success": True,
        "id": doc_ref.id,
        "message": "Report saved successfully"
    }
from google.api_core.exceptions import ResourceExhausted
from firebase_admin import firestore

@router.get("/scam-reports")
async def get_scam_reports():
    try:
        db = get_firestore_client()

        docs = (
            db.collection("scam_reports")
            .order_by("date", direction=firestore.Query.DESCENDING)
            .stream()
        )

        reports = []

        for doc in docs:
            data = doc.to_dict()

            data["id"] = doc.id
            data.setdefault("status", "Under Review")

            reports.append(data)

        return reports

    except ResourceExhausted:
        print("Firestore quota exceeded")
        return []

    except Exception as e:
        print("Firestore Error:", e)
        return []
