import React, { useState } from "react";
import {
  Shield,
  LayoutDashboard,
  Sparkles,
  History,
  AlertTriangle,
  Building,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  User,
} from "lucide-react";

export default function DashboardLayout({
  user,
  isAdmin,
  currentPage,
  setPage,
  darkMode,
  toggleTheme,
  onLogout,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "analyze",
      label: "Analyze Job",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: "history",
      label: "Analysis History",
      icon: <History className="w-4 h-4" />,
    },
    {
      id: "reports",
      label: "Scam Reports",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      id: "companies",
      label: "Verified Companies",
      icon: <Building className="w-4 h-4" />,
    },

    ...(isAdmin
      ? [
          {
            id: "admin",
            label: "Admin Panel",
            icon: <Shield className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  const userEmail = user?.email || "student@university.edu";
  const userName = user?.name || userEmail.split("@")[0];

  const handleNavClick = (pageId) => {
    setPage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-cyber-bg text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300 font-sans">
      {/* Decorative Orbs inside Dashboard */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] pointer-events-none z-0"></div>

      {/* Mobile Header Bar */}
      <header className="md:hidden h-16 border-b border-slate-200/60 dark:border-cyber-border/40 bg-white/70 dark:bg-cyber-card/60 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyber-primary text-white flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-blue-600 to-violet-500 dark:from-cyber-primary dark:to-cyber-accent bg-clip-text text-transparent">
            JobShield AI
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-cyber-border text-slate-500 dark:text-slate-400 bg-white dark:bg-cyber-card"
          >
            {darkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-cyber-card border border-transparent dark:border-cyber-border text-slate-500 dark:text-slate-400"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar Panel */}
      <aside className="hidden md:flex md:w-64 border-r border-slate-200/50 dark:border-cyber-border/45 bg-white dark:bg-cyber-card flex-col justify-between p-5 shrink-0 select-none h-screen sticky top-0 z-20">
        <div className="space-y-6">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 px-2 cursor-pointer"
            onClick={() => handleNavClick("dashboard")}
          >
            <div className="p-2.5 rounded-xl bg-cyber-primary text-white shadow-md shadow-blue-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 to-violet-500 dark:from-cyber-primary dark:to-cyber-accent bg-clip-text text-transparent">
              JobShield AI
            </span>
          </div>

          {/* Navigation Directory */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                currentPage === item.id ||
                (item.id === "analyze" && currentPage === "results");
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 text-left cursor-pointer border ${isActive ? "bg-cyber-primary border-cyber-primary text-white shadow-md shadow-blue-500/15" : "text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-cyber-border/40">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors border border-transparent"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 shrink-0 text-slate-500" />
                Dark Mode
              </>
            )}
          </button>

          {/* Profile Badge */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-cyber-border/40 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-cyber-primary/10 text-cyber-primary dark:text-blue-400 font-extrabold text-xs uppercase flex items-center justify-center shrink-0 border border-blue-500/10">
              {userName.substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate capitalize">
                {userName}
              </p>
              <p className="text-[10px] text-slate-400 truncate font-semibold">
                {userEmail}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-cyber-danger hover:bg-cyber-danger/10 transition-colors text-left cursor-pointer border border-transparent"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Responsive Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer Menu */}
          <div className="relative w-64 max-w-xs bg-white dark:bg-cyber-card border-r border-slate-200/60 dark:border-cyber-border/50 p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-250">
            <div className="space-y-6">
              {/* Drawer header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyber-primary text-white flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-slate-100">
                    JobShield AI
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-cyber-border text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive =
                    currentPage === item.id ||
                    (item.id === "analyze" && currentPage === "results");
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 text-left border ${isActive ? "bg-cyber-primary border-cyber-primary text-white shadow-md shadow-blue-500/10" : "text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-cyber-border/40">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-900 border border-slate-200/50 dark:border-cyber-border/40 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-cyber-primary/10 text-cyber-primary dark:text-blue-400 font-extrabold text-xs uppercase flex items-center justify-center shrink-0">
                  {userName.substring(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold truncate capitalize">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {userEmail}
                  </p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-cyber-danger hover:bg-cyber-danger/10 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6 md:p-10 md:h-screen md:overflow-y-auto z-10 relative">
        <div className="max-w-6xl mx-auto animate-in fade-in duration-200">
          {children}
        </div>
      </main>
    </div>
  );
}
