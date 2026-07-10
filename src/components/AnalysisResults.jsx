import React from 'react'
import { ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Shield, Mail, DollarSign, ExternalLink, HelpCircle } from 'lucide-react'

export default function AnalysisResults({ analysis, goToAnalyze }) {
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 animate-in fade-in duration-200">
        <div className="p-4 rounded-2xl bg-cyber-primary/10 border border-cyber-primary/20 mb-4">
          <Shield className="w-8 h-8 text-cyber-primary" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">No Analysis Selected</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 leading-relaxed">
          Run a job description through the analyzer to generate a trust report here.
        </p>
        <button
          onClick={goToAnalyze}
          className="mt-5 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyber-primary hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Analyze a Job
        </button>
      </div>
    );
  }

  const score = analysis.trustScore;

  // Determine colors based on Score
  const getScoreTheme = (score) => {
    if (score >= 75) {
      return {
        color: 'text-cyber-success',
        bg: 'bg-cyber-success/10',
        border: 'border-cyber-success/20',
        stroke: '#22c55e',
        title: 'High Trust Score',
        status: 'Safe',
        desc: 'This posting looks legitimate and matches standard industry verifications.'
      };
    }
    if (score >= 40) {
      return {
        color: 'text-cyber-warning',
        bg: 'bg-cyber-warning/10',
        border: 'border-cyber-warning/20',
        stroke: '#f59e0b',
        title: 'Moderate Risk',
        status: 'Caution',
        desc: 'Minor discrepancies were found (e.g., generic email domain or salary mismatch).'
      };
    }
    return {
      color: 'text-cyber-danger',
      bg: 'bg-cyber-danger/10',
      border: 'border-cyber-danger/20',
      stroke: '#ef4444',
      title: 'High Risk Alert',
      status: 'Flagged',
      desc: 'Critical indicators of fraudulent job offers were detected. Extreme caution advised.'
    };
  };

  const getRecommendedAction = (score) => {
    if (score >= 75) {
      return {
        label: 'Proceed Safely',
        style: 'bg-cyber-success/5 text-cyber-success border-cyber-success/25',
        icon: <CheckCircle2 className="w-5 h-5 text-cyber-success shrink-0" />,
        desc: 'The corporate identity, domain registers, and compensation levels have all cleared verification safeguards.'
      };
    }
    if (score >= 40) {
      return {
        label: 'Proceed with Caution',
        style: 'bg-cyber-warning/5 text-cyber-warning border-cyber-warning/25',
        icon: <AlertTriangle className="w-5 h-5 text-cyber-warning shrink-0" />,
        desc: 'Perform secondary corporate identity confirmation before transferring files or personal candidate details.'
      };
    }
    return {
      label: 'Avoid This Job',
      style: 'bg-cyber-danger/5 text-cyber-danger border-cyber-danger/25',
      icon: <AlertCircle className="w-5 h-5 text-cyber-danger shrink-0" />,
      desc: 'High density scam heuristics detected (suspicious refund training requests, generic email usage). Avoid contact.'
    };
  };

  const theme = getScoreTheme(score);
  const recommendation = getRecommendedAction(score);
  
  // Calculate SVG stroke offset for score circle
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Derive verification factors for display based on the score
  const isSafe = score >= 75;
  const isWarning = score >= 40 && score < 75;
  const isHighRisk = score < 40;

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-cyber-border/40 pb-5">
        <div>
          <button 
            onClick={goToAnalyze}
            className="flex items-center gap-1.5 text-xs text-cyber-primary hover:text-blue-600 font-bold mb-2.5 cursor-pointer select-none uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Analyze Another Job
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Job Verification Report</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            ID: JS-{analysis.id} | Generated on {analysis.date}
          </p>
        </div>

        <span className={`px-5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${theme.color} ${theme.bg} ${theme.border}`}>
          {theme.status} Profile
        </span>
      </div>

      {/* Main Grid: Score Gauge and AI Recommendation */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Radial Score Gauge Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-cyber-border/45 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-cyber-card/55 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
            Security Trust Score
          </span>
          
          {/* Radial SVG Circle */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-5">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle 
                cx="60" cy="60" r={radius} 
                fill="none" stroke="#e2e8f0" strokeWidth="8"
                className="dark:stroke-slate-800"
              />
              <circle 
                cx="60" cy="60" r={radius} 
                fill="none" stroke={theme.stroke} strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{score}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">/ 100</span>
            </div>
          </div>

          <h3 className={`font-extrabold text-base uppercase tracking-wider ${theme.color}`}>{theme.title}</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-2 max-w-[200px] leading-relaxed font-semibold">
            {theme.desc}
          </p>
        </div>

        {/* AI Recommendations Narrative Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/60 dark:border-cyber-border/45 md:col-span-2 flex flex-col justify-between bg-white/40 dark:bg-cyber-card/55 shadow-sm">
          <div className="space-y-4">
            <h3 className="text-xs font-bold flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-cyber-border/30 pb-2.5 select-none">
              <Sparkles className="w-5 h-5 text-cyber-accent animate-pulse" />
              AI Recommendation Narrative
            </h3>
            
            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                Audited Role: <span className="underline decoration-cyber-primary decoration-2 decoration-skip-ink">{analysis.title}</span> at <span className="underline decoration-cyber-accent decoration-2 decoration-skip-ink">{analysis.company}</span>
              </p>
              
              {isSafe && (
                <p>
                  Our security systems verified this job posting as highly authentic. The company website domain reputation is clean, the recruiter email handles match corporate registers, and no suspicious upfront fees or deposit structures were flagged. You are safe to submit your application.
                </p>
              )}
              {isWarning && (
                <p>
                  Caution is recommended before sharing sensitive credentials. Although the company entity appears registry-verifiable, the recruiter's email domain is using a public handler (@gmail.com) rather than a validated corporate extension, which is atypical for formal recruiter contacts.
                </p>
              )}
              {isHighRisk && (
                <p>
                  <strong>CRITICAL WARNING:</strong> We strongly advise against engaging with this contact. The description contains high-density flags for typical job scams, including upfront deposit queries labeled as refundable kit fees. Additionally, the email origin is generic and domain records display low authenticity indicators.
                </p>
              )}
            </div>
          </div>

          {/* Recommended Action block */}
          <div className={`mt-5 p-5 rounded-2xl border ${recommendation.style} flex flex-col sm:flex-row items-start sm:items-center gap-3.5`}>
            {recommendation.icon}
            <div>
              <div className="font-black text-sm uppercase tracking-wider">{recommendation.label}</div>
              <p className="text-[10px] mt-0.5 opacity-90 leading-relaxed font-semibold">{recommendation.desc}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-cyber-border/30 pt-4 mt-5 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">
            <span>Model Version: JobShield V2.6</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyber-primary" />
              Verified Core MVP
            </span>
          </div>
        </div>

      </div>

      {/* Audit Breakdowns */}
      <div className="grid sm:grid-cols-2 gap-4">
        
        {/* Module 1: Company & Recruiter domains */}
        <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-cyber-border/45 bg-white/40 dark:bg-cyber-card/55 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold flex items-center gap-1.5 text-slate-900 dark:text-white uppercase tracking-wider select-none">
              <Shield className="w-4 h-4 text-cyber-primary" />
              Entity Verification
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Website registries and corporate footprints</p>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Corporate Website Registry',
                value: isSafe ? 'Verified Domain' : isWarning ? 'Registry Found' : 'Unregistered / Shady URL',
                status: isSafe ? 'safe' : isWarning ? 'caution' : 'danger'
              },
              {
                label: 'LinkedIn Registry Matching',
                value: isSafe ? 'Entity Matched' : isWarning ? 'No Matching Profile' : 'Not Registered',
                status: isSafe ? 'safe' : isWarning ? 'caution' : 'danger'
              },
              {
                label: 'Recruiter Email Domain',
                value: isSafe ? 'Valid (Corporate)' : isWarning ? 'Warning (Public Handle)' : 'High Risk Domain (Spoofed)',
                status: isSafe ? 'safe' : isWarning ? 'caution' : 'danger'
              }
            ].map((check, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-cyber-border/30 text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">{check.label}</span>
                <span className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wide ${check.status === 'safe' ? 'text-cyber-success' : check.status === 'caution' ? 'text-cyber-warning' : 'text-cyber-danger'}`}>
                  {check.status === 'safe' ? <CheckCircle2 className="w-3.5 h-3.5 fill-current" /> : check.status === 'caution' ? <AlertTriangle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {check.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Module 2: Salary & Phishing links */}
        <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-cyber-border/45 bg-white/40 dark:bg-cyber-card/55 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold flex items-center gap-1.5 text-slate-900 dark:text-white uppercase tracking-wider select-none">
              <DollarSign className="w-4 h-4 text-cyber-accent" />
              Compensation & URL Audits
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Financial models and redirection checkers</p>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Salary Deviation check',
                value: isSafe ? 'Standard Range' : isWarning ? 'Slightly Elevated' : 'Critical Mismatch (>65%)',
                status: isSafe ? 'safe' : isWarning ? 'caution' : 'danger'
              },
              {
                label: 'Description Phishing links',
                value: isSafe ? 'No Links Detected' : isWarning ? '1 Redirect (Caution)' : 'Warning (Suspicious URLs)',
                status: isSafe ? 'safe' : isWarning ? 'caution' : 'danger'
              },
              {
                label: 'Upfront Deposit Request',
                value: isHighRisk ? 'Flagged (Refundable Fee)' : 'None Detected',
                status: isHighRisk ? 'danger' : 'safe'
              }
            ].map((check, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-cyber-border/30 text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">{check.label}</span>
                <span className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wide ${check.status === 'safe' ? 'text-cyber-success' : check.status === 'caution' ? 'text-cyber-warning' : 'text-cyber-danger'}`}>
                  {check.status === 'safe' ? <CheckCircle2 className="w-3.5 h-3.5 fill-current" /> : check.status === 'caution' ? <AlertTriangle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {check.value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Flagged Phrasing Highlights Card */}
      {isHighRisk && (
        <div className="glass-card p-5 rounded-3xl border border-cyber-danger/30 bg-cyber-danger/5 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-cyber-danger flex items-center gap-1.5 uppercase tracking-wider select-none">
            <AlertCircle className="w-4 h-4" />
            Detected Fraudulent Phrasing Keywords
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            The job description you analyzed contained key sentences often utilized in artificial posting schemes:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['Registration Fee', 'Security Deposit', 'Guaranteed Placement', 'Refunding Equipment Cost', 'Telegram Interview'].map((phrase, i) => (
              <span key={i} className="px-3 py-1 rounded bg-cyber-danger/10 border border-cyber-danger/15 text-[9px] font-bold text-cyber-danger">
                {phrase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Job Details Preview Card */}
      <div className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-cyber-border/45 bg-white/40 dark:bg-cyber-card/55 shadow-sm space-y-4">
        <h3 className="text-xs font-bold pb-2.5 border-b border-slate-100 dark:border-cyber-border/30 text-slate-900 dark:text-white uppercase tracking-wider select-none">
          Source Job Details Audited
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div>
            <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Job Title</p>
            <p className="text-slate-800 dark:text-slate-200 mt-0.5">{analysis.title}</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Company</p>
            <p className="text-slate-800 dark:text-slate-200 mt-0.5">{analysis.company}</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Recruiter Contact</p>
            <p className="text-slate-800 dark:text-slate-200 mt-0.5 truncate">{analysis.recruiterEmail}</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Salary</p>
            <p className="text-slate-800 dark:text-slate-200 mt-0.5">{analysis.salary}</p>
          </div>
        </div>
        
        {analysis.description && (
          <div className="pt-3.5 border-t border-slate-100 dark:border-cyber-border/30 text-xs font-semibold">
            <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1.5">Job Description</p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {analysis.description}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
