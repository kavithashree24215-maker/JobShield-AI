import { db } from "./firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage.jsx";
import AuthPages from "./components/AuthPages.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import DashboardOverview from "./components/DashboardOverview.jsx";
import AnalyzeJob from "./components/AnalyzeJob.jsx";
import AnalysisResults from "./components/AnalysisResults.jsx";
import AnalysisHistory from "./components/AnalysisHistory.jsx";
import ScamReports from "./components/ScamReports.jsx";
import VerifiedCompanies from "./components/VerifiedCompanies.jsx";
import AdminPanel from "./components/AdminPanel";

import { auth } from "./firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Live data — populated from the backend API once connected.
// Replace `initialHistory` with an API call (e.g. useEffect + fetch on mount)
// when the backend/database layer is wired up.
const initialHistory = [];

const initialScamReports = [
  {
    id: "101",
    companyName: "Apex Data Solutions",
    recruiterEmail: "apexjobs2026@gmail.com",
    description:
      "Sent me an offer letter immediately without a video interview, then asked me to transfer money via CashApp to purchase a home office laptop package which they promised to refund.",
    reportedBy: "Kavitha S.",
    date: "2026-06-21",
  },
  {
    id: "102",
    companyName: "TechVision Global Partner",
    recruiterEmail: "hr@techvision-global.xyz",
    description:
      "Advertised job openings on Telegram. Offered $50/hour for basic slide design. Required me to register with my credit card on a shady training portal before starting.",
    reportedBy: "Mark D.",
    date: "2026-06-19",
  },
];

const initialCompanies = [
  {
    id: "201",
    name: "Stripe, Inc.",
    logo: "💳",
    verified: true,
    website: "stripe.com",
    industry: "Financial Technology",
    employees: "5,000 - 10,000",
    details: "Trusted financial infrastructure platform for the internet.",
  },
  {
    id: "202",
    name: "Google LLC",
    logo: "🔍",
    verified: true,
    website: "google.com",
    industry: "Technology & Internet",
    employees: "100,000+",
    details: "Global technology leader specializing in search engines and AI.",
  },
  {
    id: "203",
    name: "Notion Labs",
    logo: "📝",
    verified: true,
    website: "notion.so",
    industry: "Productivity Software",
    employees: "500 - 1,000",
    details: "Unified workspace for wiki, documentation, and project tracking.",
  },
  {
    id: "204",
    name: "LinkedIn Corp",
    logo: "💼",
    verified: true,
    website: "linkedin.com",
    industry: "Professional Networks",
    employees: "10,000+",
    details: "The world's largest professional networking platform.",
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing"); // landing, login, signup, dashboard, analyze, results, history, reports, companies
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null); // Simple user object { email }

  // Live State Repositories
  const [history, setHistory] = useState(initialHistory);
  const [scamReports, setScamReports] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Selected analysis for results screen
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const isAdmin = user?.role === "Admin";
  console.log("USER =", user);
  console.log("ROLE =", user?.role);
  console.log("IS ADMIN =", isAdmin);

  // Sync class name for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const snap = await getDoc(doc(db, "users", currentUser.uid));

        const role = snap.exists() ? snap.data().role : "seeker";

        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email.split("@")[0],
          role,
        });

        setCurrentPage("dashboard");
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.uid) return;

      console.log("Current User:", user);

      try {
        const q = query(
          collection(db, "analysisHistory"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setHistory(data);
      } catch (error) {
        console.error("Error loading history:", error);
      }
    };

    loadHistory();
  }, [user]);
  useEffect(() => {
    loadScamReports();
    loadCompanies();
  }, []);

  const loadScamReports = async () => {
    try {
      const response = await fetch(
        "https://jobshield-ai-production-20d1.up.railway.app/api/scam-reports",
      );

      const data = await response.json();
      console.log("Scam Reports:", data);

      setScamReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };
  const loadCompanies = async () => {
    try {
      const snapshot = await getDocs(collection(db, "verified_companies"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Verified Companies:", data);

      setCompanies(data);
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  // Authentication Helpers
  const login = (firebaseUser) => {
    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.name,
      role: firebaseUser.role,
    });

    setCurrentPage("dashboard");
  };

  const logout = async () => {
    try {
      await signOut(auth);

      setUser(null);

      setCurrentPage("landing");
    } catch (error) {
      console.error(error);
    }
  };

  // Add new scan analysis to records
  const handleAddNewAnalysis = async (newAnalysis) => {
    try {
      // Save into Firestore
      await addDoc(collection(db, "analysisHistory"), {
        ...newAnalysis,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      });

      // Show immediately in UI
      setHistory((prev) => [newAnalysis, ...prev]);

      setActiveAnalysis(newAnalysis);
      setCurrentPage("results");

      console.log("Analysis saved successfully.");
    } catch (error) {
      console.error("Error saving analysis:", error);
    }
  };

  // Add new scam report to lists
  const handleAddNewScamReport = async () => {
    await loadScamReports();
  };

  // Helper to render current sub-page
  const renderSubPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardOverview
            history={history}
            user={user}
            scamReports={scamReports}
            companies={companies}
            setViewPage={setCurrentPage}
            setActiveAnalysis={(analysis) => {
              setActiveAnalysis(analysis);
              setCurrentPage("results");
            }}
          />
        );
      case "analyze":
        return <AnalyzeJob onAnalysisComplete={handleAddNewAnalysis} />;
      case "results":
        return (
          <AnalysisResults
            analysis={activeAnalysis}
            goToAnalyze={() => setCurrentPage("analyze")}
          />
        );
      case "history":
        return (
          <AnalysisHistory
            history={history}
            setActiveAnalysis={(analysis) => {
              setActiveAnalysis(analysis);
              setCurrentPage("results");
            }}
          />
        );
      case "reports":
        return (
          <ScamReports
            reports={scamReports}
            onSubmitReport={handleAddNewScamReport}
            user={user}
          />
        );
      case "companies":
        return <VerifiedCompanies companies={companies} />;
      default:
        return (
          <DashboardOverview
            history={history}
            user={user}
            scamReports={scamReports}
            companies={companies}
            setViewPage={setCurrentPage}
            setActiveAnalysis={(analysis) => {
              setActiveAnalysis(analysis);
              setCurrentPage("results");
            }}
          />
        );
      case "admin":
        return <AdminPanel loadCompanies={loadCompanies} />;
    }
  };

  // Base routing wrapper
  if (currentPage === "landing") {
    return (
      <LandingPage
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        onGetStarted={() => {
          if (user) {
            setCurrentPage("dashboard");
          } else {
            setCurrentPage("login");
          }
        }}
      />
    );
  }

  if (currentPage === "login" || currentPage === "signup") {
    return (
      <AuthPages
        currentPage={currentPage}
        setPage={setCurrentPage}
        onAuthSuccess={login}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />
    );
  }

  // Dashboard Shell wrapper
  // Dashboard Shell wrapper
  return (
    <DashboardLayout
      user={user}
      isAdmin={isAdmin}
      currentPage={currentPage}
      setPage={setCurrentPage}
      darkMode={darkMode}
      toggleTheme={toggleTheme}
      onLogout={logout}
    >
      {renderSubPage()}
    </DashboardLayout>
  );
}
