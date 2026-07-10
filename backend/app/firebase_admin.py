"""
JobShield AI — FastAPI Backend
firebase_admin.py — Firebase Admin SDK initialization + Firestore client
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from functools import lru_cache


_firebase_initialized = False


def initialize_firebase() -> None:
    """
    Initialize Firebase Admin SDK once.

    Priority:
    1. FIREBASE_SERVICE_ACCOUNT_JSON (Railway/Production)
    2. FIREBASE_SERVICE_ACCOUNT_PATH (Local)
    3. serviceAccountKey.json (Local default)
    """

    global _firebase_initialized

    if _firebase_initialized or firebase_admin._apps:
        return

    # Production: Railway environment variable
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

    if service_account_json:
        try:
            service_account_info = json.loads(service_account_json)

            cred = credentials.Certificate(service_account_info)

            print("Firebase initialized using FIREBASE_SERVICE_ACCOUNT_JSON")

        except json.JSONDecodeError:
            raise ValueError(
                "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON"
            )

    else:
        # Local development
        key_path = os.getenv(
            "FIREBASE_SERVICE_ACCOUNT_PATH",
            "serviceAccountKey.json"
        )

        if not os.path.exists(key_path):
            raise FileNotFoundError(
                f"Firebase service account key not found at '{key_path}'. "
                "Add FIREBASE_SERVICE_ACCOUNT_JSON in Railway variables."
            )

        cred = credentials.Certificate(key_path)

        print("Firebase initialized using local serviceAccountKey.json")

    firebase_admin.initialize_app(cred)
    _firebase_initialized = True


@lru_cache(maxsize=1)
def get_firestore_client():
    """
    Return cached Firestore client.
    """

    return firestore.client()