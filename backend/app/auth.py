"""
JobShield AI — FastAPI Backend
auth.py — Firebase ID token verification + FastAPI dependency injection
Place at: backend/app/auth.py

How it works:
  1. React frontend calls firebase.auth().currentUser.getIdToken()
  2. Attaches the token as: Authorization: Bearer <token>
  3. Every protected route uses `Depends(get_current_user)` to verify the token
  4. If valid, the decoded user dict is injected into the route handler
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth

from app.schemas import UserInfo


# ─── Bearer token extractor ───────────────────────────────────────────────────
bearer_scheme = HTTPBearer(
    scheme_name="Firebase Bearer Token",
    description="Pass the Firebase ID token obtained from the React client SDK",
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> UserInfo:
    """
    FastAPI dependency — verifies the Firebase ID token and returns user info.

    Usage in any route:
        @router.get("/protected")
        async def protected_route(user: UserInfo = Depends(get_current_user)):
            return {"uid": user.uid}

    Raises:
        401 — token missing, malformed, or expired
        403 — token valid but email not verified (optional enforcement)
    """
    token = credentials.credentials

    try:
        # Verify the token signature + expiry using Firebase Admin SDK
        # This also checks the Firebase project ID automatically
        decoded = firebase_auth.verify_id_token(token, check_revoked=True)
    except firebase_auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please refresh your session.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.InvalidIdTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Build and return the UserInfo model
    return UserInfo(
        uid=decoded["uid"],
        email=decoded.get("email", ""),
        name=decoded.get("name") or decoded.get("display_name"),
        email_verified=decoded.get("email_verified", False),
    )


async def verify_token_endpoint(id_token: str) -> UserInfo:
    """
    Standalone token verifier used by the /auth/verify POST endpoint.
    Accepts the raw token string (not from header).
    """
    try:
        decoded = firebase_auth.verify_id_token(id_token, check_revoked=True)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
        )

    return UserInfo(
        uid=decoded["uid"],
        email=decoded.get("email", ""),
        name=decoded.get("name") or decoded.get("display_name"),
        email_verified=decoded.get("email_verified", False),
    )
