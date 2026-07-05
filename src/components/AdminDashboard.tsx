/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { User, Course } from "../types";
import { 
  ShieldCheck, Users, BookOpenCheck, Hourglass, Activity, Check, ArrowRight,
  TrendingUp, Star, ShieldAlert, LogOut, RefreshCw, Cpu, Sun, Moon, Menu, X
} from "lucide-react";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  courses: Course[];
  refreshData: () => void;
  theme: "light" | "dark" | null;
  toggleTheme: () => void;
}

interface AdminStats {
  totalStudents: number;
  totalInstructors: number;
  totalEnrollments: number;
  totalCertificates: number;
  grossRevenue: number;
  categoryBreakdown: { name: string; students: number }[];
  monthlyActivity: any[];
}

export default function AdminDashboard({ user, onLogout, courses, refreshData, theme, toggleTheme }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"audit" | "users" | "telemetry">("audit");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetchAdminRecords();
  }, [courses]);

  const fetchAdminRecords = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stats")
      ]);
      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      setAllUsers(usersData);
      setStats(statsData);
    } catch (e) {
      console.error("Failed to fetch administrative catalogs", e);
    } finally {
      setLoading(false);
    }
  };

  // Approve and publish course (toggle state and trigger alert)
  const handleApprovePublish = async (courseId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/publish`, { method: "POST" });
      if (res.ok) {
        alert("Syllabus approved successfully! Class is live on NovaLearn.");
        refreshData();
        await fetchAdminRecords();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Promote a user role
  const handleModifyUserRole = async (targetUserId: string, nextRole: "student" | "instructor" | "admin") => {
    try {
      const res = await fetch("/api/admin/users/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, role: nextRole })
      });
      if (res.ok) {
        alert(`User successfully promotes to role: ${nextRole}`);
        await fetchAdminRecords();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pendingApprovalCourses = courses.filter(c => !c.isPublished);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors relative w-full overflow-x-hidden">
      
      {/* MOBILE HEADER BAR */}
      <header className="flex md:hidden items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 sticky top-0 z-30 w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <span className="font-display font-extrabold text-base tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
            LearnSphere
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* MOBILE DRAWER OVERLAY BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* FLOATING GLASS SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 transform ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:relative md:flex flex-col justify-between w-64 ${
        isSidebarCollapsed ? "md:w-20" : "md:w-64"
      } bg-white dark:bg-slate-900 md:bg-white/80 md:dark:bg-slate-900/80 md:backdrop-blur-md border-r border-slate-200/60 dark:border-slate-800/80 p-5 md:p-6 shrink-0 transition-all duration-300 ease-in-out shadow-xl md:shadow-sm h-screen md:h-auto overflow-y-auto`}>
        <div>
          {/* Logo & Collapse Header */}
          <div className={`flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-between"} mb-6 md:mb-8 gap-2.5`}>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer group text-left select-none focus:outline-none"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0 transition-transform group-hover:scale-105 active:scale-95">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              {!isSidebarCollapsed && (
                <span className="font-display font-extrabold text-base tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent truncate">
                  LearnSphere
                </span>
              )}
            </button>

            {/* Close button inside sidebar on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`flex items-center ${isSidebarCollapsed ? "md:justify-center md:p-1.5" : "gap-3 p-2.5"} mb-5 md:mb-6 rounded-2xl bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200/10 dark:border-slate-850 shadow-inner overflow-hidden`}>
            <img 
              src={user.avatarUrl || "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150"}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500 shrink-0"
              referrerPolicy="no-referrer"
            />
            {!isSidebarCollapsed && (
              <div className="text-left overflow-hidden">
                <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-semibold">Platform Admin</div>
                <div className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{user.name}</div>
              </div>
            )}
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab("audit"); setIsMobileMenuOpen(false); }}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-between"} ${
                activeTab === "audit"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md border-b-2 border-primary-600 dark:border-slate-300"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/90"
              }`}
              title="Auditing Pool"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                {!isSidebarCollapsed && <span>Auditing Pool</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-xs px-1.5 py-0.5 rounded-lg font-bold transition-colors ${
                  activeTab === "audit"
                    ? "bg-slate-800 text-white dark:bg-white dark:text-slate-950"
                    : "bg-amber-100 text-amber-750 dark:bg-amber-950/40 dark:text-amber-400"
                }`}>
                  {pendingApprovalCourses.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("users"); setIsMobileMenuOpen(false); }}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-between"} ${
                activeTab === "users"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md border-b-2 border-primary-600 dark:border-slate-300"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/90"
              }`}
              title="User Manager"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4.5 h-4.5 text-primary-500 shrink-0" />
                {!isSidebarCollapsed && <span>User Manager</span>}
              </div>
            </button>

            <button
              onClick={() => { setActiveTab("telemetry"); setIsMobileMenuOpen(false); }}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-between"} ${
                activeTab === "telemetry"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md border-b-2 border-primary-600 dark:border-slate-300"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/90"
              }`}
              title="Enterprise Telemetry"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                {!isSidebarCollapsed && <span>Enterprise Telemetry</span>}
              </div>
            </button>
          </nav>

          {/* Premium Theme Toggler */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center ${isSidebarCollapsed ? "md:justify-center py-2.5 px-3" : "justify-between py-2.5 px-3"} rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-150/80 dark:hover:bg-slate-800/90 transition-all cursor-pointer border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700 active:scale-98`}
              title={theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
            >
              <div className="flex items-center gap-2.5">
                {theme === "light" ? (
                  <Sun className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                ) : (
                  <Moon className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                )}
                {!isSidebarCollapsed && <span>{theme === "light" ? "Light Theme" : "Dark Theme"}</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold">
                  {theme || "dark"}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
          <button
            onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-center gap-2"} py-2.5 px-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50/80 dark:hover:bg-rose-950/20 border border-slate-200/40 dark:border-slate-850 shadow-sm cursor-pointer active:scale-95 transition-all`}
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" /> 
            {!isSidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* CORE WORKSPACE */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full overflow-x-hidden">
        
        {/* UPPER REALTIME APP HEALTH RAIL */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 p-4 rounded-2xl text-left shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <span className="text-xs text-slate-400 font-mono tracking-wider">PLATFORM NODE HEALTH STATUS:</span>
              <div className="text-sm font-extrabold flex items-center gap-1">ONLINE <span className="text-slate-400 font-normal">/ ACTIVE / PORT:3000</span></div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <Cpu className="w-4 h-4 text-primary-500" /> DB file: db.json
            </div>
            <button 
              onClick={fetchAdminRecords}
              className="p-1 px-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-205 py-1.5 rounded-lg text-[10px] text-slate-500 hover:text-slate-850 transition-all flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Sync catalogs
            </button>
          </div>
        </div>

        {/* AUDIT COURSE APPROVALS TAB */}
        {activeTab === "audit" && (
          <div className="space-y-6 text-left">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100">
                Syllabus Auditing Hub
              </h1>
              <p className="text-slate-400 text-xs mt-1">Review, evaluate, and approve pending curriculum draft submissions from our teaching faculty.</p>
            </div>

            {pendingApprovalCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {pendingApprovalCourses.map((crs) => (
                  <div 
                    key={crs.id}
                    className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 rounded-3xl flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase font-semibold text-slate-500">
                          {crs.category}
                        </span>
                        <span className="text-xs font-mono text-amber-500 flex items-center gap-1">
                          <Hourglass className="w-3.5 h-3.5" /> Pending Audit
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-lg leading-snug text-slate-900 dark:text-slate-100 mb-1.5">{crs.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mb-4">{crs.description}</p>
                      
                      <div className="p-3 rounded-xl bg-slate-55 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-xs space-y-2 mb-6">
                        <div className="text-[10px] text-slate-400 font-mono">FACULTY ADVISOR SUMMARY:</div>
                        <div className="flex items-center gap-2">
                          <img src={crs.instructorAvatar} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                          <span className="font-semibold">{crs.instructorName}</span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">Class Tuition: ${crs.price} | Level: {crs.difficulty}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApprovePublish(crs.id)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <span>Approve & Broadcast Class</span>
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-3xl text-center max-w-sm mx-auto">
                <BookOpenCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="font-display font-medium text-lg text-slate-900 dark:text-slate-100 mb-1">Queue is empty</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Excellent! There are zero course draft submissions awaiting platforms review. Educators' syllabi are all active.
                </p>
              </div>
            )}
          </div>
        )}

        {/* USER SECURITY MANAGER MEMBERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-6 text-left">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100">
                Scholars & Faculty Manager
              </h1>
              <p className="text-slate-400 text-xs mt-1">Audit profile registries, manage security controls, and promotes user access privileges.</p>
            </div>

            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-805 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 font-mono text-[10px] uppercase font-bold tracking-wider text-slate-450 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <span className="w-1/3">Profile info</span>
                <span className="w-1/4">Email location</span>
                <span className="w-1/4 text-center">Assigned Role Privilege</span>
                <span className="w-1/4 text-right">Promote Toggles</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {allUsers.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                    <div className="w-1/3 flex items-center gap-3">
                      <img src={u.avatarUrl} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{u.role}</div>
                      </div>
                    </div>

                    <span className="w-1/4 text-slate-500 font-light truncate pr-4">{u.email}</span>

                    <div className="w-1/4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider ${
                        u.role === "admin" ? "bg-rose-500/10 text-rose-500" :
                        u.role === "instructor" ? "bg-primary-500/10 text-primary-500" :
                        "bg-slate-500/10 text-slate-500"
                      }`}>
                        {u.role}
                      </span>
                    </div>

                    <div className="w-1/4 flex justify-end gap-1.5">
                      {u.role === "student" && (
                        <button
                          onClick={() => handleModifyUserRole(u.id, "instructor")}
                          className="px-2 py-1 bg-primary-100 hover:bg-primary-200 dark:bg-primary-950 text-primary-600 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Promote Instructor
                        </button>
                      )}
                      {u.role === "instructor" && (
                        <button
                          onClick={() => handleModifyUserRole(u.id, "admin")}
                          className="px-2 py-1 bg-rose-100 hover:bg-rose-200 dark:bg-rose-955 text-rose-600 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Promote Admin
                        </button>
                      )}
                      {u.role === "admin" && u.id !== user.id && (
                        <button
                          onClick={() => handleModifyUserRole(u.id, "student")}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-semibold transition-all cursor-pointer"
                        >
                          Demote Student
                        </button>
                      )}
                      {u.id === user.id && (
                        <span className="text-[10px] text-slate-400 font-mono uppercase pr-2">Self Master</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PLATFORM ANALYTICS TELEMETRY TAB */}
        {activeTab === "telemetry" && stats && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100">
                  Global Enterprise Telemetry
                </h1>
                <p className="text-slate-400 text-xs mt-1">Aggregate statistics, course completion rates, monthly allocations, and visual charts.</p>
              </div>
            </div>

            {/* Quick Metrics stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 shadow-xs flex items-center gap-3">
                <Users className="w-5 h-5 text-primary-500" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total scholars</div>
                  <div className="text-xl font-bold font-display">{stats.totalStudents}</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 shadow-xs flex items-center gap-3">
                <BookOpenCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total Enrolls</div>
                  <div className="text-xl font-bold font-display">{stats.totalEnrollments}</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 shadow-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Minted Diplomas</div>
                  <div className="text-xl font-bold font-display">{stats.totalCertificates}</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 shadow-xs flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Gross platform fees</div>
                  <div className="text-xl font-bold font-display">${stats.grossRevenue.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Recharts Analytics line charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 rounded-3xl flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="font-display font-semibold text-sm mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">New Enrollments Trend</h3>
                  <p className="text-[11px] text-slate-400 mb-4">Total platform curriculums claimed by month periods</p>
                </div>
                <div className="h-60 w-full font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.15} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }} />
                      <Line type="monotone" dataKey="New Enrols" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 rounded-3xl flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="font-display font-semibold text-sm mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">Graduation Diligence metrics</h3>
                  <p className="text-[11px] text-slate-400 mb-4 font-mono">Platform completion percentages distribution</p>
                </div>
                <div className="h-60 w-full font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.15} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }} />
                      <Bar dataKey="Graduations" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
