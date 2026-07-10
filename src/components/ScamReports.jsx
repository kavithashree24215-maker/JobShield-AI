import toast from "react-hot-toast";
import React, { useState } from "react";
import {
  AlertTriangle,
  Plus,
  Search,
  Send,
  User,
  Calendar,
  Upload,
  X,
  Clock3,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

export default function ScamReports({ reports, onSubmitReport, user }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceName, setEvidenceName] = useState("");

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName || !description) {
      alert("Please fill out the Company Name and Scam Description.");
      return;
    }
    const email = user?.email || "anonymous@gmail.com";

    const maskedEmail =
      email.split("@")[0].substring(0, 3) + "***@" + email.split("@")[1];

    const newReport = {
      id: Date.now().toString(),
      companyName,
      recruiterEmail: recruiterEmail || "Not Provided",
      description,
      reportedBy: maskedEmail,
      status: "Under Review",
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await fetch(
        "https://splendid-rebirth-production-c82d.up.railway.app/apiscam-reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newReport),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Update UI
        await onSubmitReport(newReport);

        // Reset form
        setCompanyName("");
        setRecruiterEmail("");
        setDescription("");

        setEvidenceName("");
        setShowForm(false);

        toast.success("Your report is now under review.", {
          duration: 3500,
          position: "top-center",
        });
      } else {
        alert("Failed to save report.");
      }
    } catch (error) {
      console.error(error);
      alert("Backend connection failed.");
    }
  };
  const handleFileMock = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceName(e.target.files[0].name);
    }
  };

  // Filter list
  const filteredReports = (Array.isArray(reports) ? reports : []).filter(
    (rep) =>
      rep.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.recruiterEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (dateString) => {
    const reportDate = new Date(dateString);
    const today = new Date();

    const diffTime = today - reportDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Sub-Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Community Scam Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Public warning system seeded by candidates sharing verified
            fraudulent schemes.
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Total Reports:{" "}
            <span className="font-bold text-rose-500">
              {filteredReports.length}
            </span>
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all select-none cursor-pointer"
        >
          {showForm ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          {showForm ? "Close Report Form" : "Submit Scam Report"}
        </button>
      </div>

      {/* Submission Form Modal / Panel */}
      {showForm && (
        <div className="glass-card p-6 rounded-3xl border border-rose-200/50 dark:border-rose-950/20 bg-rose-500/5 animate-in slide-in-from-top-4 duration-200 space-y-4">
          <div className="pb-3 border-b border-slate-200/40 dark:border-slate-800/40 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h2 className="text-sm font-bold">New Scam Submission</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Company / Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Data Solution Group"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Recruiter Contact Email
                </label>
                <input
                  type="text"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  placeholder="recruiter.jobs@apex-data.cc"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs transition-all"
                />
              </div>

              {/* Evidence Upload */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Attach Evidence Screenshot (Optional)
                </label>
                <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center bg-white dark:bg-slate-900 hover:border-rose-500/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileMock}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-500">
                    {evidenceName
                      ? evidenceName
                      : "Choose screenshot / email PDF"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Scam Tactics Description{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="5"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the scam. Mention if they asked for training fees, deposit purchases, telegram communication, or immediate background links..."
                  className="w-full h-[calc(100%-18px)] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wide shadow-md shadow-rose-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Warn Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Header */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Filter scams by company, contact email, keyword..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition-all"
        />
      </div>

      {/* Reports Feed List */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filteredReports.length === 0 ? (
          <div className="col-span-2 glass-card p-12 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 text-center flex flex-col items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No Matches Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Your search term did not return any flagged companies in our
              current database.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="glass-card p-5 rounded-3xl border border-rose-100 dark:border-rose-950/20 hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle top indicator border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500/40"></div>

              <div className="space-y-3.5">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                      {report.companyName}
                    </h3>
                    <div className="mt-2">
                      {report.status === "Under Review" && (
                        <span className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/30">
                          <Clock3 size={14} />
                          Under Review
                        </span>
                      )}

                      {report.status === "Verified Scam" && (
                        <span className="inline-flex items-center gap-2 bg-red-500/15 text-red-400 px-3 py-1 rounded-full text-xs font-semibold border border-red-500/30">
                          <ShieldAlert size={14} />
                          Verified Scam
                        </span>
                      )}

                      {report.status === "Resolved" && (
                        <span className="inline-flex items-center gap-2 bg-green-500/15 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/30">
                          <CheckCircle2 size={14} />
                          Resolved
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Flagged
                      Contact: {report.recruiterEmail}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-2xl border border-slate-100/40 dark:border-slate-800/30">
                  "{report.description}"
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-4 text-[9px] font-bold text-slate-400">
                <span className="flex items-center gap-1 uppercase">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  By {report.reportedBy}
                </span>
                <span className="flex items-center gap-1 uppercase">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(report.date)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
