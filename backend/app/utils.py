"""
JobShield AI — FastAPI Backend
utils.py — Shared utility functions
Place at: backend/app/utils.py
"""

import re
import logging
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)


def sanitize_text(text: str, max_length: int = 5000) -> str:
    """
    Strip HTML tags, normalize whitespace, and truncate to max_length.
    Applied to all user-supplied text before it reaches the NLP engine.
    """
    # Remove HTML tags
    clean = re.sub(r"<[^>]+>", "", text)
    # Collapse multiple whitespace
    clean = re.sub(r"\s+", " ", clean).strip()
    # Truncate
    return clean[:max_length]


def normalize_email(email: str) -> str:
    """Lowercase and strip whitespace from email addresses."""
    return email.lower().strip()


def format_timestamp(dt: datetime | None = None) -> str:
    """Return a consistent ISO 8601 UTC timestamp string."""
    if dt is None:
        dt = datetime.utcnow()
    return dt.isoformat() + "Z"


def mask_email(email: str) -> str:
    """
    Partially mask an email address for safe logging.
    example@company.com → ex***@company.com
    """
    if "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    masked_local = local[:2] + "***" if len(local) > 2 else "***"
    return f"{masked_local}@{domain}"


def build_error_response(message: str, detail: Any = None) -> dict:
    """Standard error payload."""
    payload = {"success": False, "message": message}
    if detail:
        payload["detail"] = str(detail)
    return payload


def build_success_response(message: str, data: Any = None) -> dict:
    """Standard success payload."""
    payload = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    return payload


def validate_uid(uid: str) -> bool:
    """Firebase UIDs are 28-character alphanumeric strings."""
    return bool(uid and re.match(r"^[a-zA-Z0-9]{20,128}$", uid))


def paginate(items: list, page: int = 1, page_size: int = 20) -> dict:
    """Simple in-memory paginator (use Firestore cursors for large datasets)."""
    total    = len(items)
    start    = (page - 1) * page_size
    end      = start + page_size
    return {
        "items":    items[start:end],
        "total":    total,
        "page":     page,
        "pages":    (total + page_size - 1) // page_size,
        "has_more": end < total,
    }
