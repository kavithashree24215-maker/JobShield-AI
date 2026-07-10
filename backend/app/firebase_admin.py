"""
JobShield AI — FastAPI Backend
firebase_admin.py — Firebase Admin SDK initialization + Firestore client
Place at: backend/app/firebase_admin.py
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from functools import lru_cache


# ─── Module-level singleton flag ──────────────────────────────────────────────
_firebase_initialized = False


def initialize_firebase() -> None:
    """
    Initialize the Firebase Admin SDK exactly once.
    Reads credentials from FIREBASE_SERVICE_ACCOUNT_JSON env var (JSON string)
    or FIREBASE_SERVICE_ACCOUNT_PATH env var (path to a .json key file).
    """
    global _firebase_initialized

    if _firebase_initialized or firebase_admin._apps:
        return

    # Option 1: Service account JSON stored as an environment variable (preferred for Railway/Render)
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if service_account_json:
        service_account_info = json.loads(service_account_json)
        cred = credentials.Certificate(service_account_info)

    # Option 2: Path to a local service-account key file (for local development)
    else:
        key_path = os.getenv(
            "FIREBASE_SERVICE_ACCOUNT_PATH",
            "serviceAccountKey.json",  # default path for local dev
        )
        if not os.path.exists(key_path):
            raise FileNotFoundError(
                f"Firebase service account key not found at '{key_path}'. "
                "Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH."
            )
        cred = credentials.Certificate(key_path)

    firebase_admin.initialize_app(cred)
    _firebase_initialized = True


@lru_cache(maxsize=1)
def get_firestore_client():
    """
    Return a cached Firestore client.
    The lru_cache ensures we reuse the same client across all requests.
    """
    return firestore.client()
