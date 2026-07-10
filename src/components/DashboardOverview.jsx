import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  BarChart2,
  ShieldX,
  Info,
  RefreshCw,
  TrendingUp,
  FileText,
  Lightbulb,
  X,
} from "lucide-react";

export default function DashboardOverview({
  history,
  user,
  scamReports,
  companies,
  setViewPage,
  setActiveAnalysis,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [typedName, setTypedName] = useState("");

  const displayName = user?.name || user?.email?.split("@")[0] || "there";

  // Dynamic greeting
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning ☀️"
      : hour < 18
        ? "Good Afternoon 🌤️"
        : "Good Evening 🌙";
  // Typewriter effect for the personalized welcome greeting
  useEffect(() => {
    setTypedName("");
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTypedName(displayName.slice(0, i));
      if (i >= displayName.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, [displayName]);

  // Live statistics computed from real history state (populated via backend once connected)
  const totalAnalyzed = history.length;
  const scamDetected = history.filter((item) => item.trustScore < 40).length;
  const verifiedJobs = history.filter((item) => item.trustScore >= 75).length;
  const cautionJobs = history.filter(
    (item) => item.trustScore >= 40 && item.trustScore < 75,
  ).length;

  const showEmptyState = totalAnalyzed === 0;
  // Generate monthly data from Firebase history
  const monthlyData = history.reduce((acc, item) => {
    if (!item.createdAt) return acc;

    let date;

    // Firestore Timestamp
    if (item.createdAt.seconds) {
      date = new Date(item.createdAt.seconds * 1000);
    } else {
      date = new Date(item.createdAt);
    }

    const month = date.toLocaleString("default", {
      month: "short",
    });

    acc[month] = (acc[month] || 0) + 1;

    return acc;
  }, {});
  const getScoreColor = (score) => {
    if (score >= 75)
      return "text-cyber-success bg-cyber-success/10 border-cyber-success/20";
    if (score >= 40)
      return "text-cyber-warning bg-cyber-warning/10 border-cyber-warning/20";
    return "text-cyber-danger bg-cyber-danger/10 border-cyber-danger/20";
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // TODO: once the backend is connected, re-fetch `history` from the API here.
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleGenerateReport = () => {
    window.print();
  };
  const displayList = history.slice(0, 5);

  return (
    <div className="space-y-6 relative font-sans">
      {/* Dashboard Sub-Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-cyber-border/40 pb-5">
        <div className="animate-in fade-in slide-in-from-left duration-300">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-1.5">
            {greeting},{" "}
            <span className="bg-gradient-to-r from-cyber-primary to-cyber-accent bg-clip-text text-transparent capitalize">
              {typedName}
            </span>
            <span className="inline-block w-[2px] h-5 bg-cyber-primary animate-pulse"></span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Real-time analytics and job safety profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 select-none">
          {/* Refresh Dashboard */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-cyber-border text-xs font-bold bg-white dark:bg-cyber-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Toggles empty/populated state calculations"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          {/* AI Insights */}
          <button
            onClick={() => setShowInsightsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-cyber-border text-xs font-bold bg-white dark:bg-cyber-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-cyber-accent" />
            AI Insights
          </button>

          {/* Generate Report */}
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-cyber-border text-xs font-bold bg-white dark:bg-cyber-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-cyber-primary" />
            Report
          </button>

          <button
            onClick={() => setViewPage("analyze")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyber-primary hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 transition-all cursor-pointer ml-1 animate-cta-glow"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Analyze Job
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Jobs Analyzed",
            value: totalAnalyzed,
            desc: "Total descriptions scanned",
            icon: <BarChart2 className="w-5 h-5 text-cyber-primary" />,
            borderColor: "border-slate-200 dark:border-cyber-border/60",
          },
          {
            label: "Scam Jobs Flagged",
            value: scamDetected,
            desc: "High risk listings flagged",
            icon: <ShieldX className="w-5 h-5 text-cyber-danger" />,
            borderColor: "border-slate-200 dark:border-cyber-border/60",
          },
          {
            label: "Verified Jobs",
            value: verifiedJobs,
            desc: "Safe & credentialed entries",
            icon: <CheckCircle2 className="w-5 h-5 text-cyber-success" />,
            borderColor: "border-slate-200 dark:border-cyber-border/60",
          },
          {
            label: "Caution Alerts",
            value: cautionJobs,
            desc: "Medium risk warning reviews",
            icon: <AlertTriangle className="w-5 h-5 text-cyber-warning" />,
            borderColor: "border-slate-200 dark:border-cyber-border/60",
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`glass-card p-5 rounded-2xl border ${card.borderColor} shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-all duration-200 bg-white/40 dark:bg-cyber-card/50`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-snug uppercase tracking-wider">
                {card.label}
              </span>
              <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/40 dark:border-cyber-border/50 shrink-0 flex items-center justify-center">
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight leading-none mb-1 text-slate-900 dark:text-white">
                {card.value}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Monthly Trend Area Chart (SVG) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-cyber-border/50 col-span-2 bg-white/40 dark:bg-cyber-card/55">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-cyber-border/30 pb-3">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5 text-slate-900 dark:text-white uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-cyber-primary" />
                Analysis Trend
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                Monthly job verification activity volume
              </p>
            </div>
            <div className="flex gap-3 select-none">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-cyber-primary"></span>{" "}
                Verified
              </span>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-cyber-danger"></span>{" "}
                Flagged
              </span>
            </div>
          </div>

          {showEmptyState ? (
            <div className="h-44 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-cyber-border/50 rounded-2xl text-center p-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                No analytics trend data available
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                Submit a job analysis to populate charts
              </p>
            </div>
          ) : (
            <div className="h-44 w-full relative">
              {/* SVG Area Chart */}
              <svg
                className="w-full h-full"
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line
                  x1="0"
                  y1="30"
                  x2="500"
                  y2="30"
                  stroke="#cbd5e1"
                  strokeWidth="0.5"
                  className="dark:stroke-cyber-border/30"
                  strokeDasharray="3"
                />
                <line
                  x1="0"
                  y1="80"
                  x2="500"
                  y2="80"
                  stroke="#cbd5e1"
                  strokeWidth="0.5"
                  className="dark:stroke-cyber-border/30"
                  strokeDasharray="3"
                />
                <line
                  x1="0"
                  y1="130"
                  x2="500"
                  y2="130"
                  stroke="#cbd5e1"
                  strokeWidth="0.5"
                  className="dark:stroke-cyber-border/30"
                  strokeDasharray="3"
                />

                {/* Safe Job Area path */}
                <path
                  d="M 0 130 Q 80 70 160 110 T 320 60 T 480 30 L 500 30 L 500 150 L 0 150 Z"
                  fill="url(#blueGrad)"
                />
                <path
                  d="M 0 130 Q 80 70 160 110 T 320 60 T 480 30"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />

                {/* Scam Job Area path */}
                <path
                  d="M 0 145 Q 80 120 160 135 T 320 120 T 480 100 L 500 100 L 500 150 L 0 150 Z"
                  fill="url(#roseGrad)"
                />
                <path
                  d="M 0 145 Q 80 120 160 135 T 320 120 T 480 100"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="2"
                />
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-2.5">
                {Object.keys(monthlyData).length === 0
                  ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month) => (
                      <span key={month}>{month}</span>
                    ))
                  : Object.keys(monthlyData).map((month) => (
                      <span key={month}>{month}</span>
                    ))}
              </div>
            </div>
          )}
        </div>
        {/* closes Monthly Trend Card */}

        {/* Risk Distribution Pie Chart (SVG) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-cyber-border/50 bg-white/40 dark:bg-cyber-card/55 flex flex-col justify-between hover:scale-[1.005] transition-transform">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">
              Risk Distribution
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
              Threat vectors analysis breakdown
            </p>
          </div>

          {showEmptyState ? (
            <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-cyber-border/50 rounded-2xl text-center p-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                No distribution data
              </p>
            </div>
          ) : (
            (() => {
              const safePct = Math.round((verifiedJobs / totalAnalyzed) * 100);
              const cautionPct = Math.round(
                (cautionJobs / totalAnalyzed) * 100,
              );
              const highRiskPct = 100 - safePct - cautionPct;
              return (
                <div className="flex items-center gap-4 my-4">
                  <div className="w-24 h-24 shrink-0 relative flex items-center justify-center">
                    {/* SVG Donut Chart */}
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      {/* Outer base track */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="3"
                        className="dark:stroke-cyber-border/30"
                      />

                      {/* Segment 1: Safe (Green) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="3"
                        strokeDasharray={`${safePct} ${100 - safePct}`}
                        strokeDashoffset="0"
                      />

                      {/* Segment 2: Medium (Yellow) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeDasharray={`${cautionPct} ${100 - cautionPct}`}
                        strokeDashoffset={-safePct}
                      />

                      {/* Segment 3: High Risk (Red) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                        strokeDasharray={`${highRiskPct} ${100 - highRiskPct}`}
                        strokeDashoffset={-(safePct + cautionPct)}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-base font-black leading-none text-slate-900 dark:text-white">
                        {safePct}%
                      </span>
                      <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                        Safe
                      </span>
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="space-y-2 select-none">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                      <span className="w-2.5 h-2.5 rounded-md bg-cyber-success inline-block shrink-0"></span>
                      <span>Safe ({safePct}%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                      <span className="w-2.5 h-2.5 rounded-md bg-cyber-warning inline-block shrink-0"></span>
                      <span>Caution ({cautionPct}%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                      <span className="w-2.5 h-2.5 rounded-md bg-cyber-danger inline-block shrink-0"></span>
                      <span>Scam ({highRiskPct}%)</span>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-t border-slate-100 dark:border-cyber-border/30 pt-3">
            Source registries aggregated from safety networks.
          </p>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-cyber-border/50 overflow-hidden bg-white/40 dark:bg-cyber-card/55">
        <div className="p-6 border-b border-slate-200/60 dark:border-cyber-border/40 flex justify-between items-center bg-white/50 dark:bg-slate-900/20">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Verification Activities
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
              Immediate log of your latest job audits
            </p>
          </div>
          <button
            onClick={() => setViewPage("history")}
            className="text-xs text-cyber-primary hover:text-blue-600 font-bold flex items-center gap-0.5 select-none cursor-pointer uppercase tracking-wider"
          >
            View History
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {displayList.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-white/30 dark:bg-transparent">
            <Shield className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              No Job Scans Logged
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5 font-medium leading-relaxed">
              Start testing job descriptions or company email domains by
              clicking "Analyze Job".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/40 dark:bg-slate-900/10 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/60 dark:border-cyber-border/40 select-none">
                  <th className="p-5">Job Title</th>
                  <th className="p-5">Company</th>
                  <th className="p-5 text-center">Trust Score</th>
                  <th className="p-5">Risk Level</th>
                  <th className="p-5">Audit Date</th>
                  <th className="p-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-cyber-border/30 font-medium">
                {displayList.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    className="animate-row-reveal hover:bg-slate-100/40 dark:hover:bg-slate-900/35 transition-colors"
                  >
                    <td className="p-5 font-semibold max-w-[200px] truncate text-slate-800 dark:text-slate-200">
                      {item.title}
                    </td>
                    <td className="p-5 text-slate-500 dark:text-slate-400 font-bold">
                      {item.company}
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full border text-[10px] font-black ${getScoreColor(item.trustScore)}`}
                      >
                        {item.trustScore}/100
                      </span>
                    </td>
                    <td className="p-5">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider ${item.riskLevel === "Safe" ? "text-cyber-success" : item.riskLevel === "Medium Risk" ? "text-cyber-warning" : "text-cyber-danger"}`}
                      >
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="p-5 text-slate-400 font-semibold">
                      {item.date}
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => setActiveAnalysis(item)}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-cyber-border hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Insights Modal */}
      {showInsightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-cyber-border dark:bg-cyber-card animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-cyber-border/40">
              <h3 className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                <Sparkles className="h-5 w-5 animate-pulse text-cyber-accent" />
                Employment Fraud Insights
              </h3>

              <button
                type="button"
                onClick={() => setShowInsightsModal(false)}
                className="rounded-lg border border-slate-200 p-1 text-slate-400 transition hover:text-slate-600 dark:border-cyber-border dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="flex gap-3 rounded-2xl border border-cyber-warning/20 bg-amber-500/5 p-3.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-cyber-warning" />
                <div>
                  <strong className="mb-1 block text-slate-800 dark:text-slate-200">
                    Recruiter Domain Impersonation
                  </strong>
                  Over 75% of fraudulent job applications verified during the
                  last 30 days used spoofed company email addresses or free
                  public domains like Gmail, Yahoo and Proton Mail.
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-cyber-primary/20 bg-blue-500/5 p-3.5">
                <Info className="h-5 w-5 shrink-0 text-cyber-primary" />
                <div>
                  <strong className="mb-1 block text-slate-800 dark:text-slate-200">
                    Upfront Deposit Requests
                  </strong>
                  Genuine companies never ask candidates to pay for
                  registration, laptops, training materials, interview slots or
                  software before joining.
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-cyber-accent/20 bg-violet-500/5 p-3.5">
                <Lightbulb className="h-5 w-5 shrink-0 text-cyber-accent" />
                <div>
                  <strong className="mb-1 block text-slate-800 dark:text-slate-200">
                    Salary Benchmark Indicators
                  </strong>
                  Be cautious of entry-level jobs offering unusually high
                  salaries without interviews, assessments or technical
                  evaluations.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-cyber-border/40">
              <button
                type="button"
                onClick={() => setShowInsightsModal(false)}
                className="rounded-xl bg-cyber-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-600"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
