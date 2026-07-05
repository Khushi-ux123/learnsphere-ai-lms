/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { User, Course, Module, Lesson } from "../types";
import { 
  Plus, Upload, FileText, Video, HelpCircle, GraduationCap, Users, DollarSign, 
  TrendingUp, CircleDot, CheckCircle2, Star, BookOpen, AlertCircle, LogOut, Code, ChevronRight, Sun, Moon, Menu, X
} from "lucide-react";

interface InstructorDashboardProps {
  user: User;
  onLogout: () => void;
  courses: Course[];
  onCourseCreated: () => void;
  theme: "light" | "dark" | null;
  toggleTheme: () => void;
}

export default function InstructorDashboard({ user, onLogout, courses, onCourseCreated, theme, toggleTheme }: InstructorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "create" | "analytics">("courses");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Local state for Course creator
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Development");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [price, setPrice] = useState("49.99");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filter instructor specific coursework
  const myCourses = courses.filter(c => c.instructorId === user.id);

  // Cumulative Analytics calculations
  const totalEnrollments = myCourses.reduce((acc, curr) => acc + curr.studentCount, 0);
  const totalRevenue = myCourses.reduce((acc, curr) => acc + (curr.studentCount * curr.price), 0);
  const avgRating = myCourses.length > 0 
    ? Number((myCourses.reduce((acc, curr) => acc + curr.rating, 0) / myCourses.length).toFixed(1))
    : 5.0;

  // Recharts interactive datasets
  const revenueHistory = [
    { name: "Week 1", revenue: Math.round(totalRevenue * 0.15), students: 5 },
    { name: "Week 2", revenue: Math.round(totalRevenue * 0.35), students: 12 },
    { name: "Week 3", revenue: Math.round(totalRevenue * 0.55), students: 24 },
    { name: "Week 4", revenue: Math.round(totalRevenue * 0.8), students: 38 },
    { name: "Current Week", revenue: Math.round(totalRevenue), students: totalEnrollments || 45 }
  ];

  const categoryShare = [
    { category: "Development", count: myCourses.filter(c => c.category === "Development").length },
    { category: "Design", count: myCourses.filter(c => c.category === "Design").length },
    { category: "Science", count: myCourses.filter(c => c.category === "Science").length }
  ];

  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) {
      setStatusMessage("Please fulfill all course parameters");
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/courses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          instructorId: user.id,
          price: Number(price) || 0,
          difficulty
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");

      setStatusMessage("Syllabus created successfully! Head over to Admin module for publications approval.");
      onCourseCreated();
      setTitle("");
      setDescription("");
      setPrice("49.99");
      setDifficulty("Beginner");
      setActiveTab("courses");
    } catch (err: any) {
      setStatusMessage(err.message || "Failed to finalize course setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors relative w-full overflow-x-hidden">
      
      {/* MOBILE HEADER BAR */}
      <header className="flex md:hidden items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 sticky top-0 z-30 w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            <GraduationCap className="w-4.5 h-4.5" />
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
                <GraduationCap className="w-4.5 h-4.5" />
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
              src={user.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150"}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500 shrink-0"
              referrerPolicy="no-referrer"
            />
            {!isSidebarCollapsed && (
              <div className="text-left overflow-hidden">
                <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Instructor</div>
                <div className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{user.name}</div>
              </div>
            )}
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab("courses"); setIsMobileMenuOpen(false); }}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-between"} ${
                activeTab === "courses"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md border-b-2 border-primary-600 dark:border-slate-300"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/90"
              }`}
              title="My Catalog"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4.5 h-4.5 text-primary-500 shrink-0" />
                {!isSidebarCollapsed && <span>My Catalog</span>}
              </div>
            </button>

            <button
              onClick={() => { setActiveTab("create"); setIsMobileMenuOpen(false); }}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-between"} ${
                activeTab === "create"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md border-b-2 border-primary-600 dark:border-slate-300"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/90"
              }`}
              title="Create Course"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                {!isSidebarCollapsed && <span>Create Course</span>}
              </div>
            </button>

            <button
              onClick={() => { setActiveTab("analytics"); setIsMobileMenuOpen(false); }}
              className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-between"} ${
                activeTab === "analytics"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md border-b-2 border-primary-600 dark:border-slate-300"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/90"
              }`}
              title="Syllabus Analytics"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                {!isSidebarCollapsed && <span>Syllabus Analytics</span>}
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

      {/* METRIC GRIDS WORKSPACE */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full overflow-x-hidden">
        
        {activeTab === "courses" && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  My Educative Curriculums
                </h1>
                <p className="text-slate-400 text-xs mt-1">Review student enrollments, course feedback ratings, and publication status approvals.</p>
              </div>
              <button
                onClick={() => setActiveTab("create")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-650 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Form New Course
              </button>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Total Scholars</div>
                  <div className="text-2xl font-bold font-display">{totalEnrollments}</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Accrued Share Receipts</div>
                  <div className="text-2xl font-bold font-display">${totalRevenue.toFixed(2)}</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Average Evaluations</div>
                  <div className="text-2xl font-bold font-display">{avgRating.toFixed(1)} <span className="text-xs text-slate-400 font-light">/ 5.0</span></div>
                </div>
              </div>
            </div>

            {/* Courses listing */}
            {myCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {myCourses.map((crs) => (
                  <div 
                    key={crs.id}
                    className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-805 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative h-44 bg-slate-100 dark:bg-slate-950">
                      <img 
                        src={crs.thumbnail} 
                        alt={crs.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full glass text-xs font-semibold text-slate-800 dark:text-white border border-white/20">
                        {crs.category}
                      </div>

                      {crs.isPublished ? (
                        <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Live
                        </div>
                      ) : (
                        <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Pending Approval
                        </div>
                      )}
                    </div>

                    <div className="p-6 text-left flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-medium text-base text-slate-900 dark:text-slate-100 mb-1 leading-snug line-clamp-2">
                          {crs.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-3 mb-4">{crs.description}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-805 grid grid-cols-2 gap-4 text-xs font-mono text-slate-450">
                        <div>
                          Enrollments: <span className="font-bold text-slate-800 dark:text-slate-200">{crs.studentCount}</span>
                        </div>
                        <div className="text-right">
                          Price: <span className="font-bold text-slate-800 dark:text-slate-200">${crs.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-3xl text-center max-w-md mx-auto mt-8">
                <BookOpen className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="font-display font-medium text-lg text-slate-900 dark:text-slate-100 mb-1.5">No syllabus registered</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  You haven't setup any course curriculums on NovaLearn yet. Begin by building custom modules and lesson notes.
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-bold transition"
                >
                  Create Your First Syllabus
                </button>
              </div>
            )}
          </div>
        )}

        {/* CREATE COURSE FORM BUILDER */}
        {activeTab === "create" && (
          <div className="space-y-6 text-left max-w-2xl mx-auto">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100">
                Setup Academic Syllabus
              </h1>
              <p className="text-slate-400 text-xs mt-1">Formulate extensive modules, categories, and custom pricing structures.</p>
            </div>

            {statusMessage && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-500" />
                <span>{statusMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourseSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 p-8 rounded-3xl space-y-5 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Curriculum Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Advanced AI & Gemini Neural orchestrations"
                    className="block w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Concept Abstract (Brief description)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="An interactive conceptual masterclass reviewing process.env injections..."
                    className="block w-full p-2.5 h-20 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Category Domain</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Science">Science</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Difficulty Tier</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="block w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced font-semibold">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Tuition Cost (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="49.99"
                    className="block w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-widest text-slate-400 uppercase mb-2">Pre-configured lessons:</label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] space-y-1">
                    <div className="flex items-center gap-1.5">&#10003; 1.1 Foundations Lesson [Video]</div>
                    <div className="flex items-center gap-1.5">&#10003; 1.2 Resource Homework [PDF]</div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 border border-transparent hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-semibold text-xs rounded-xl shadow transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Registering syllabus..." : "Finalize & Request Publication"}
              </button>
            </form>
          </div>
        )}

        {/* RECHARTS ANALYTICS VIEW */}
        {activeTab === "analytics" && (
          <div className="space-y-6 text-left">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100">
                Syllabus Telemetry Analytics
              </h1>
              <p className="text-slate-400 text-xs mt-1 font-mono">RECHARTS DYNAMIC VISUAL PERFORMANCE TRACKS</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Gross Revenue Chart */}
              <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold text-sm mb-1">ACCUMULATED REVENUE PROGRESS (USD)</h3>
                  <p className="text-[11px] text-slate-400 mb-4">Total revenue accrued over curriculum timelines</p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Course categories distribution */}
              <div className="lg:col-span-4 p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold text-sm mb-1">Schooled Growth Metric</h3>
                  <p className="text-[11px] text-slate-400 mb-4">Total newly registered students per week progress</p>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }} />
                      <Bar dataKey="students" fill="#a78bfa" radius={[4, 4, 0, 0]} />
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
