import { auth } from "../firebase/firebase";
import axios from "axios";
import React, { useState } from "react";
import {
  Sparkles,
  UploadCloud,
  FileText,
  X,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function AnalyzeJob({ onAnalysisComplete }) {
  // Input fields state
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  // PDF state
  const [pdfFile, setPdfFile] = useState(null);

  // Loading scanning overlay
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  // Scan simulation steps
  const scanningSteps = [
    {
      label: "Checking Company",
      phase:
        "Querying registry databases, corporate footprints, and domain parameters...",
    },
    {
      label: "Verifying Recruiter Email",
      phase:
        "Auditing DNS records, corporate MX extensions, and handler configurations...",
    },
    {
      label: "Detecting Phishing",
      phase:
        "Scanning destination URLs, tracking links, and application forms...",
    },
    {
      label: "Comparing Salary",
      phase:
        "Evaluating salary benchmark deviations against role and regional averages...",
    },
    {
      label: "AI Analysis",
      phase:
        "Running natural language models on description text to spot scam triggers...",
    },
    {
      label: "Generating Trust Score",
      phase:
        "Weighting warning matrices and final safety profile computations...",
    },
  ];

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
      } else {
        alert("Demo validation: Please upload PDF files only.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".pdf")) {
        setPdfFile(file);
      } else {
        alert("Demo validation: Please upload PDF files only.");
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!title || !company) {
      alert("Please enter at least a Job Title and Company Name.");
      return;
    }

    setScanning(true);
    setScanStep(0);

    // Simulate multi-step scanning transition
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < scanningSteps.length) {
        setScanStep(step);
      } else {
        clearInterval(interval);
        analyzeWithAI();
      }
    }, 900);
  };
  const analyzeWithAI = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first.");
        setScanning(false);
        return;
      }

      const idToken = await user.getIdToken();

      const response = await axios.post(
        "https://splendid-rebirth-production-c82d.up.railway.app",
        {
          title,
          company,
          recruiter_email: email,
          salary,
          location,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );

      setScanning(false);

      onAnalysisComplete({
        id: response.data.id,

        title: response.data.title,
        company: response.data.company,
        recruiterEmail: response.data.recruiter_email,

        salary: response.data.salary,
        location: response.data.location,
        description: response.data.description,

        trustScore: response.data.trust_score,
        riskLevel: response.data.risk_level,
        status: response.data.status,

        flags: response.data.flags,
        recommendations: response.data.recommendations,

        breakdown: response.data.breakdown,

        date: response.data.date,
      });
    } catch (error) {
      console.error("Backend Error:", error.response?.data);
      console.error(error);
      setScanning(false);

      alert("Unable to analyze the job.");
    }
  };

  return (
    <div className="relative font-sans text-slate-800 dark:text-slate-100">
      {/* Scan Overlay Loader */}
      {scanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-cyber-card p-8 rounded-3xl text-center border border-slate-200 dark:border-cyber-border shadow-2xl relative overflow-hidden">
            {/* Spinning background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>

            {/* AI scanning icon status */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center mb-6 relative">
              <Loader2 className="w-8 h-8 text-cyber-primary animate-spin" />
            </div>

            <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white uppercase tracking-wider">
              AI Security Audits
            </h3>
            <p className="text-slate-400 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider h-8 flex items-center justify-center">
              {scanningSteps[scanStep]?.phase ||
                "Calculating safety reports..."}
            </p>

            {/* Custom Steps Progress Indicator list */}
            <div className="mt-8 space-y-2 text-left text-xs font-bold max-w-xs mx-auto border-t border-slate-100 dark:border-cyber-border/40 pt-5 select-none">
              {scanningSteps.map((step, index) => {
                const isCompleted = index < scanStep;
                const isCurrent = index === scanStep;

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-305 ${isCompleted ? "bg-green-500/5 border-green-500/20 text-cyber-success" : isCurrent ? "bg-blue-500/5 border-cyber-primary/30 text-cyber-primary" : "bg-transparent border-transparent text-slate-400 dark:text-slate-500"}`}
                  >
                    <span className="tracking-wide">{step.label}</span>
                    <span className="shrink-0 flex items-center justify-center">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-cyber-success fill-current" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 text-cyber-primary animate-spin" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 bg-transparent block" />
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis Form Page */}
      <div className="space-y-6">
        <div className="border-b border-slate-200/50 dark:border-cyber-border/40 pb-5">
          <h1 className="text-2xl font-bold tracking-tight">
            AI Job Integrity Audit
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Paste details below to run email audits, salary checks, link
            redirects, and textual scanners.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="grid lg:grid-cols-3 gap-6">
          {/* Main Input Form Body */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-cyber-border/45 lg:col-span-2 space-y-5 bg-white/40 dark:bg-cyber-card/55 shadow-sm">
            <h2 className="text-xs font-bold pb-3 border-b border-slate-100 dark:border-cyber-border/30 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-wider select-none">
              <FileText className="w-5 h-5 text-cyber-primary" />
              Job Metadata
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Job Title <span className="text-cyber-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Remote Data Entry Operator"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-cyber-primary text-xs font-semibold transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Company Name <span className="text-cyber-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-cyber-primary text-xs font-semibold transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Recruiter Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. recruiter@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-cyber-primary text-xs font-semibold transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Salary Offered
                </label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $45 - $60 / hour, $85,000 / year"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-cyber-primary text-xs font-semibold transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Job Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, San Francisco, CA"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-cyber-primary text-xs font-semibold transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Application Link (URL)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://company.recruitee.com/jobs/1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-cyber-primary text-xs font-semibold transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                Paste Job Description
              </label>
              <textarea
                rows="6"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the full job details here including description, requirements, benefits, and instructions..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-cyber-primary text-xs font-semibold transition-all resize-y shadow-inner"
              ></textarea>
            </div>
          </div>

          {/* Right Side Upload Panels */}
          <div className="space-y-4">
            {/* Drag & Drop File Picker */}
            <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-cyber-border/45 bg-white/40 dark:bg-cyber-card/55 shadow-sm space-y-4">
              <h2 className="text-xs font-bold flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-cyber-border/30 text-slate-900 dark:text-white uppercase tracking-wider select-none">
                <UploadCloud className="w-5 h-5 text-cyber-accent" />
                Upload Job PDF
              </h2>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-200 dark:border-cyber-border/70 hover:border-cyber-primary dark:hover:border-cyber-primary/70 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors relative"
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {pdfFile ? pdfFile.name : "Select or Drop Job PDF"}
                </p>
                <p className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
                  Upload PDF details (Max 5MB)
                </p>
              </div>

              {pdfFile && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-cyber-border/40 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  <span className="truncate max-w-[150px]">{pdfFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setPdfFile(null)}
                    className="p-1 rounded bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/15 hover:bg-cyber-danger hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Safety Info panel */}
            <div className="glass-card p-5 rounded-3xl border border-cyber-danger/25 bg-cyber-danger/5 space-y-2 shadow-sm">
              <h3 className="text-xs font-bold flex items-center gap-1.5 text-cyber-danger uppercase tracking-wider select-none">
                <AlertTriangle className="w-4 h-4" />
                Scam Heuristics Guide
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Watch out for jobs offering abnormally high salaries, recruiters
                using generic emails (Gmail), or requesting up-front deposit
                fees for training or laptop delivery.
              </p>
            </div>

            {/* Run Analysis Action Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-cyber-primary hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all select-none cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white" />
              Begin Integrity Check
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
