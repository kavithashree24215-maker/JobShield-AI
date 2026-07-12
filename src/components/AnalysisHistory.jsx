import React, { useState } from "react";
import {
  Search,
  History,
  Eye,
  ArrowUpDown,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function AnalysisHistory({ history, setActiveAnalysis }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, safe, caution, high

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // Filter list based on criteria
  const filteredHistory = history.filter((item) => {
    // Search filter
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recruiterEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Type filter
    if (filterType === "safe") return item.trustScore >= 75;
    if (filterType === "caution")
      return item.trustScore >= 40 && item.trustScore < 75;
    if (filterType === "high") return item.trustScore < 40;

    return true;
  });

  const getScoreStyle = (score) => {
    if (score >= 75)
      return "text-cyber-success bg-cyber-success/10 border-cyber-success/20";
    if (score >= 40)
      return "text-cyber-warning bg-cyber-warning/10 border-cyber-warning/20";
    return "text-cyber-danger bg-cyber-danger/10 border-cyber-danger/20";
  };
  console.log("Date:", history[0]?.date);
  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      {/* Sub-Header */}
      <div className="border-b border-slate-200/50 dark:border-cyber-border/40 pb-5">
        <h1 className="text-2xl font-bold tracking-tight">Analysis Archive</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Database directory storing your historical job verification metrics.
        </p>
      </div>

      {/* Filters and Search Bar Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by job title, recruiter, or company name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-cyber-primary text-xs font-semibold transition-all shadow-inner"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 select-none">
          {[
            { id: "all", label: "All Audits" },
            { id: "safe", label: "Safe (>=75)" },
            { id: "caution", label: "Caution (40-74)" },
            { id: "high", label: "High Risk (<40)" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${filterType === btn.id ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-md shadow-slate-900/10" : "bg-white dark:bg-cyber-card border-slate-200 dark:border-cyber-border text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main History Table Container */}
      <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-cyber-border/50 overflow-hidden shadow-sm bg-white/40 dark:bg-cyber-card/55">
        {filteredHistory.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              No Audits Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed font-semibold">
              Your query returned empty records. Clear the filter parameters or
              perform a new scan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/60 dark:border-cyber-border/40 select-none">
                  <th className="p-5">Job Opportunity</th>
                  <th className="p-5">Company Name</th>
                  <th className="p-5">Recruiter Handle</th>
                  <th className="p-5 text-center">Trust Rating</th>
                  <th className="p-5">Risk State</th>
                  <th className="p-5">Audit Date</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-cyber-border/30 font-medium">
                {filteredHistory.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    className="animate-row-reveal hover:bg-slate-100/40 dark:hover:bg-cyber-card/85 transition-colors"
                  >
                    <td className="p-5 font-bold max-w-[200px] truncate text-slate-800 dark:text-slate-200">
                      {item.title}
                    </td>
                    <td className="p-5 text-slate-500 dark:text-slate-400 font-bold">
                      {item.company}
                    </td>
                    <td className="p-5 text-slate-400 truncate max-w-[150px] font-mono">
                      {item.recruiterEmail}
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full border text-[10px] font-black ${getScoreStyle(item.trustScore)}`}
                      >
                        {item.trustScore}/100
                      </span>
                    </td>
                    <td className="p-5 select-none">
                      {item.trustScore >= 75 ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-cyber-success font-black uppercase tracking-wider">
                          <CheckCircle className="w-3.5 h-3.5 fill-current" />
                          Safe
                        </span>
                      ) : item.trustScore >= 40 ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-cyber-warning font-black uppercase tracking-wider">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Caution
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-cyber-danger font-black uppercase tracking-wider">
                          <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                          High Risk
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      {item.createdAt?.toDate
                        ? item.createdAt.toDate().toLocaleDateString()
                        : item.createdAt || "-"}
                    </td>

                    <td className="p-5 text-right">
                      <button
                        onClick={() => setActiveAnalysis(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-cyber-border hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
