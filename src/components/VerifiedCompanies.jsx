import { serverTimestamp } from "firebase/firestore";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";
import React, { useState } from "react";
import {
  Building,
  Search,
  CheckCircle,
  ExternalLink,
  Globe,
  Users,
  ArrowUpRight,
  ShieldCheck,
  X,
  Calendar,
  MapPin,
  Mail,
  Award,
  Briefcase,
} from "lucide-react";

export default function VerifiedCompanies({ companies }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [activeModalCompany, setActiveModalCompany] = useState(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [requestData, setRequestData] = useState({
    companyName: "",
    website: "",
    email: "",
    industry: "",
    reason: "",
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const handleSearch = (e) => setSearchQuery(e.target.value);
  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        type,
      });
    }, 3000);
  };
  const handleSubmitRequest = async () => {
    if (
      !requestData.companyName.trim() ||
      !requestData.website.trim() ||
      !requestData.email.trim() ||
      !requestData.industry.trim() ||
      !requestData.reason.trim()
    ) {
      console.log("Notification fired");
      console.log("Message:", "Please fill all fields.");
      setNotification({
        show: true,
        message: "Please fill all fields.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({
          show: false,
          message: "",
          type: "error",
        });
      }, 3000);

      return;
    }
    try {
      await addDoc(collection(db, "verificationRequests"), {
        ...requestData,

        status: "Pending",

        submittedAt: serverTimestamp(),
        submittedDate: new Date().toLocaleDateString(),

        submittedTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: Date.now(),
      });

      setNotification({
        show: true,
        message: "Verification request submitted successfully!",
        type: "success",
      });

      setRequestData({
        companyName: "",
        website: "",
        email: "",
        industry: "",
        reason: "",
      });

      setShowAddCompany(false);
      setTimeout(() => {
        setNotification({
          show: false,
          message: "",
          type: "success",
        });
      }, 3000);
    } catch (error) {
      console.error(error);
      setNotification({
        show: true,
        message: "Failed to submit request.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({
          show: false,
          message: "",
          type: "error",
        });
      }, 3000);
    }
  };

  // Extract unique list of industries
  const industries = [
    "all",
    ...[...new Set(companies.map((company) => company.industry))].sort(),
  ];

  // Filter list
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry =
      selectedIndustry === "all" || c.industry === selectedIndustry;

    return matchesSearch && matchesIndustry;
  });

  // Dynamic helper to construct complete details for the verification details modal
  const getCompanyDetails = (company) => {
    const defaults = {
      headquarters: "San Francisco, CA",
      recruiterEmailFormat: `*@${company.website}`,
      verifiedDomains: `${company.website}, jobs.${company.website}`,
      verificationDate: "2026-03-12",
      hiringStatus: "Active Recruiting",
      securityRating: "98/100 (A+ / Elite)",
      contactInfo: `recruiting-ops@${company.website}`,
    };

    if (company.name.includes("Google")) {
      return {
        ...defaults,
        headquarters: "Mountain View, CA",
        recruiterEmailFormat: "*@google.com",
        verifiedDomains: "google.com, careers.google.com, tech.google.com",
        verificationDate: "2026-01-20",
        securityRating: "99/100 (A+ / Outstanding)",
        contactInfo: "careers-verification@google.com",
      };
    }
    if (company.name.includes("Stripe")) {
      return {
        ...defaults,
        headquarters: "San Francisco, CA",
        recruiterEmailFormat: "*@stripe.com",
        verifiedDomains: "stripe.com, dashboard.stripe.com, stripe.dev",
        verificationDate: "2026-02-14",
        securityRating: "98/100 (A+ / Elite)",
        contactInfo: "recruiting-operations@stripe.com",
      };
    }
    if (company.name.includes("Notion")) {
      return {
        ...defaults,
        headquarters: "San Francisco, CA",
        recruiterEmailFormat: "*@notion.so",
        verifiedDomains: "notion.so, notion.new, notion.xyz",
        verificationDate: "2026-04-01",
        securityRating: "96/100 (A / Excellent)",
        contactInfo: "talent-security@notion.so",
      };
    }
    if (company.name.includes("LinkedIn")) {
      return {
        ...defaults,
        headquarters: "Sunnyvale, CA",
        recruiterEmailFormat: "*@linkedin.com",
        verifiedDomains: "linkedin.com, press.linkedin.com",
        verificationDate: "2026-05-10",
        securityRating: "97/100 (A / Elite)",
        contactInfo: "talent-safety@linkedin.com",
      };
    }

    return defaults;
  };

  const modalDetails = activeModalCompany
    ? getCompanyDetails(activeModalCompany)
    : null;

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      {/* Sub-Header */}
      <div className="border-b border-slate-200/50 dark:border-cyber-border/40 pb-5">
        <h1 className="text-2xl font-bold tracking-tight">
          Verified Corporate Register
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          White-listed partner corporate profiles with verified domain
          registers, LinkedIn records, and authorized emails.
        </p>
      </div>
      {notification.show && (
        <div
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-[slideIn_.3s_ease]
    ${
      notification.type === "success"
        ? "bg-emerald-600 border-emerald-500 text-white"
        : "bg-red-600 border-red-500 text-white"
    }`}
        >
          <div className="text-2xl">
            {notification.type === "success" ? "🎉" : "⚠️"}
          </div>

          <div>
            <h3 className="font-bold text-sm">
              {notification.type === "success"
                ? "Request Submitted"
                : "Missing Details"}
            </h3>

            <p className="text-xs opacity-90">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search verified registries..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-cyber-primary text-xs font-semibold transition-all shadow-inner"
          />
        </div>

        {/* Industry Filter dropdown */}
        <div className="flex items-center gap-2 select-none shrink-0">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">
            Industry:
          </span>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-slate-900 focus:outline-none text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {industries.map((ind, i) => (
              <option key={i} value={ind} className="capitalize">
                {ind === "all" ? "All Industries" : ind}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowAddCompany(true)}
          className="px-4 py-2.5 rounded-xl bg-cyber-primary text-white text-xs font-bold hover:bg-blue-600 transition"
        >
          Add Company
        </button>
      </div>

      {/* Directory Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-2 glass-card p-16 rounded-3xl border border-slate-200/60 dark:border-cyber-border/40 text-center flex flex-col items-center justify-center bg-white/40 dark:bg-cyber-card/50 shadow-sm">
            <Building className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              No Verified Profile Matches
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed font-semibold">
              No whitelisted entity matches your search terms. Clear query
              parameters or search a different keyword.
            </p>
          </div>
        ) : (
          filteredCompanies.map((c) => (
            <div
              key={c.id}
              className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-cyber-border/50 bg-white/40 dark:bg-cyber-card/55 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-cyber-border/60 flex items-center justify-center text-lg shadow-sm shrink-0 select-none">
                      {c.logo}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        {c.name}
                        <CheckCircle className="w-4 h-4 text-cyber-success shrink-0 fill-current" />
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {c.industry}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Text */}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {c.details}
                </p>

                {/* Details Pills */}
                <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase select-none">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-cyber-border/40">
                    <Globe className="w-3.5 h-3.5 text-cyber-primary" />
                    {c.website}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-cyber-border/40">
                    <Users className="w-3.5 h-3.5 text-cyber-accent" />
                    {c.employees} Staff
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-2 border-t border-slate-100 dark:border-cyber-border/30 pt-4 mt-5">
                <a
                  href={`https://${c.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-cyber-border hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Visit Domain
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </a>
                <button
                  onClick={() => setActiveModalCompany(c)}
                  className="px-4 py-2 rounded-xl bg-cyber-success/10 hover:bg-cyber-success/20 text-cyber-success text-[10px] font-black uppercase tracking-wider border border-cyber-success/20 transition-all select-none cursor-pointer"
                >
                  Verification Info
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Verification Info Modal */}
      {activeModalCompany && modalDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-cyber-border/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-cyber-border/60 flex items-center justify-center text-lg shrink-0 select-none shadow-inner">
                  {activeModalCompany.logo}
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    {activeModalCompany.name}
                    <CheckCircle className="w-4 h-4 text-cyber-success fill-current shrink-0" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {activeModalCompany.industry}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalCompany(null)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-cyber-border text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 flex-1 bg-white dark:bg-cyber-card overflow-y-auto space-y-6">
              {/* Top Security Banner */}
              <div className="p-3.5 rounded-2xl bg-cyber-success/5 border border-cyber-success/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-cyber-success shrink-0" />
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-cyber-success">
                    Whitelisted Security Entity
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-cyber-success/15 text-cyber-success text-[9px] font-black uppercase tracking-wider">
                  Rating: {modalDetails.securityRating}
                </span>
              </div>

              {/* Grid Information Fields */}
              <div className="grid grid-cols-2 gap-x-5 gap-y-4.5 text-xs font-semibold">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />{" "}
                    Headquarters
                  </p>
                  <p className="text-slate-800 dark:text-slate-200">
                    {modalDetails.headquarters}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Globe className="w-3.5 h-3.5 text-cyber-primary" />{" "}
                    Official Website
                  </p>
                  <a
                    href={`https://${activeModalCompany.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyber-primary hover:underline flex items-center gap-0.5"
                  >
                    {activeModalCompany.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Mail className="w-3.5 h-3.5 text-cyber-warning" />{" "}
                    Recruiter Email Format
                  </p>
                  <p className="text-slate-800 dark:text-slate-200 font-mono select-all bg-slate-50 dark:bg-slate-900/50 px-2 py-0.5 rounded border border-slate-200/50 dark:border-cyber-border/40 w-fit">
                    {modalDetails.recruiterEmailFormat}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Award className="w-3.5 h-3.5 text-cyber-accent" /> Verified
                    Domains
                  </p>
                  <p className="text-slate-800 dark:text-slate-200 select-all">
                    {modalDetails.verifiedDomains}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />{" "}
                    Verification Date
                  </p>
                  <p className="text-slate-800 dark:text-slate-200">
                    {modalDetails.verificationDate}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Employee
                    Count
                  </p>
                  <p className="text-slate-800 dark:text-slate-200">
                    {activeModalCompany.employees} Staff
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-cyber-primary" />{" "}
                    Hiring Status
                  </p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyber-primary/10 border border-cyber-primary/20 text-[9px] font-black uppercase text-cyber-primary">
                    {modalDetails.hiringStatus}
                  </span>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Contact
                    Information
                  </p>
                  <p className="text-slate-800 dark:text-slate-200 truncate select-all">
                    {modalDetails.contactInfo}
                  </p>
                </div>
              </div>

              {/* Company Description */}
              <div className="pt-4 border-t border-slate-100 dark:border-cyber-border/30 text-xs font-medium">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Company Description
                </p>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  {activeModalCompany.details} This whitelist registry profile
                  confirms they maintain standard corporate employment
                  procedures. Inquiries from recruiter handles deviating from
                  verified extensions should be immediately flagged to our
                  security networks.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 dark:border-cyber-border/50 flex justify-end bg-slate-50/50 dark:bg-slate-900/40">
              <button
                onClick={() => setActiveModalCompany(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">
              Submit Company for Verification
            </h2>

            <p className="text-gray-500 mb-6">
              Our security team will verify the company before adding it to the
              Verified Companies list.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Company Name"
                value={requestData.companyName}
                onChange={(e) =>
                  setRequestData({
                    ...requestData,
                    companyName: e.target.value,
                  })
                }
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />

              <input
                type="text"
                placeholder="Official Website"
                value={requestData.website}
                onChange={(e) =>
                  setRequestData({
                    ...requestData,
                    website: e.target.value,
                  })
                }
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />

              <input
                type="email"
                placeholder="Official HR Email"
                value={requestData.email}
                onChange={(e) =>
                  setRequestData({
                    ...requestData,
                    email: e.target.value,
                  })
                }
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />

              <input
                type="text"
                placeholder="Industry"
                value={requestData.industry}
                onChange={(e) =>
                  setRequestData({
                    ...requestData,
                    industry: e.target.value,
                  })
                }
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />

              <textarea
                placeholder="Why should this company be verified?"
                rows={4}
                value={requestData.reason}
                onChange={(e) =>
                  setRequestData({
                    ...requestData,
                    reason: e.target.value,
                  })
                }
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddCompany(false)}
                className="px-3 py-1 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitRequest}
                className="px-4 py-1 rounded-lg bg-blue-600 text-white"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
