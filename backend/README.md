# JobShield AI — FastAPI Backend

AI-powered employment fraud detection backend. Pairs with the React + Vite + Tailwind frontend.

---

## Folder Structure

```
backend/
├── app/
│   ├── __init__.py          # Package marker
│   ├── main.py              # FastAPI app, CORS, lifespan hooks
│   ├── routes.py            # All REST API endpoints
│   ├── auth.py              # Firebase JWT verification + FastAPI dependency
│   ├── analyzer.py          # AI Risk Analysis Engine (6 signal modules)
│   ├── firebase_admin.py    # Firebase Admin SDK initialization + Firestore client
│   ├── database.py          # All Firestore read/write operations
│   ├── schemas.py           # Pydantic v2 request/response models
│   └── utils.py             # Shared utility functions
├── requirements.txt
├── Dockerfile
├── .env.example
└── .gitignore
FRONTEND_INTEGRATION.js      # Axios integration guide for your React project
README.md
```

---

## Quick Start (Local Development)

```bash
# 1. Clone / unzip the backend folder
cd backend

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env — add your Firebase service account JSON

# 5. Start the development server
uvicorn app.main:app --reload --port 8000
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. **Project Settings → Service Accounts → Generate New Private Key**
3. Download `serviceAccountKey.json`
4. Either:
   - Set `FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json` in `.env` (local), OR
   - Paste the entire JSON as `FIREBASE_SERVICE_ACCOUNT_JSON` (for Railway/Render)

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/verify` | No | Verify Firebase ID token |
| `POST` | `/api/analyze` | ✅ | Run AI job analysis + save to Firestore |
| `GET` | `/api/history` | ✅ | Get paginated scan history |
| `GET` | `/api/history/{scan_id}` | ✅ | Get single scan by ID |
| `DELETE` | `/api/history/{scan_id}` | ✅ | Delete a scan |
| `GET` | `/api/dashboard/stats` | ✅ | Dashboard aggregate statistics |
| `GET` | `/api/report` | ✅ | Generate full summary report |
| `GET` | `/health` | No | Health check |
| `GET` | `/docs` | No | Swagger UI |

---

## Trust Score Formula

| Signal | Weight | Method |
|--------|--------|--------|
| NLP Description Analysis | 25% | Rule-based scam/legit phrase matching |
| Email Domain Validity | 20% | MX record + TLD + domain pattern checks |
| Company Name Legitimacy | 20% | Registry matching + buzzword stacking |
| Salary Realism | 15% | Role-based salary benchmark comparison |
| Urgency / Fee Language | 10% | Regex patterns for pressure tactics |
| Recruiter Contact Quality | 10% | Domain-company name alignment check |

**Risk Bands:** Safe ≥ 75 · Caution 40–74 · High Risk < 40

---

## Connecting to the React Frontend

See **`FRONTEND_INTEGRATION.js`** in the root of this zip for:
- `src/api/axiosClient.js` — Axios instance with auto-auth headers
- `src/api/jobshieldApi.js` — All API call functions
- Component-level integration snippets for `AnalyzeJob.jsx`, `DashboardOverview.jsx`, and `App.jsx`
- `.env.local` variable to add to your React project

---

## Deploying to Railway

1. Push `backend/` to a GitHub repository
2. Create a new project on [railway.app](https://railway.app)
3. Connect the GitHub repo — Railway detects the `Dockerfile` automatically
4. Add environment variables in Railway dashboard → Variables:
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
   - `ALLOWED_ORIGINS`
5. Railway provides an HTTPS URL — set this as `VITE_API_BASE_URL` in your React Vercel deployment

---

## Production Checklist

- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` set in Railway environment
- [ ] `ALLOWED_ORIGINS` includes your Vercel frontend URL
- [ ] Firestore security rules deployed (see project report)
- [ ] `serviceAccountKey.json` is in `.gitignore` and never committed
- [ ] `ENVIRONMENT=production` set in Railway
