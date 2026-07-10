"""
JobShield AI — FastAPI Backend
analyzer.py — AI Risk Analysis Engine
Place at: backend/app/analyzer.py

Architecture:
  6 independent signal modules → weighted aggregation → Trust Score 0-100
  Each module returns an integer score (0-100) + a list of flag strings.

  Module weights:
    NLP Description Analysis   : 25%
    Email Domain Quality       : 20%
    Company Name Legitimacy    : 20%
    Salary Realism             : 15%
    Urgency / Fee Language     : 10%
    Recruiter Contact Quality  : 10%
"""

from pydoc import text
import re
from sys import flags
from sys import flags
import time
import socket
import logging
from typing import Tuple
from typing import Optional
from urllib import request
from app.schemas import (
    JobAnalysisRequest,
    JobAnalysisResponse,
    ScoreBreakdown,
    RiskLevel,
    AnalysisStatus,
)

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
#  MODULE 1 — NLP Description Analysis (25%)
# ═══════════════════════════════════════════════════════════════════════════════

# High-confidence scam phrases derived from the EMSCAD fake-job dataset
_SCAM_PHRASES = [
    r"\bno experience (required|needed)\b",
    r"\bguaranteed (placement|job|income|salary)\b",
    r"\b(training|registration|starter|kit) fee\b",
    r"\b(refundable|fully refundable) deposit\b",
    r"\bwork from home.*earn.*\$\d{3,}",
    r"\bupfront (payment|investment|cost)\b",
    r"\bmake \$\d{3,} (per|a) (day|week|hour)\b",
    r"\bno interview (required|needed)\b",
    r"\beasy money\b",
    r"\bpassive income\b",
    r"\bmulti.?level\b",
    r"\bpyramid\b",
    r"\bcash app\b",
    r"\bzelle.*payment\b",
    r"\bsend money\b",
    r"\bgift card.*pay(ment)?\b",
    r"\byou will be paid weekly.*guarantee\b",
    r"\b(earn|make|income) (up to|as much as) \$\d{3,}\b",
    r"\bno qualifications\b",
    r"\bimmediate hire.*no (background|interview)\b",
    r"\btelegram (only|contact|required)\b",
    r"\bwhatsapp.*(interview|apply)\b",
]

# Legitimate signal phrases that increase confidence
_LEGIT_PHRASES = [
    r"\b(bachelor|master|phd|degree|b\.tech|b\.e\.)\b",
    r"\b(experience|years of experience|yoe)\b",
    r"\b(interview process|technical (round|interview))\b",
    r"\b(equity|stock options|esop)\b",
    r"\b(health (insurance|benefits)|dental|vision)\b",
    r"\b(annual (salary|ctc|package))\b",
    r"\b(collaborate|team|agile|sprint)\b",
    r"\bresponsibilities (include|are|will)\b",
    r"\bqualifications\b",
    r"\breference (check|verification)\b",
]


def _analyze_description(description: str) -> Tuple[int, list[str]]:
    """
    Rule-based NLP analysis of the job description.
    Returns (score 0-100, list of flag strings).
    """
    text = description.lower()
    flags = []

    # Count scam signal hits
    scam_hits = 0
    for pattern in _SCAM_PHRASES:
        if re.search(pattern, text):
            scam_hits += 1
            # Extract a human-readable label from the pattern
            readable = pattern.replace(r"\b", "").replace(r"\d{3,}", "###").split("(")[0].strip()
            flags.append(f'⚠ Suspicious phrase detected: "{readable[:40]}"')

    # Count legitimacy signals
    legit_hits = 0
    for pattern in _LEGIT_PHRASES:
        if re.search(pattern, text):
            legit_hits += 1
    if "whatsapp" in text:
        scam_hits += 1
    if "fee" in text or "pay" in text:
        scam_hits += 1
    if "no interview" in text:
        scam_hits += 1
    if "gmail" in text:
        scam_hits += 1
    # NEW STRONGER SCAM SCORING
    scam_penalty = min(scam_hits * 25, 95)
    legit_bonus  = min(legit_hits * 2, 6)

    score = 100 - scam_penalty + legit_bonus
    score = max(0, min(100, score))

    # HARD OVERRIDE (STRONGER VERSION)
    if scam_hits >= 3 or (isinstance(description, str) and (
        "whatsapp" in text and "fee" in text and "gmail" in text
    )):
        score = 5
        flags.append("🚨 CRITICAL SCAM: multiple high-risk signals detected")
    # Bonus: description length (very short descriptions are suspicious)
    if len(description) < 100:
        score = max(0, score - 15)
        flags.append("⚠ Job description is unusually brief")
    elif len(description) > 400:
        score = min(100, score + 5)

    return score, flags




# ═══════════════════════════════════════════════════════════════════════════════
#  MODULE 2 — Email Domain Analysis (20%)
# ═══════════════════════════════════════════════════════════════════════════════

# Domains associated with scam recruiters (generic + known bad)
_GENERIC_DOMAINS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "live.com", "mail.com", "icloud.com", "aol.com",
    "protonmail.com", "yandex.com",
}

# TLDs commonly used in scam domains
_SUSPICIOUS_TLDS = {".xyz", ".cc", ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".info"}

# Known scam domain keywords
_SCAM_DOMAIN_KEYWORDS = [
    "jobs", "career", "work", "hire", "recruit", "opportunity",
    "global", "logistics", "solutions", "services", "partners",
]


def _check_mx_record(domain: str) -> bool:
    """
    Attempt a DNS MX lookup for the email domain.
    Returns True if MX records exist (domain accepts email).
    Falls back to False on timeout or error.
    """
    try:
        # Use socket to do a basic hostname resolution as fallback
        # In production, use dnspython: dns.resolver.resolve(domain, 'MX')
        socket.setdefaulttimeout(3)
        socket.getaddrinfo(domain, None)
        return True
    except Exception:
        return False


def _analyze_email(email: str) -> Tuple[int, list[str]]:
    """Analyse recruiter email domain quality. Returns (score, flags)."""
    flags = []
    score = 80  # start optimistic

    if "@" not in email:
        return 0, ["✗ Invalid email format"]

    local, domain = email.lower().rsplit("@", 1)

    # Generic personal email used for corporate recruitment
    if domain in _GENERIC_DOMAINS:
        score -= 35
        flags.append(f"⚠ Generic email domain '{domain}' — legitimate companies use corporate email")

    # Suspicious TLD
    tld = "." + domain.rsplit(".", 1)[-1] if "." in domain else ""
    if tld in _SUSPICIOUS_TLDS:
        score -= 40
        flags.append(f"✗ Suspicious TLD '{tld}' — commonly used in scam domains")

    # Multiple hyphens or numbers in domain — common in fake company domains
    domain_name = domain.split(".")[0]
    if len(re.findall(r"[-_]", domain_name)) >= 2:
        score -= 15
        flags.append("⚠ Multiple hyphens/underscores in email domain")

    if re.search(r"\d{4,}", domain_name):
        score -= 10
        flags.append("⚠ Long number sequence in email domain")

    # Domain contains scam-associated keywords
    for keyword in _SCAM_DOMAIN_KEYWORDS:
        if keyword in domain_name:
            score -= 8
            flags.append(f"⚠ Keyword '{keyword}' in email domain — verify company legitimacy")
            break

    # MX record check
    has_mx = _check_mx_record(domain)
    if not has_mx:
        score -= 25
        flags.append(f"✗ Email domain '{domain}' has no MX record — cannot receive email")
    else:
        flags.append(f"✓ Email domain '{domain}' has valid MX record")

    return max(0, min(100, score)), flags


# ═══════════════════════════════════════════════════════════════════════════════
#  MODULE 3 — Company Name Analysis (20%)
# ═══════════════════════════════════════════════════════════════════════════════

# Verified legitimate company names (seed list — expand from Firestore in production)
_KNOWN_LEGIT_COMPANIES = {
    "google", "amazon", "microsoft", "apple", "meta", "netflix",
    "stripe", "github", "notion", "figma", "atlassian", "salesforce",
    "adobe", "infosys", "wipro", "tcs", "hcl", "accenture",
    "deloitte", "ibm", "oracle", "sap", "linkedin", "twitter",
    "uber", "grab", "zoho", "freshworks", "byju", "flipkart",
}

# Generic buzzwords stacked into fake company names
_FAKE_NAME_KEYWORDS = [
    "global", "universal", "international", "worldwide", "solutions",
    "partners", "associates", "consultancy", "ventures", "enterprises",
    "group", "network", "hub", "digital", "advanced",
]


def _analyze_company(company: str) -> Tuple[int, list[str]]:
    """Analyse company name for legitimacy signals. Returns (score, flags)."""
    flags = []
    score = 70  # neutral start

    name_lower = company.lower().strip()

    # Known legitimate company → high confidence
    for known in _KNOWN_LEGIT_COMPANIES:
        if known in name_lower:
            score = 95
            flags.append(f"✓ '{company}' matches a known legitimate company registry entry")
            return score, flags

    # Count generic buzzword stacking
    buzzword_count = sum(1 for kw in _FAKE_NAME_KEYWORDS if kw in name_lower)
    if buzzword_count >= 3:
        score -= 30
        flags.append(f"⚠ Company name contains {buzzword_count} generic buzzwords — often used in fake companies")
    elif buzzword_count >= 1:
        score -= 10
        flags.append("⚠ Company name contains generic keywords — verify independently")

    # Very short company names (< 3 chars) are unusual
    if len(company.strip()) < 3:
        score -= 20
        flags.append("⚠ Unusually short company name")

    # Numbers in company name (e.g. "Apex Solutions 2026")
    if re.search(r"\d{4}", company):
        score -= 10
        flags.append("⚠ Year number in company name — unusual for established companies")

    if score >= 70:
        flags.append("✓ Company name does not match known scam patterns")

    return max(0, min(100, score)), flags


# ═══════════════════════════════════════════════════════════════════════════════
#  MODULE 4 — Salary Realism (15%)
# ═══════════════════════════════════════════════════════════════════════════════

# Reasonable hourly and annual salary ranges by role keyword
_ROLE_SALARY_BENCHMARKS = {
    "data entry":    {"min_hr": 8,    "max_hr": 20},
    "typist":        {"min_hr": 8,    "max_hr": 18},
    "virtual":       {"min_hr": 10,   "max_hr": 30},
    "developer":     {"min_hr": 25,   "max_hr": 120},
    "engineer":      {"min_hr": 30,   "max_hr": 150},
    "designer":      {"min_hr": 20,   "max_hr": 80},
    "analyst":       {"min_hr": 20,   "max_hr": 90},
    "manager":       {"min_hr": 30,   "max_hr": 100},
    "intern":        {"min_hr": 10,   "max_hr": 35},
    "assistant":     {"min_hr": 12,   "max_hr": 28},
}


from typing import Optional

def _analyze_salary(salary: Optional[str], title: str) -> Tuple[int, list[str]]:
    """Check if the salary is realistic for the role. Returns (score, flags)."""
    if not salary:
        return 70, ["ℹ No salary information provided — cannot verify"]

    flags = []
    score = 80
    salary_text = salary.lower()

    # Extract the first dollar amount found in the salary string
    amounts = re.findall(r"\$?([\d,]+(?:\.\d+)?)", salary_text.replace(",", ""))
    if not amounts:
        return 70, ["ℹ Could not parse salary value"]

    amount = float(amounts[0])

    # Detect if hourly or annual
    is_hourly  = "hour" in salary_text or "/hr" in salary_text or "per hour" in salary_text
    is_annual  = "year" in salary_text or "annual" in salary_text or "/yr" in salary_text or amount > 5000

    # Unrealistically high hourly rates for low-skill roles
    title_lower = title.lower()
    for role_keyword, benchmarks in _ROLE_SALARY_BENCHMARKS.items():
        if role_keyword in title_lower:
            if is_hourly and amount > benchmarks["max_hr"] * 1.5:
                score -= 40
                flags.append(
                    f"⚠ ${amount}/hr is far above market for '{role_keyword}' roles "
                    f"(typical: ${benchmarks['min_hr']}–${benchmarks['max_hr']}/hr)"
                )
            elif is_hourly and amount > benchmarks["max_hr"]:
                score -= 20
                flags.append(f"⚠ Salary above typical range for '{role_keyword}' roles")
            elif is_hourly:
                score += 5
                flags.append(f"✓ Salary within expected range for '{role_keyword}' roles")
            break

    # Catch-all: very high hourly salary with vague or entry-level title
    if is_hourly and amount > 60 and "senior" not in title_lower and "lead" not in title_lower:
        score -= 20
        flags.append(f"⚠ ${amount}/hr is unusually high for a non-senior role")

    if score >= 75:
        flags.append("✓ Salary information appears realistic")

    return max(0, min(100, score)), flags


# ═══════════════════════════════════════════════════════════════════════════════
#  MODULE 5 — Urgency & Fee Language (10%)
# ═══════════════════════════════════════════════════════════════════════════════

_URGENCY_RED_FLAGS = [
    r"\burgent(ly)?\b",
    r"\bimmediate(ly)? (start|joining|hire|placement)\b",
    r"\blimited (slots|seats|positions) available\b",
    r"\bapply (now|today|immediately|asap)\b",
    r"\bfee\b",
    r"\bdeposit\b",
    r"\bpurchase (laptop|equipment|kit)\b",
    r"\btraining cost\b",
    r"\bno background check\b",
    r"\bno documentation (required|needed)\b",
]


def _analyze_urgency(description: str) -> Tuple[int, list[str]]:
    """Detect urgency, pressure, and fee-related language. Returns (score, flags)."""
    text = description.lower()
    flags = []
    score = 100  # start perfect; deduct per hit

    hit_count = 0
    for pattern in _URGENCY_RED_FLAGS:
        if re.search(pattern, text):
            hit_count += 1

    if hit_count == 0:
        flags.append("✓ No urgency or fee language detected")
    elif hit_count <= 2:
        score -= hit_count * 15
        flags.append(f"⚠ {hit_count} urgency/pressure phrase(s) detected in description")
    else:
        score -= min(hit_count * 20, 80)
        flags.append(f"✗ {hit_count} high-pressure/fee phrases detected — strong scam indicator")

    return max(0, min(100, score)), flags


# ═══════════════════════════════════════════════════════════════════════════════
#  MODULE 6 — Recruiter Contact Quality (10%)
# ═══════════════════════════════════════════════════════════════════════════════

def _analyze_contact_quality(email: str, company: str) -> Tuple[int, list[str]]:
    """
    Check that the recruiter email domain matches or aligns with the company.
    Returns (score, flags).
    """
    flags = []
    score = 80

    if "@" not in email:
        return 0, ["✗ No valid recruiter email provided"]

    domain = email.lower().split("@")[1]
    company_lower = company.lower().replace(" ", "").replace(",", "").replace(".", "")

    # Check if company name appears in email domain
    # e.g. recruiter@stripe.com → company = "Stripe"
    domain_root = domain.split(".")[0]
    if domain_root in company_lower or company_lower[:6] in domain_root:
        score = 95
        flags.append("✓ Recruiter email domain matches company name")
    elif domain in _GENERIC_DOMAINS:
        score = 40
        flags.append("⚠ Recruiter is using a personal email instead of a company domain")
    else:
        score = 70
        flags.append("ℹ Recruiter email domain does not obviously match company — verify independently")

    return max(0, min(100, score)), flags


# ═══════════════════════════════════════════════════════════════════════════════
#  AGGREGATOR — Weighted Trust Score
# ═══════════════════════════════════════════════════════════════════════════════

_WEIGHTS = {
    "nlp":     0.25,
    "email":   0.20,
    "company": 0.20,
    "salary":  0.15,
    "urgency": 0.10,
    "contact": 0.10,
}


def _compute_trust_score(breakdown: ScoreBreakdown) -> int:
    weighted = (
        breakdown.nlp_score     * _WEIGHTS["nlp"]     +
        breakdown.email_score   * _WEIGHTS["email"]   +
        breakdown.company_score * _WEIGHTS["company"] +
        breakdown.salary_score  * _WEIGHTS["salary"]  +
        breakdown.urgency_score * _WEIGHTS["urgency"] +
        breakdown.contact_score * _WEIGHTS["contact"]
    )
    return round(weighted)


def _score_to_risk(score: int) -> Tuple[RiskLevel, AnalysisStatus]:
    if score >= 75:
        return RiskLevel.SAFE, AnalysisStatus.VERIFIED
    elif score >= 40:
        return RiskLevel.CAUTION, AnalysisStatus.CAUTION
    else:
        return RiskLevel.HIGH_RISK, AnalysisStatus.FLAGGED


def _build_recommendations(score: int, flags: list[str]) -> list[str]:
    """Generate actionable recommendations based on the analysis result."""
    recommendations = []

    if score < 40:
        recommendations += [
            "Do NOT pay any upfront fees, deposits, or equipment costs — legitimate employers never ask for this.",
            "Verify the company exists on official business registries (e.g. MCA for India, Companies House for UK).",
            "Search the company name + 'scam' or 'fake' on Google before applying.",
            "Report this posting to the job board where you found it.",
        ]
    elif score < 75:
        recommendations += [
            "Verify the recruiter's identity on the company's official LinkedIn page.",
            "Do not share personal documents (Aadhaar, PAN, Passport) until you have verified the company.",
            "Request an official company email confirmation before proceeding to interviews.",
        ]
    else:
        recommendations += [
            "This posting appears legitimate — proceed with normal application precautions.",
            "Always verify the interviewer's identity at the start of any video interview.",
        ]

    # Add specific flags-based advice
    for flag in flags:
        if "gmail" in flag.lower() or "generic email" in flag.lower():
            recommendations.append("Ask the recruiter to contact you from an official company email address.")
            break

    return recommendations


# ═══════════════════════════════════════════════════════════════════════════════
#  PUBLIC API
# ═══════════════════════════════════════════════════════════════════════════════

def analyze_job(request: JobAnalysisRequest) -> JobAnalysisResponse:
    """
    Main entry point — runs all 6 analysis modules and returns a complete
    JobAnalysisResponse with Trust Score, Risk Level, flags, and recommendations.
    """
    start_ms = time.time()

    # Run all modules
    nlp_score,     nlp_flags     = _analyze_description(request.description)
    email_score,   email_flags   = _analyze_email(request.recruiter_email)
    company_score, company_flags = _analyze_company(request.company)
    salary_score,  salary_flags  = _analyze_salary(request.salary, request.title)
    urgency_score, urgency_flags = _analyze_urgency(request.description)
    contact_score, contact_flags = _analyze_contact_quality(
                                       request.recruiter_email, request.company)

    # Assemble breakdown
    breakdown = ScoreBreakdown(
        email_score=email_score,
        company_score=company_score,
        nlp_score=nlp_score,
        salary_score=salary_score,
        urgency_score=urgency_score,
        contact_score=contact_score,
    )
    # Weighted aggregation
    trust_score = _compute_trust_score(breakdown)

    # -----------------------------
    # HARD SCAM OVERRIDE
    # -----------------------------
    description = request.description.lower()
    email = request.recruiter_email.lower()

    critical_hits = 0

    if "whatsapp" in description:
        critical_hits += 1

    if "telegram" in description:
        critical_hits += 1

    if "fee" in description:
        critical_hits += 1

    if "deposit" in description:
        critical_hits += 1

    if "no interview" in description:
        critical_hits += 1

    if "registration" in description:
        critical_hits += 1

    if "gmail.com" in email:
        critical_hits += 1

    if "yahoo.com" in email:
        critical_hits += 1

    if "outlook.com" in email:
        critical_hits += 1

    # Force High Risk if enough scam signals exist
    if critical_hits >= 3:
        trust_score = min(trust_score, 15)

    risk_level, status = _score_to_risk(trust_score)


    
    
    # Collect all signal flags
    all_flags = (
    email_flags
    + company_flags
    + nlp_flags
    + salary_flags
    + urgency_flags
    + contact_flags
    )

    if critical_hits >= 3:
        all_flags.append("🚨 High-confidence scam detected from multiple critical indicators")
    scam_indicators = [f for f in all_flags if f.startswith("✗") or f.startswith("⚠")]
    recommendations = _build_recommendations(trust_score, all_flags)

    elapsed_ms = round((time.time() - start_ms) * 1000)

    from datetime import datetime
    return JobAnalysisResponse(
        title=request.title,
        company=request.company,
        recruiter_email=request.recruiter_email,
        salary=request.salary,
        location=request.location,
        description=request.description,
        trust_score=trust_score,
        risk_level=risk_level,
        status=status,
        flags=all_flags,
        scam_indicators=scam_indicators,
        recommendations=recommendations,
        breakdown=breakdown,
        processing_time_ms=elapsed_ms,
        date=datetime.utcnow().isoformat(),
    )
