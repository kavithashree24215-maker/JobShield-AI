import React, { useState } from "react";
import {
  Shield,
  Sparkles,
  AlertTriangle,
  Building,
  Search,
  DollarSign,
  ArrowRight,
  Sun,
  Moon,
  Play,
  ChevronRight,
  ChevronLeft,
  X,
  Lock,
  Mail,
  Link as LinkIcon,
} from "lucide-react";

export default function LandingPage({ darkMode, toggleTheme, onGetStarted }) {
  const [showDemo, setShowDemo] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    {
      title: "Paste Job Details",
      desc: "Input the job title, company name, recruiter email, description, and link directly into our scanning interface.",
      icon: <Search className="w-8 h-8 text-blue-500" />,
      detail:
        "Supports plain text copy-paste or dragging and dropping exported job post PDF files.",
    },
    {
      title: "Company Verification",
      desc: "Our engine checks official registers, headquarters locations, website registration age, and employee counts.",
      icon: <Building className="w-8 h-8 text-emerald-500" />,
      detail:
        "Cross-references with our Verified Corporate Database to verify brand legitimacy.",
    },
    {
      title: "Recruiter Email Verification",
      desc: "Validates recruiter MX domain configurations and routing integrity in real-time.",
      icon: <Mail className="w-8 h-8 text-amber-500" />,
      detail:
        "Instantly alerts you if a recruiter is using a spoofed domain or a public handle (like @gmail.com).",
    },
    {
      title: "Salary Analysis",
      desc: "Compares the advertised salary range against live regional benchmarks and job role standards.",
      icon: <DollarSign className="w-8 h-8 text-violet-500" />,
      detail:
        "Identifies compensation anomalies that are (>65%) higher than standard averages to flag honey-pot postings.",
    },
    {
      title: "Phishing Detection",
      desc: "Performs safety checks on all URLs embedded within the job posting content.",
      icon: <LinkIcon className="w-8 h-8 text-rose-500" />,
      detail:
        "Checks for dangerous redirections, tracking scripts, and spoofed company application forms.",
    },
    {
      title: "Trust Score Calculation",
      desc: "Synthesizes dozens of parameters into a unified, readable security score from 0 to 100.",
      icon: <Sparkles className="w-8 h-8 text-indigo-500" />,
      detail:
        "Weights domain trust, email authenticity, and scam phrasing triggers to compute the risk rating.",
    },
    {
      title: "AI Recommendation",
      desc: "Provides a clear decision directive: Proceed Safely, Proceed with Caution, or Avoid This Job.",
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      detail:
        "Gives you clear bullet-point breakdowns of all warning signs so you can make informed applications.",
    },
  ];

  const nextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep((prev) => prev + 1);
    }
  };

  const prevTourStep = () => {
    if (tourStep > 0) {
      setTourStep((prev) => prev - 1);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-cyber-bg text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* Hero Backdrop: deep navy → indigo/violet gradient with radial glow, matching brand reference */}
      <div className="absolute inset-x-0 top-0 h-[760px] dark:bg-gradient-to-b dark:from-[#070a16] dark:via-[#161330] dark:to-cyber-bg pointer-events-none z-0">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-indigo-600/25 dark:bg-indigo-600/20 blur-[140px]"></div>
      </div>

      {/* Decorative Premium Blur Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 dark:bg-blue-600/15 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 dark:bg-violet-600/20 blur-[120px] pointer-events-none z-0"></div>

      {/* Header / Navbar */}
      <header className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 h-20 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 backdrop-blur-md">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <div className="p-2.5 rounded-xl bg-cyber-primary text-white shadow-md shadow-blue-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            JobShield AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all duration-200"
            aria-label="Toggle Light/Dark Theme"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <button
            onClick={onGetStarted}
            className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs tracking-wide transition-all duration-200"
          >
            Sign In
          </button>

          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-xl bg-cyber-primary hover:bg-blue-600 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all duration-200"
          >
            Analyze Job Now
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
        <div className="mx-auto max-w-4xl">
          {/* Badge indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-white/5 border border-blue-200/50 dark:border-white/10 text-cyber-primary dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider mb-8 animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5 text-cyber-primary dark:text-indigo-400" />
            AI Job Fraud Detection System
          </div>
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-8">
            <span className="text-slate-900 dark:text-slate-200">
              AI-Powered
            </span>{" "}
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              Employment Fraud Detection
            </span>
          </h1>
          {/* Subheading */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
            Analyze job postings in seconds using AI-powered scam detection,
            recruiter verification, salary intelligence, and fraud risk
            analysis.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-cyber-primary hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              Analyze Job Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setTourStep(0);
                setShowDemo(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-slate-200 dark:border-cyber-border hover:bg-slate-100 dark:hover:bg-cyber-card/60 bg-white/40 dark:bg-cyber-card/25 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-cyber-accent" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Demo Statistics Cards */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pb-20">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            AI PLATFORM CAPABILITIES
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            {
              label: "AI Detection Accuracy",
              value: "95%+",
              color: "text-cyber-primary",
              accent: "bg-blue-500",
            },
            {
              label: "Risk Signals Checked",
              value: "25+",
              color: "text-cyber-danger",
              accent: "bg-red-500",
            },
            {
              label: "Scam Patterns Covered",
              value: "100+",
              color: "text-cyber-success",
              accent: "bg-green-500",
            },
            {
              label: "Average Analysis Time",
              value: "<5s",
              color: "text-cyber-accent",
              accent: "bg-violet-500",
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 90}ms` }}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden bg-white dark:bg-cyber-card/70 p-6 rounded-2xl text-center shadow-sm hover:shadow-lg border border-slate-200 dark:border-cyber-border/40 hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200"
            >
              <span
                className={`absolute top-0 left-0 right-0 h-1 ${stat.accent}`}
              ></span>
              <p
                className={`text-3xl sm:text-4xl font-extrabold ${stat.color} mb-1.5`}
              >
                {stat.value}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-24 border-t border-slate-200/50 dark:border-cyber-border/40">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Advanced Verification Modules
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium">
            JobShield AI automatically decomposes posting assets and validates
            integrity parameters against safety metrics.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: <Shield className="w-6 h-6 text-cyber-primary" />,
              title: "AI Scam Detection",
              desc: "Uses natural language processing models to spot suspicious requirements, deposit queries, and phrasing anomalies.",
            },
            {
              icon: <AlertTriangle className="w-6 h-6 text-cyber-warning" />,
              title: "Recruiter Email Verification",
              desc: "Validates recruiter domains against corporate MX configurations to flag generic address domains or spoofed handles.",
            },
            {
              icon: <Building className="w-6 h-6 text-cyber-success" />,
              title: "Company Verification",
              desc: "Cross-checks company registry credentials, corporate websites, and active social media footprints.",
            },
            {
              icon: <DollarSign className="w-6 h-6 text-cyber-accent" />,
              title: "Salary Analysis",
              desc: "Evaluates the compensation range relative to standard regional benchmarks to point out unrealistic claims.",
            },
            {
              icon: <Search className="w-6 h-6 text-cyber-danger" />,
              title: "Link Safety Check",
              desc: "Resolves destination targets of links inside descriptions to block redirection pathways or phishing forms.",
            },
            {
              icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
              title: "Community Scam Reports",
              desc: "A user-reported warning platform where active jobseekers share scam job descriptions, emails, and evidence.",
            },
          ].map((feat, i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 70}ms` }}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-cyber-card/60 border border-slate-200 dark:border-cyber-border/40 p-6 rounded-2xl flex gap-4 shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-cyber-border hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-cyber-card/80 border border-slate-200/50 dark:border-cyber-border/40 h-fit flex items-center justify-center shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-base mb-2">{feat.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-24 border-t border-slate-200/50 dark:border-cyber-border/40 bg-slate-100/20 dark:bg-cyber-card/10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            How JobShield AI Works
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Our automated sequence verifies listings within seconds.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Paste Job Details",
              desc: "Input the title, description, company name, recruiter email, and URL.",
            },
            {
              step: "02",
              title: "AI Analyzes Risk",
              desc: "Our engine processes text heuristics, email records, and link networks.",
            },
            {
              step: "03",
              title: "Receive Trust Score",
              desc: "Inspect a comprehensive trust rating with targeted safety alerts.",
            },
            {
              step: "04",
              title: "Apply Safely",
              desc: "Proceed with applications or share findings to shield other applicants.",
            },
          ].map((flow, i) => (
            <div
              key={i}
              className="relative p-6 rounded-2xl border border-dashed border-slate-200 dark:border-cyber-border/60 text-center bg-white/30 dark:bg-cyber-card/5 hover:border-slate-300 dark:hover:border-cyber-border transition-all duration-300"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-cyber-primary text-white font-extrabold text-sm flex items-center justify-center mb-5 shadow-md shadow-blue-500/20">
                {flow.step}
              </div>
              <h3 className="font-extrabold text-sm mb-2">{flow.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                {flow.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/50 dark:border-cyber-border/40 py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/20 dark:bg-cyber-bg/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyber-primary text-white">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-slate-100">
              JobShield AI
            </span>
          </div>
          <p className="font-medium">
            © {new Date().getFullYear()} JobShield AI. All rights reserved
          </p>
        </div>
      </footer>

      {/* Watch Demo - Step-by-Step Product Tour Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-250">
          <div className="relative w-full max-w-xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-250 flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-cyber-border/70 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyber-danger"></span>
                <span className="w-3 h-3 rounded-full bg-cyber-warning"></span>
                <span className="w-3 h-3 rounded-full bg-cyber-success"></span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold ml-2 tracking-wide uppercase">
                  JobShield Platform Tour
                </span>
              </div>
              <button
                onClick={() => setShowDemo(false)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-cyber-border text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 flex-1 flex flex-col items-center text-center bg-white dark:bg-cyber-card relative">
              {/* Steps Progress Header */}
              <div className="w-full flex items-center justify-between mb-8 select-none">
                <span className="text-[10px] font-bold text-cyber-primary uppercase tracking-widest">
                  Step {tourStep + 1} of {tourSteps.length}
                </span>
                {/* Horizontal progress dots / lines */}
                <div className="flex gap-1.5 items-center">
                  {tourSteps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === tourStep ? "w-6 bg-cyber-primary" : "w-2 bg-slate-200 dark:bg-slate-700"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Container with glowing ring */}
              <div className="relative mb-6 flex items-center justify-center">
                <div className="absolute inset-0 w-20 h-20 bg-blue-500/10 rounded-full blur-md animate-pulse"></div>
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-cyber-border flex items-center justify-center z-10 shadow-inner">
                  {tourSteps[tourStep].icon}
                </div>
              </div>

              {/* Content Description */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5">
                {tourSteps[tourStep].title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm max-w-sm leading-relaxed mb-4 font-medium">
                {tourSteps[tourStep].desc}
              </p>

              {/* Extra Details info */}
              <p className="text-[10px] text-slate-400 dark:text-slate-400 border border-dashed border-slate-200 dark:border-cyber-border/80 px-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 max-w-md w-full leading-relaxed font-semibold">
                {tourSteps[tourStep].detail}
              </p>
            </div>

            {/* Modal Footer (Controls) */}
            <div className="p-5 border-t border-slate-200 dark:border-cyber-border/70 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
              <button
                onClick={prevTourStep}
                disabled={tourStep === 0}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-cyber-border text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {tourStep === tourSteps.length - 1 ? (
                <button
                  onClick={() => setShowDemo(false)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyber-success text-white font-bold text-xs uppercase tracking-wide shadow-md shadow-green-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  Got It
                </button>
              ) : (
                <button
                  onClick={nextTourStep}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-cyber-primary text-white font-bold text-xs transition-all hover:bg-blue-600 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
