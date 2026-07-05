/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from "recharts";
import { 
  User, Course, Enrollment, Certificate, Notification, LeaderboardUser 
} from "../types";
import EnrollmentModal from "./EnrollmentModal";
import AITutorWidget from "./AITutorWidget";
import { 
  BookOpen, Award, Sparkles, Trophy, Video, FileText, CheckSquare, HelpCircle, 
  ChevronRight, Calendar, Bookmark, FileSignature, Send, Quote, ChevronLeft, 
  Trash, Save, BookOpenCheck, Loader2, Lightbulb, Flame, Star, LogOut, CheckCircle2, ArrowRight,
  Printer, Download, ExternalLink, X, Sun, Moon, Menu, Twitter, Linkedin, Share2, Link, Clock, TrendingUp
} from "lucide-react";

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  courses: Course[];
  refreshUserData: () => void;
  theme?: "light" | "dark" | null;
  toggleTheme?: () => void;
}

export default function StudentDashboard({ 
  user, 
  onLogout, 
  courses, 
  refreshUserData,
  theme,
  toggleTheme 
}: StudentDashboardProps) {
  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("learnsphere_sidebar_collapsed") === "true";
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("learnsphere_sidebar_collapsed", isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  // Navigation states
  const [activeTab, setActiveTab] = useState<"enrolled" | "catalog" | "leaderboard" | "certificates">("enrolled");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);
  const [sharingCertificateId, setSharingCertificateId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Study Planner & Enrollment Prompt States
  const [enrollPromptCourse, setEnrollPromptCourse] = useState<Course | null>(null);
  const [plannerHours, setPlannerHours] = useState(2);
  const [plannerFocus, setPlannerFocus] = useState("");
  const [aiPlanResult, setAiPlanResult] = useState<string | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const handleGenerateStudyPlan = async () => {
    setGeneratingPlan(true);
    try {
      const activeCourseTitles = enrollments.map(enr => {
        const associatedCourse = courses.find(c => c.id === enr.courseId);
        return associatedCourse ? associatedCourse.title : "Specialization Core";
      });

      const res = await fetch("/api/gemini/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: activeCourseTitles,
          studentXp: user.xp,
          studyHours: plannerHours,
          focusArea: plannerFocus,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiPlanResult(data.plan);
      } else {
        alert(data.error || "Failed to generate AI study plan.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Planner API network failure.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleCardClick = (crs: Course) => {
    const isEnrolled = enrollments.some(e => e.courseId === crs.id);
    if (isEnrolled) {
      setSelectedCourse(crs);
      const firstLes = crs.modules[0]?.lessons[0]?.id;
      if (firstLes) setActiveLessonId(firstLes);
    } else {
      setEnrollPromptCourse(crs);
    }
  };

  // 30-Day Learning streak calendar state
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = useState<string>(() => {
    return new Date("2026-07-03T12:00:00Z").toISOString().split("T")[0];
  });

  const [activeDays, setActiveDays] = useState<{ [dateStr: string]: { type: "lesson" | "quiz" | "quest" | "none"; xp: number; details: string } }>(() => {
    const saved = localStorage.getItem(`learnsphere_streak_calendar_${user.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }

    // Seed initial days based on user streak
    const initial: { [dateStr: string]: { type: "lesson" | "quiz" | "quest" | "none"; xp: number; details: string } } = {};
    const today = new Date("2026-07-03T12:00:00Z");
    
    // Seed the last user.streak days as active
    const streakCount = user.streak || 6;
    for (let i = 0; i < streakCount; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      
      const types: ("lesson" | "quiz" | "quest")[] = ["lesson", "quiz", "quest"];
      const type = types[i % 3];
      const xp = type === "lesson" ? 50 : type === "quiz" ? 150 : 250;
      const details = type === "lesson" ? "Completed Lesson: State Management" : type === "quiz" ? "Mastered React Quiz Assessment" : "Conquered Daily Challenge Quest";
      
      initial[dateStr] = { type, xp, details };
    }

    // Seed some older randomized days to make it look like a real history!
    const olderOffsets = [10, 11, 12, 16, 17, 21, 22, 25, 26, 28];
    olderOffsets.forEach((offset, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const dateStr = d.toISOString().split("T")[0];
      const types: ("lesson" | "quiz" | "quest")[] = ["lesson", "quiz", "quest"];
      const type = types[idx % 3];
      const xp = type === "lesson" ? 50 : type === "quiz" ? 150 : 250;
      const details = type === "lesson" ? "Completed Lesson: Flexbox Layouts" : type === "quiz" ? "Passed Drizzle ORM Quiz" : "Completed Daily Algorithm Challenge";
      initial[dateStr] = { type, xp, details };
    });

    return initial;
  });

  useEffect(() => {
    localStorage.setItem(`learnsphere_streak_calendar_${user.id}`, JSON.stringify(activeDays));
  }, [activeDays, user.id]);

  const recordActivity = (type: "lesson" | "quiz" | "quest", xp: number, details: string) => {
    const todayStr = new Date("2026-07-03T12:00:00Z").toISOString().split("T")[0];
    setActiveDays(prev => ({
      ...prev,
      [todayStr]: { type, xp, details }
    }));
  };

  const past30Days = React.useMemo(() => {
    const days = [];
    const today = new Date("2026-07-03T12:00:00Z");
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    return days;
  }, []);

  // Compute weekly statistics dynamically based on active calendar study records
  const weeklyChartData = React.useMemo(() => {
    const baseWeek = [
      { name: "Mon", dateStr: "2026-06-29", hours: 2.1, quizScore: 82 },
      { name: "Tue", dateStr: "2026-06-30", hours: 1.5, quizScore: 75 },
      { name: "Wed", dateStr: "2026-07-01", hours: 3.4, quizScore: 88 },
      { name: "Thu", dateStr: "2026-07-02", hours: 2.8, quizScore: 80 },
      { name: "Fri", dateStr: "2026-07-03", hours: 4.2, quizScore: 92 },
      { name: "Sat", dateStr: "2026-07-04", hours: 0.0, quizScore: 0 },
      { name: "Sun", dateStr: "2026-07-05", hours: 0.0, quizScore: 0 },
    ];

    return baseWeek.map(day => {
      const activity = activeDays[day.dateStr];
      let hours = day.hours;
      let quizScore = day.quizScore;

      if (activity) {
        if (activity.type === "lesson") {
          hours = Math.max(hours, 2.8);
        } else if (activity.type === "quiz") {
          hours = Math.max(hours, 3.5);
          const scoreMatch = activity.details.match(/score\s+(\d+)%/i);
          quizScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 95;
        } else if (activity.type === "quest") {
          hours = Math.max(hours, 4.0);
        }
      }

      return {
        ...day,
        hours: parseFloat(hours.toFixed(1)),
        quizScore: quizScore
      };
    });
  }, [activeDays]);

  // Live database records
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  // Interactive lessons states
  const [userNoteText, setUserNoteText] = useState("");
  const [assignmentText, setAssignmentText] = useState("");
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizScoreReport, setQuizScoreReport] = useState<{ score: number; complete: boolean } | null>(null);

  // Gemini AI Assistant state
  const [chatInput, setChatInput] = useState("");
  const [chatLogs, setChatLogs] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Welcome to your **LearnSphere Intelligent Assistant**! Engage standard prompts below or submit your custom questions for code reviews or doubt resolutions." }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const enrolledCoursesList = React.useMemo(() => {
    return enrollments
      .map(enr => courses.find(c => c.id === enr.courseId))
      .filter((c): c is Course => !!c);
  }, [enrollments, courses]);

  // Initialization: Fetch student catalog data
  useEffect(() => {
    fetchStudentRecords();
  }, [user.id, selectedCourse]);

  const fetchStudentRecords = async () => {
    try {
      const [enrRes, certRes, notRes, leadRes] = await Promise.all([
        fetch(`/api/enrollments/user/${user.id}`),
        fetch(`/api/certificates/user/${user.id}`),
        fetch(`/api/notifications/user/${user.id}`),
        fetch("/api/gamification/leaderboard")
      ]);

      const enrData = await enrRes.json();
      const certData = await certRes.json();
      const notData = await notRes.json();
      const leadData = await leadRes.json();

      setEnrollments(enrData);
      setCertificates(certData);
      setNotifications(notData);
      setLeaderboard(leadData);
    } catch (e) {
      console.error("Failed to sync student profiles from Express APIs", e);
    }
  };

  // Sync active lesson context note
  const activeEnrollment = selectedCourse ? enrollments.find(e => e.courseId === selectedCourse.id) : null;
  const activeLesson = selectedCourse?.modules
    .flatMap(m => m.lessons)
    .find(l => l.id === activeLessonId);

  useEffect(() => {
    if (activeEnrollment && activeLessonId) {
      setUserNoteText(activeEnrollment.notes?.[activeLessonId] || "");
      setAssignmentText("");
      setQuizSelectedOption(null);
      setQuizScoreReport(null);
      setActiveQuizIndex(0);
    }
  }, [activeLessonId, selectedCourse]);

  // Handle Enrollment
  const handleEnroll = async (courseId: string) => {
    try {
      const res = await fetch("/api/enrollments/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, courseId }),
      });
      if (res.ok) {
        await fetchStudentRecords();
        const updated = courses.find(c => c.id === courseId);
        if (updated) {
          setSelectedCourse(updated);
          const firstLes = updated.modules[0]?.lessons[0]?.id;
          if (firstLes) setActiveLessonId(firstLes);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mark Lesson complete
  const handleMarkComplete = async () => {
    if (!selectedCourse || !activeLessonId) return;
    try {
      const res = await fetch(`/api/enrollments/${selectedCourse.id}/lesson-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, lessonId: activeLessonId }),
      });
      if (res.ok) {
        await fetchStudentRecords();
        refreshUserData();
        if (activeLesson) {
          recordActivity("lesson", 50, `Completed Lesson: ${activeLesson.title}`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Bookmark toggle
  const handleToggleBookmark = async () => {
    if (!selectedCourse || !activeLessonId) return;
    try {
      const res = await fetch(`/api/enrollments/${selectedCourse.id}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, lessonId: activeLessonId }),
      });
      if (res.ok) {
        await fetchStudentRecords();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!selectedCourse || !activeLessonId) return;
    try {
      const res = await fetch(`/api/enrollments/${selectedCourse.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, lessonId: activeLessonId, noteText: userNoteText }),
      });
      if (res.ok) {
        await fetchStudentRecords();
        alert("Study takeaways successfully saved in file database ledger.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit project assignment
  const handleSubmitAssignment = async () => {
    if (!selectedCourse || !activeLessonId || !assignmentText) return;
    try {
      const res = await fetch(`/api/enrollments/${selectedCourse.id}/assignment-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, lessonId: activeLessonId, submissionText: assignmentText }),
      });
      if (res.ok) {
        await fetchStudentRecords();
        refreshUserData();
        setAssignmentText("");
        alert("Project submission received and auto-evaluated. +200 XP allocated!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit dynamic quiz
  const handleQuizSubmitAnswers = async () => {
    if (!selectedCourse || !activeLessonId || !activeLesson?.quizQuestions) return;
    
    // Evaluate options indexes
    let correctCount = 0;
    const questions = activeLesson.quizQuestions;
    // Assuming simple demo quiz completion is passed based on final quiz selected option
    // Calculate simulated results matching option
    const wasCorrectVal = quizSelectedOption === questions[activeQuizIndex].correctOptionIndex;
    if (wasCorrectVal) correctCount += 1;

    const finalScore = Math.round((correctCount / 1) * 100); // 1-question metric or base avg
    setQuizScoreReport({ score: finalScore, complete: true });

    try {
      const res = await fetch(`/api/enrollments/${selectedCourse.id}/quiz-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, lessonId: activeLessonId, scorePercent: finalScore }),
      });
      if (res.ok) {
        await fetchStudentRecords();
        refreshUserData();
        if (activeLesson) {
          recordActivity("quiz", 150, `Completed Quiz: ${activeLesson.title} with score ${finalScore}%`);
        }
        // Trigger completion mark automatically
        await handleMarkComplete();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger Gemini AI Assistance
  const handleQueryAI = async (customPrompt?: string) => {
    const activePrompt = customPrompt || chatInput;
    if (!activePrompt.trim()) return;

    setUserNoteText(""); // Clear unrelated local drafts
    setChatLogs(prev => [...prev, { sender: "user", text: activePrompt }]);
    if (!customPrompt) setChatInput("");
    setAiLoading(true);

    try {
      const response = await fetch("/api/gemini/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activePrompt,
          courseContext: selectedCourse,
          lessonContext: activeLesson,
          chatHistory: chatLogs.slice(-4), // Include short history context sliding window
        }),
      });
      const data = await response.json();
      setChatLogs(prev => [...prev, { sender: "ai", text: data.answer || "Could not generate tutor response." }]);
    } catch (err: any) {
      setChatLogs(prev => [...prev, { sender: "ai", text: `AI response failure: ${err?.message || err}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Complete Daily Streak Assessment
  const handleCompleteDailyQuest = async () => {
    try {
      const res = await fetch("/api/gamification/complete-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        await fetchStudentRecords();
        refreshUserData();
        recordActivity("quest", 250, "Conquered Daily Study Challenge Quest ⚡");
        alert("Daily study task complete! Streaks adjusted. +250 XP!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Generate official Certification
  const handleClaimDiploma = async (courseId: string) => {
    try {
      const res = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, courseId }),
      });
      if (res.ok) {
        await fetchStudentRecords();
        alert("Credential successfully generated and minted!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compute stats metrics
  const activeUnfinishedEnrollments = enrollments.filter(e => e.progress < 100);
  const finishedEnrollmentsCount = enrollments.filter(e => e.progress === 100).length;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors relative">
      
      {/* MOBILE HEADER BAR */}
      <header className="flex md:hidden items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 sticky top-0 z-30 w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            <BookOpen className="w-4.5 h-4.5" />
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

      {/* MODERN GLASS FLOATING SIDEBAR */}
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
                <BookOpen className="w-4.5 h-4.5" />
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

          {/* User profile capsule */}
          <div className={`flex items-center ${isSidebarCollapsed ? "md:justify-center md:p-1.5" : "gap-3 p-2.5"} mb-5 md:mb-6 rounded-2xl bg-slate-100/80 dark:bg-slate-950/50 border border-slate-200/20 dark:border-slate-850 shadow-inner overflow-hidden`}>
            <img 
              src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500 shrink-0"
              referrerPolicy="no-referrer"
            />
            {!isSidebarCollapsed && (
              <div className="text-left overflow-hidden">
                <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-semibold">Student</div>
                <div className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{user.name}</div>
              </div>
            )}
          </div>

          {/* Nav links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setSelectedCourse(null); setActiveTab("enrolled"); setIsMobileMenuOpen(false); }}
              className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-between"} ${
                activeTab === "enrolled" && !selectedCourse
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md transform translate-x-1 border-b-2 border-primary-600 dark:border-slate-300"
                  : "text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/90"
              }`}
              title="My Classes"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4.5 h-4.5 text-primary-500 shrink-0" />
                {!isSidebarCollapsed && <span>My Classes</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-xs px-1.5 py-0.5 rounded-lg font-bold transition-colors ${
                  activeTab === "enrolled" && !selectedCourse
                    ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}>
                  {enrollments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setSelectedCourse(null); setActiveTab("catalog"); setIsMobileMenuOpen(false); }}
              className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-between"} ${
                activeTab === "catalog" && !selectedCourse
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md transform translate-x-1 border-b-2 border-primary-600 dark:border-slate-300"
                  : "text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/90"
              }`}
              title="Explore Tracks"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                {!isSidebarCollapsed && <span>Explore Tracks</span>}
              </div>
            </button>

            <button
              onClick={() => { setSelectedCourse(null); setActiveTab("leaderboard"); setIsMobileMenuOpen(false); }}
              className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-between"} ${
                activeTab === "leaderboard" && !selectedCourse
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md transform translate-x-1 border-b-2 border-primary-600 dark:border-slate-300"
                  : "text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/90"
              }`}
              title="Leaderboard"
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4.5 h-4.5 text-yellow-500 shrink-0" />
                {!isSidebarCollapsed && <span>Leaderboard</span>}
              </div>
            </button>

            <button
              onClick={() => { setSelectedCourse(null); setActiveTab("certificates"); setIsMobileMenuOpen(false); }}
              className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold transition-all flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-between"} ${
                activeTab === "certificates" && !selectedCourse
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md transform translate-x-1 border-b-2 border-primary-600 dark:border-slate-300"
                  : "text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/90"
              }`}
              title="Certificates"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                {!isSidebarCollapsed && <span>Certificates</span>}
              </div>
            </button>
          </nav>

          {/* Premium Integrated Theme Toggler */}
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

        {/* Logout at bottom */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
          <button
            onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center ${isSidebarCollapsed ? "md:justify-center" : "justify-center gap-2"} py-2.5 px-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50/80 dark:hover:bg-rose-950/20 border border-slate-200/40 dark:border-slate-850 shadow-sm cursor-pointer active:scale-95 transition-all`}
            title="Log Out"
          >
            <LogOut className="w-4 h-4 shrink-0" /> 
            {!isSidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* PRIMARY WORKSPACE */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full overflow-x-hidden">
        
        {/* Course Interactive Classroom Mode overlay */}
        {selectedCourse ? (
          <div className="flex flex-col gap-6 text-left">
            {/* Header row */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="p-1 px-3 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Leave Stage
              </button>
              <span className="text-xs text-slate-400">/ Enrolled class / {selectedCourse.category}</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800">
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400">Active Specialization</span>
              <h1 className="font-display font-extrabold text-2xl mt-1">{selectedCourse.title}</h1>
              <p className="text-slate-400 text-sm mt-2 font-light max-w-3xl">{selectedCourse.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Syllabi modules index selection BAR Column */}
              <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col h-full">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 block">Curriculum Roadmap</span>
                
                <div className="space-y-4 flex-grow overflow-y-auto">
                  {selectedCourse.modules.map((m) => (
                    <div key={m.id} className="space-y-2">
                      <div className="font-semibold text-xs text-slate-500 font-display border-b border-slate-100 dark:border-slate-850 pb-1 uppercase">{m.title}</div>
                      <div className="space-y-1.5">
                        {m.lessons.map((l) => {
                          const isCompleted = activeEnrollment?.completedLessons.includes(l.id);
                          const isBookmarked = activeEnrollment?.bookmarkedLessons.includes(l.id);
                          return (
                            <button
                              key={l.id}
                              onClick={() => {
                                setActiveLessonId(l.id);
                              }}
                              className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all group ${
                                activeLessonId === l.id
                                  ? "bg-primary-500/10 dark:bg-primary-500/15 border-primary-500 text-primary-600 dark:text-primary-400 font-medium"
                                  : "bg-slate-55 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-805 text-slate-600 dark:text-slate-350 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-start gap-2.5 overflow-hidden">
                                {l.type === "video" ? <Video className="w-4.5 h-4.5 shrink-0 mt-0.5 text-slate-400" /> :
                                 l.type === "pdf" ? <FileText className="w-4.5 h-4.5 shrink-0 mt-0.5 text-slate-400" /> :
                                 l.type === "assignment" ? <FileSignature className="w-4.5 h-4.5 shrink-0 mt-0.5 text-slate-400" /> :
                                 <HelpCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-slate-400" />}
                                <span className="text-xs truncate">{l.title}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                {isBookmarked && <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-current" />}
                                {isCompleted ? (
                                  <span className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500 flex items-center justify-center text-emerald-500 font-bold text-[8px]">✓</span>
                                ) : (
                                  <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[8px] text-slate-400 opacity-60">○</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-400 mb-2 flex justify-between font-medium">
                    <span>Course Coursework Progress:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeEnrollment?.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full transition-all duration-500" 
                      style={{ width: `${activeEnrollment?.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Central Active Lecture Panel */}
              <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full overflow-hidden">
                {activeLesson ? (
                  <div className="space-y-6 flex flex-col h-full overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-500">Lesson Workspace</span>
                        <h2 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 leading-snug">{activeLesson.title}</h2>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleToggleBookmark}
                          className="p-1 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                        >
                          <Bookmark className={`w-4 h-4 ${activeEnrollment?.bookmarkedLessons.includes(activeLesson.id) ? "text-amber-500 fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Lesson core content conditional render */}
                    <div className="space-y-4 flex-grow">
                      {activeLesson.type === "video" && (
                        <div className="space-y-4">
                          <div className="aspect-video w-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white relative overflow-hidden group">
                            {/* Simulated custom video stage frame */}
                            <Video className="w-12 h-12 text-slate-600 group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="px-3.5 py-1.5 bg-white text-slate-950 rounded-xl text-xs font-bold tracking-wider uppercase">
                                Simulation Player Ready
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Pre-recorded Lecture Duration: {activeLesson.duration}
                          </div>
                        </div>
                      )}

                      {/* Lesson Notes and Reading block */}
                      <div className="prose dark:prose-invert prose-xs text-xs text-slate-600 dark:text-slate-300 max-w-none text-left leading-relaxed markdown-body">
                        <ReactMarkdown>
                          {activeLesson.content || "Ready to view this curricular block."}
                        </ReactMarkdown>
                      </div>

                      {/* Interactive Assignment submitting block */}
                      {activeLesson.type === "assignment" && (
                        <div className="p-4 rounded-xl bg-slate-55 dark:bg-slate-950 border border-slate-205 dark:border-slate-810 space-y-4 text-left">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            <FileSignature className="w-4 h-4 text-primary-500" />
                            Course Assignment Criteria:
                          </div>
                          <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed">
                            {activeLesson.assignmentText}
                          </p>

                          {activeEnrollment?.submittedAssignments[activeLesson.id] ? (
                            <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs">
                              <div className="font-semibold">&#10003; Evaluated successfully!</div>
                              <div className="mt-1 font-mono text-[10px]">Grade allocated: {activeEnrollment.submittedAssignments[activeLesson.id].grade}</div>
                              <div className="mt-1 text-slate-500">{activeEnrollment.submittedAssignments[activeLesson.id].feedback}</div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <textarea
                                value={assignmentText}
                                onChange={(e) => setAssignmentText(e.target.value)}
                                placeholder="Paste your React component layout code or design review description..."
                                className="w-full h-24 p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-primary-500 text-slate-800 dark:text-white"
                              />
                              <button
                                onClick={handleSubmitAssignment}
                                disabled={!assignmentText.trim()}
                                className="w-full py-1.5 bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-semibold text-xs rounded-xl hover:shadow cursor-pointer transition-all disabled:opacity-50"
                              >
                                Submit to AI Evaluator
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Quiz Engine block */}
                      {activeLesson.type === "quiz" && activeLesson.quizQuestions && (
                        <div className="p-4 rounded-xl bg-slate-55 dark:bg-slate-950 border border-slate-205 dark:border-slate-810 space-y-4 text-left">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-amber-500" />
                            Active Module Quiz assessment:
                          </div>

                          <div className="space-y-3">
                            <div className="text-xs font-medium text-slate-600 dark:text-slate-350 bg-slate-100 dark:bg-slate-900 p-3 rounded">
                              {activeLesson.quizQuestions[activeQuizIndex].text}
                            </div>
                            
                            <div className="space-y-1.5">
                              {activeLesson.quizQuestions[activeQuizIndex].options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  onClick={() => setQuizSelectedOption(oIdx)}
                                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                                    quizSelectedOption === oIdx
                                      ? "bg-primary-500/10 border-primary-500 text-primary-600 font-medium"
                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>

                          {quizScoreReport ? (
                            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                              <div className="font-bold text-indigo-500 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Assessment Score: {quizScoreReport.score}%
                              </div>
                              <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                                {activeLesson.quizQuestions[activeQuizIndex].explanation}
                              </p>
                              <button
                                onClick={() => setQuizScoreReport(null)}
                                className="mt-2.5 text-[10px] font-bold text-slate-400 hover:text-slate-500 transition underline block"
                              >
                                Retake Exam
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={handleQuizSubmitAnswers}
                              disabled={quizSelectedOption === null}
                              className="w-full py-2 bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-semibold text-xs rounded-xl hover:shadow cursor-pointer transition-all disabled:opacity-50"
                            >
                              Finalize & Submit Score
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lesson Notes/takeaways scratchpad */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto text-left space-y-2">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Save Course Takeaways (Notes):</span>
                        <button 
                          onClick={handleSaveNotes}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-primary-600 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Note
                        </button>
                      </div>
                      <textarea
                        value={userNoteText}
                        onChange={(e) => setUserNoteText(e.target.value)}
                        placeholder="Add study remarks or bullet code segments taken from notes..."
                        className="w-full h-16 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    {/* Completion control */}
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex items-center justify-between">
                      <div className="text-xs text-slate-400">Mark completed lesson?</div>
                      <button
                        onClick={handleMarkComplete}
                        disabled={activeEnrollment?.completedLessons.includes(activeLesson.id)}
                        className={`px-4 py-2 font-semibold text-xs rounded-xl shadow transition-all ${
                          activeEnrollment?.completedLessons.includes(activeLesson.id)
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25"
                            : "bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-650 hover:to-indigo-650 text-white cursor-pointer"
                        }`}
                      >
                        {activeEnrollment?.completedLessons.includes(activeLesson.id) ? "✓ Completed! (+50 XP)" : "✓ Finish Lesson (+50 XP)"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 max-w-sm mx-auto text-center">
                    <BookOpenCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
                    <h4 className="font-semibold text-sm">Interactive Syllabus Stage</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Select any module, video or assessment quiz from the left directory to initialize study progress.
                    </p>
                  </div>
                )}
              </div>

              {/* Server-Side Gemini AI Right Assistant panel */}
              <div className="lg:col-span-4 rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col h-full text-white overflow-hidden">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-bold font-display flex items-center gap-1.5">
                      NovaLearn AI Tutor
                    </h3>
                    <div className="text-[9px] text-slate-450 font-mono">Gemini 3.5 Active - Contextual doubt resolver</div>
                  </div>
                </div>

                <div className="flex-grow my-4 space-y-3 overflow-y-auto text-left pr-1 scrollbar-thin max-h-[300px] lg:max-h-[350px]">
                  {chatLogs.map((log, lIdx) => (
                    <div 
                      key={lIdx}
                      className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] markdown-body ${
                        log.sender === "user"
                          ? "bg-primary-600 ml-auto text-white rounded-br-none"
                          : "bg-slate-800/80 text-slate-200 border border-slate-800 rounded-bl-none prose prose-invert prose-xs"
                      }`}
                    >
                      <ReactMarkdown>
                        {log.text}
                      </ReactMarkdown>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="text-xs text-slate-400 flex items-center gap-2 italic bg-slate-800/50 p-2.5 rounded-lg border border-slate-800/40 w-[60%]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-400" />
                      Gemini is thinking...
                    </div>
                  )}
                </div>

                {/* AI Shortcut prompt generators */}
                <div className="space-y-1.5 mb-3">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-slate-500 text-left block">Instant curriculum commands</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleQueryAI("Generate course summaries of key modules.")}
                      disabled={aiLoading}
                      className="p-1.5 bg-slate-800 hover:bg-slate-750 transition text-[10px] rounded-lg text-slate-300 font-medium text-left truncate flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                      Summarize syllabus
                    </button>
                    <button
                      onClick={() => handleQueryAI(`Provide doubt-resolution and detailed explanation for lesson concepts of ${activeLesson?.title || "curriculum"}.`)}
                      disabled={aiLoading || !activeLesson}
                      className="p-1.5 bg-slate-800 hover:bg-slate-750 transition text-[10px] rounded-lg text-slate-300 font-medium text-left truncate flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Lightbulb className="w-3 h-3 text-primary-400 shrink-0" />
                      Explain this lesson
                    </button>
                  </div>
                </div>

                {/* User custom prompt text field input */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleQueryAI(); }}
                  className="flex items-center gap-1.5 border-t border-slate-800 pt-3"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about state logic, layouts, SQL..."
                    className="flex-grow p-2 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !chatInput.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 hover:shadow shadow-primary-500/20 text-white shrink-0 cursor-pointer transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* PERSONALIZED BANNER & XP LEADERBOARD */}
            <div className="p-6 md:p-8 rounded-[32px] bg-slate-900 text-white border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 text-left">
              <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-primary-600/10 rounded-full blur-[90px] pointer-events-none" />
              
              <div className="space-y-2 max-w-xl">
                <span className="text-xs font-mono uppercase tracking-widest text-primary-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  Daily study challenges active
                </span>
                <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight leading-tight">
                  Welcome to NovaLearn, {user.name}!
                </h1>
                <p className="text-slate-400 text-xs md:text-sm font-light leading-relaxed">
                  You accumulated **{user.xp} status XP** across your courses. Finish daily challenges to raise your rank, earn certifications, or query lesson debugs.
                </p>

                {/* Daily quests triggers and progress rewards */}
                <div className="pt-3">
                  <button
                    onClick={handleCompleteDailyQuest}
                    className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg shadow-orange-500/20 font-bold text-xs uppercase text-slate-950 inline-flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102"
                  >
                    Claim Daily Quest reward (+250 XP) ⚡
                  </button>
                </div>
              </div>

              {/* Status Ring / XP Heatmap Circle metrics widget */}
              <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 flex items-center gap-4 shrink-0">
                <div className="w-14 h-14 rounded-full border-4 border-primary-500/30 border-t-primary-500 flex items-center justify-center font-mono font-bold text-lg text-primary-400 animate-pulse">
                  {user.streak || 0}d
                </div>
                <div className="text-left select-none">
                  <div className="text-slate-450 font-mono text-[9px] uppercase tracking-wider">Learning Streak active</div>
                  <div className="font-bold text-sm text-slate-200">Consistent Scholar Path</div>
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-current" /> badges claimed: {user.badges.length || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* CONDITIONAL SUBTABS LAYOUT PANEL */}
            {activeTab === "enrolled" && (
              <div className="space-y-6 text-left">
                
                {/* 30-DAY LEARNING STREAK CALENDAR CARD */}
                <div id="learning-streak-calendar-card" className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-all duration-300 depth-card-3d">
                  <div className="flex flex-col lg:flex-row gap-6 justify-between items-stretch">
                    
                    {/* Left: Streak calendar grid */}
                    <div className="flex-grow space-y-4 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-orange-500">
                          <Flame className="w-5 h-5 fill-current animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            30-Day Learning Streak Calendar
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Your active study habits and course progress tracked over the past 30 days.
                          </p>
                        </div>
                      </div>

                      {/* Circles Grid (10 Columns x 3 Rows) */}
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 max-w-xl py-2">
                        {past30Days.map((date) => {
                          const dateStr = date.toISOString().split("T")[0];
                          const dayActivity = activeDays[dateStr];
                          const isSelected = selectedCalendarDateStr === dateStr;

                          // Dynamic coloring based on activity level & type
                          let circleColorClass = "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500";
                          let ringColorClass = isSelected ? "ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900" : "";
                          
                          if (dayActivity) {
                            if (dayActivity.type === "lesson") {
                              circleColorClass = "bg-sky-500 text-white shadow-sm shadow-sky-500/20 hover:bg-sky-600";
                            } else if (dayActivity.type === "quiz") {
                              circleColorClass = "bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-600";
                            } else if (dayActivity.type === "quest") {
                              circleColorClass = "bg-amber-500 text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600";
                            }
                          }

                          const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                          return (
                            <motion.button
                              key={dateStr}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedCalendarDateStr(dateStr)}
                              className={`aspect-square w-full rounded-full flex flex-col items-center justify-center font-mono text-[10px] font-bold cursor-pointer transition-colors relative group ${circleColorClass} ${ringColorClass}`}
                              title={`${formattedDate}: ${dayActivity ? `${dayActivity.details} (+${dayActivity.xp} XP)` : "Rest Day"}`}
                            >
                              <span>{date.getDate()}</span>
                              
                              {/* Pulsing glow if today */}
                              {dateStr === new Date("2026-07-03T12:00:00Z").toISOString().split("T")[0] && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                              )}
                              
                              {/* Small dot indicating today */}
                              {dateStr === new Date("2026-07-03T12:00:00Z").toISOString().split("T")[0] && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white dark:border-slate-900" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Legend Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" /> No Activity
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Lesson (+50 XP)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Quiz (+150 XP)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Quest (+250 XP)
                        </span>
                      </div>
                    </div>

                    {/* Right: Selected day panel */}
                    <div className="w-full lg:w-72 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between text-left shrink-0">
                      <div>
                        <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400 mb-1">
                          Date Selection
                        </div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {new Date(selectedCalendarDateStr + "T12:00:00Z").toLocaleDateString("en-US", { 
                            weekday: "long", 
                            month: "short", 
                            day: "numeric", 
                            year: "numeric" 
                          })}
                        </div>

                        {activeDays[selectedCalendarDateStr] ? (
                          <div className="mt-4 space-y-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              activeDays[selectedCalendarDateStr].type === "lesson" ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" :
                              activeDays[selectedCalendarDateStr].type === "quiz" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" :
                              "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}>
                              ★ Study Completed
                            </span>
                            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                              {activeDays[selectedCalendarDateStr].details}
                            </div>
                            <div className="text-[11px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> XP earned: +{activeDays[selectedCalendarDateStr].xp} XP
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 space-y-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              Rest Day
                            </span>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              No study activities recorded on this date. Keep your streaks active!
                            </p>
                            
                            {/* Interactive logging for empty slot */}
                            <button
                              onClick={() => {
                                const todayStr = new Date("2026-07-03T12:00:00Z").toISOString().split("T")[0];
                                setActiveDays(prev => ({
                                  ...prev,
                                  [selectedCalendarDateStr]: {
                                    type: "lesson",
                                    xp: 15,
                                    details: "Retroactive Study Session Logged 📚"
                                  }
                                }));
                              }}
                              className="w-full mt-2 py-2 px-3 bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 hover:shadow cursor-pointer transition-all active:scale-98"
                            >
                              <span>Log study session (+15 XP)</span>
                              <BookOpenCheck className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-850 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                        <span>Daily Quest Status:</span>
                        <span className={activeDays[new Date("2026-07-03T12:00:00Z").toISOString().split("T")[0]]?.type === "quest" ? "text-amber-500 font-bold" : "text-slate-500"}>
                          {activeDays[new Date("2026-07-03T12:00:00Z").toISOString().split("T")[0]]?.type === "quest" ? "CLAIMED 🔥" : "NOT CLAIMED"}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* WEEKLY ANALYTICS HUB */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
                  {/* Card 1: Weekly Study Hours */}
                  <div className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/5 depth-card-3d group text-left w-full min-w-0">
                    <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[40px] pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-4 text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-500">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                            Weekly Study Hours
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium">
                            Hours spent in lessons and challenges
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                          {weeklyChartData.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1)}h
                        </div>
                        <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">
                          This Week Total
                        </div>
                      </div>
                    </div>

                    {/* Chart Area */}
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={weeklyChartData}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "rgba(148, 163, 184, 0.75)", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)" }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "rgba(148, 163, 184, 0.75)", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)" }}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="glass-premium p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-left shadow-lg">
                                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                                      {payload[0].payload.name}day, {payload[0].payload.dateStr}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                        Study: <span className="font-black text-slate-900 dark:text-white font-mono">{payload[0].value} hrs</span>
                                      </p>
                                    </div>
                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 italic">
                                      {Number(payload[0].value) >= 3 ? "🔥 High Focus Session!" : Number(payload[0].value) > 0 ? "⚡ Daily Target Achieved" : "Rest Day"}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="hours" 
                            stroke="var(--color-primary-500)" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorHours)" 
                            activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-primary-500)" }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Card 2: Quiz Performance */}
                  <div className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-emerald-500/5 depth-card-3d group text-left w-full min-w-0">
                    <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-4 text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                            Quiz Performance
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium">
                            Average test scores & conceptual mastery
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                          {(() => {
                            const scores = weeklyChartData.filter(d => d.quizScore > 0);
                            return scores.length > 0 
                              ? Math.round(scores.reduce((acc, curr) => acc + curr.quizScore, 0) / scores.length)
                              : 85;
                          })()}%
                        </div>
                        <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">
                          Weekly Average
                        </div>
                      </div>
                    </div>

                    {/* Chart Area */}
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={weeklyChartData}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "rgba(148, 163, 184, 0.75)", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)" }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 100]}
                            tick={{ fill: "rgba(148, 163, 184, 0.75)", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)" }}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="glass-premium p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-left shadow-lg">
                                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                                      {payload[0].payload.name}day, {payload[0].payload.dateStr}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                        Score: <span className="font-black text-slate-900 dark:text-white font-mono">{payload[0].value}%</span>
                                      </p>
                                    </div>
                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 italic">
                                      {Number(payload[0].value) >= 90 ? "👑 Elite Mastery Achieved" : Number(payload[0].value) >= 80 ? "✨ Satisfactory Pass" : Number(payload[0].value) > 0 ? "⚡ Study More Needed" : "No Exams Taken"}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="quizScore" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorQuiz)" 
                            activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* AI STUDY PLANNER WIDGET */}
                <div className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden transition-all duration-300 depth-card-3d">
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[60px] pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-500">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            AI Study Planner
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Suggest dynamic daily schedules based on active enrollments and deadlines using standard Gemini AI logic.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                    {/* Input Controls */}
                    <div className="lg:col-span-1 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Daily Study Target
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 6].map((hours) => (
                            <button
                              key={hours}
                              onClick={() => setPlannerHours(hours)}
                              className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer active:scale-95 ${
                                plannerHours === hours
                                  ? "bg-primary-600 border-primary-600 text-white shadow"
                                  : "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {hours}h
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Focus Area / Learning Goal
                        </label>
                        <input
                          type="text"
                          value={plannerFocus}
                          onChange={(e) => setPlannerFocus(e.target.value)}
                          placeholder="e.g. Master CSS grid alignments, pass next quiz"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <button
                        onClick={handleGenerateStudyPlan}
                        disabled={generatingPlan}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:shadow transition disabled:opacity-60 cursor-pointer active:scale-98"
                      >
                        {generatingPlan ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Crafting Personalized Schedule...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>Generate AI Schedule</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Output display */}
                    <div className="lg:col-span-2 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 p-5 flex flex-col justify-between min-h-[220px]">
                      {aiPlanResult ? (
                        <div className="space-y-4">
                          <div className="prose prose-slate dark:prose-invert max-w-none text-xs text-slate-600 dark:text-slate-300 leading-relaxed overflow-y-auto max-h-[300px] pr-2 custom-markdown">
                            <ReactMarkdown>{aiPlanResult}</ReactMarkdown>
                          </div>
                          <div className="flex justify-end border-t border-slate-100 dark:border-slate-800/50 pt-3">
                            <button
                              onClick={() => {
                                setAiPlanResult(null);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 text-[10px] font-bold cursor-pointer transition"
                            >
                              Clear Schedule
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center my-auto text-center p-6 select-none">
                          <Lightbulb className="w-10 h-10 text-amber-400 mb-3 animate-pulse" />
                          <h4 className="font-display font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">
                            Your Daily Schedule Suggestions are Ready
                          </h4>
                          <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm leading-normal">
                            Click the button to process your {enrollments.length} active course enrollments and prompt Gemini for an optimized deep work routine!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">Enrolled Specializations</h2>
                  <button 
                    onClick={() => setActiveTab("catalog")}
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline"
                  >
                    Explore full list <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {enrollments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enr) => {
                      const associatedCourse = courses.find(c => c.id === enr.courseId);
                      if (!associatedCourse) return null;
                      return (
                        <div 
                          key={enr.id}
                          onClick={() => handleCardClick(associatedCourse)}
                          className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-805 text-left flex flex-col justify-between overflow-hidden group depth-card-3d cursor-pointer"
                        >
                          {/* Course Thumbnail */}
                          <div className="relative h-40 w-full overflow-hidden shrink-0">
                            <img 
                              src={associatedCourse.thumbnail} 
                              alt={associatedCourse.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-[10px] font-mono font-semibold text-slate-200 border border-white/10 uppercase">
                              {associatedCourse.category}
                            </div>
                            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                              ★ {associatedCourse.rating.toFixed(1)}
                            </div>
                          </div>

                          <div className="p-6 flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase font-semibold text-slate-500">
                                  {associatedCourse.category}
                                </span>
                                <span className="text-[11px] font-mono text-indigo-500 font-semibold">{enr.progress}% Completed</span>
                              </div>
                              <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {associatedCourse.title}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-6">
                                {associatedCourse.description}
                              </p>
                            </div>

                          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                            <div className="w-full bg-slate-150 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full" style={{ width: `${enr.progress}%` }} />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCourse(associatedCourse);
                                const firstL = associatedCourse.modules[0]?.lessons[0]?.id;
                                if (firstL) setActiveLessonId(firstL);
                              }}
                              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                            >
                              <span>Enter Virtual Classroom</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            {enr.progress === 100 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaimDiploma(associatedCourse.id);
                                }}
                                className="w-full py-1.5 bg-emerald-500/10 border border-emerald-500 text-emerald-500 hover:bg-emerald-500/15 text-xs rounded-xl font-bold transition-all"
                              >
                                Mint Certificate Document ✓
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 text-center border border-slate-200 dark:border-slate-805 max-w-lg mx-auto">
                    <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3 animate-pulse" />
                    <h3 className="font-display font-bold text-lg mb-1.5Content text-slate-900 dark:text-slate-100">No active course enrollments</h3>
                    <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed mb-6">
                      Embark on your very first curriculum of software web programming, vector architectures, or generative AI models.
                    </p>
                    <button
                      onClick={() => setActiveTab("catalog")}
                      className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold rounded-xl hover:shadow cursor-pointer transition"
                    >
                      Browse Available Academic Tracks
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "catalog" && (
              <div className="space-y-6 text-left">
                <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">Explore Curriculum Catalog</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.filter(c => c.isPublished).map((crs) => {
                    const isEnrolled = enrollments.some(e => e.courseId === crs.id);
                    return (
                      <div 
                        key={crs.id}
                        onClick={() => handleCardClick(crs)}
                        className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 flex flex-col overflow-hidden group justify-between depth-card-3d cursor-pointer"
                      >
                        {/* Course Thumbnail */}
                        <div className="relative h-40 w-full overflow-hidden shrink-0">
                          <img 
                            src={crs.thumbnail} 
                            alt={crs.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-[10px] font-mono font-semibold text-slate-200 border border-white/10 uppercase">
                            {crs.category}
                          </div>
                          <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                            ★ {crs.rating.toFixed(1)}
                          </div>
                        </div>

                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase font-semibold text-slate-500">
                                {crs.category}
                              </span>
                              <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">★ {crs.rating.toFixed(1)}</span>
                            </div>
                            <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100 mb-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">{crs.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-3 mb-6">{crs.description}</p>
                          </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-805 flex items-center justify-between">
                          <span className="font-display font-bold text-base text-primary-500">${crs.price || "0.00"}</span>
                          {isEnrolled ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCourse(crs);
                                const firstL = crs.modules[0]?.lessons[0]?.id;
                                if (firstL) setActiveLessonId(firstL);
                              }}
                              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl font-semibold hover:bg-slate-200 transition cursor-pointer"
                            >
                              Resume Class
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnroll(crs.id);
                              }}
                              className="px-5 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:from-primary-650 hover:to-indigo-650 text-xs rounded-xl font-semibold hover:shadow transition cursor-pointer"
                            >
                              Join Sandbox Enrollment
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div className="space-y-6 text-left max-w-xl mx-auto">
                <div className="text-center">
                  <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2 animate-bounce" />
                  <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">Global Scholar Leaderboard</h2>
                  <p className="text-xs text-slate-400 mt-1">Strengthen your status XP by executing daily tasks, completed modules, and excellent quiz results.</p>
                </div>

                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-805 overflow-hidden shadow">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-850">
                    <span className="w-12 text-center">Rank</span>
                    <span className="flex-grow pl-6 text-left">Academic Name</span>
                    <span className="w-16 text-right">Streak</span>
                    <span className="w-20 text-right">XP Total</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-850">
                    {leaderboard.map((leadUser) => (
                      <div 
                        key={leadUser.userId}
                        className={`p-4 flex items-center justify-between text-xs font-medium transition-colors ${
                          leadUser.userId === user.id ? "bg-primary-500/5 font-semibold border-l-2 border-primary-550" : "hover:bg-slate-50 dark:hover:bg-slate-950/40"
                        }`}
                      >
                        {/* Rank tag */}
                        <span className="w-12 text-center font-display font-semibold text-slate-500">
                          {leadUser.rank === 1 ? "🥇 1" : leadUser.rank === 2 ? "🥈 2" : leadUser.rank === 3 ? "🥉 3" : `# ${leadUser.rank}`}
                        </span>

                        {/* Name and avatar info */}
                        <div className="flex-grow pl-6 flex items-center gap-3">
                          <img 
                            src={leadUser.userAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${leadUser.userName}`}
                            alt={leadUser.userName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200/50"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-slate-800 dark:text-slate-100">{leadUser.userName}</span>
                        </div>

                        {/* Streak */}
                        <span className="w-16 text-right font-mono text-amber-500 flex items-center justify-end gap-1 font-semibold">
                          🔥{leadUser.streak || 0}
                        </span>

                        {/* Total XP */}
                        <span className="w-20 text-right font-mono text-indigo-500 font-bold">{leadUser.xp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "certificates" && (
              <div className="space-y-6 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">My Earned Certificates</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Validate your academic excellence with verified digital diplomas. Print or download as custom high-fidelity PDFs.
                    </p>
                  </div>
                </div>
                
                {certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((cert) => (
                      <div 
                        key={cert.id}
                        className="rounded-3xl border border-double border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-md relative overflow-hidden flex flex-col justify-between text-center select-none"
                        style={{ borderSpacing: "8px" }}
                      >
                        {/* Frame corner decorative blocks */}
                        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary-500" />
                        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary-500" />
                        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary-500" />
                        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary-500" />

                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-500 border border-primary-200 dark:border-primary-800 mb-2">
                              <Award className="w-8 h-8" />
                            </div>
                          </div>
                          
                          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Official Diploma of Specialization Complete</span>
                          <h3 className="font-display font-bold text-xl text-slate-800 dark:text-slate-150 leading-tight">
                            {cert.courseTitle}
                          </h3>

                          <div className="text-slate-500 text-xs">
                            This academic credential certifies that
                            <div className="font-display font-bold text-base text-slate-800 dark:text-slate-100 my-1">{cert.userName}</div>
                            successfully fulfilled all modular requirements, project assignments, and exams led by LearnSphere instructors.
                          </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-850 flex flex-col gap-4">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="text-left font-light">
                              <div className="text-[10px] text-slate-400">Issuer Verification Date:</div>
                              <div className="font-semibold">{cert.issueDate}</div>
                            </div>
                            <div className="text-right font-light">
                              <div className="text-[10px] text-slate-400">Verification ID:</div>
                              <div className="font-mono font-semibold truncate text-[9px] text-indigo-500">{cert.uuid}</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => setViewingCertificate(cert)}
                              className="w-2/3 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer active:scale-98"
                            >
                              <Award className="w-4 h-4" />
                              <span>View & Print</span>
                            </button>
                            <button
                              onClick={() => setSharingCertificateId(sharingCertificateId === cert.id ? null : cert.id)}
                              className="w-1/3 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer active:scale-98"
                              title="Share Certificate"
                            >
                              <Share2 className="w-4 h-4" />
                              <span>Share</span>
                            </button>
                          </div>

                          {sharingCertificateId === cert.id && (
                            <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800 text-left space-y-2">
                              <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Share verification URL:</div>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => {
                                    const shareUrl = `${window.location.origin}/verify-credential/${cert.uuid}`;
                                    const text = `I'm proud to share that I've completed the "${cert.courseTitle}" specialization on LearnSphere! 🎓 Verify my credentials here:`;
                                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=400");
                                  }}
                                  className="py-1.5 px-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/15 text-[#1DA1F2] border border-[#1DA1F2]/20 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                                >
                                  <Twitter className="w-3.5 h-3.5" />
                                  <span>Twitter / X</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const shareUrl = `${window.location.origin}/verify-credential/${cert.uuid}`;
                                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=500");
                                  }}
                                  className="py-1.5 px-2 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/15 text-[#0A66C2] border border-[#0A66C2]/20 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                                >
                                  <Linkedin className="w-3.5 h-3.5" />
                                  <span>LinkedIn</span>
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  const shareUrl = `${window.location.origin}/verify-credential/${cert.uuid}`;
                                  navigator.clipboard.writeText(shareUrl);
                                  setCopiedId(cert.id);
                                  setTimeout(() => setCopiedId(null), 2500);
                                }}
                                className="w-full py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
                              >
                                <Link className="w-3.5 h-3.5" />
                                <span>{copiedId === cert.id ? "Link Copied! ✓" : "Copy Verification Link"}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl text-center border border-slate-200/80 dark:border-slate-805 max-w-md mx-auto">
                    <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <h3 className="font-display font-bold text-lg mb-1 text-slate-900 dark:text-slate-100">No graduation certificates yet</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Certificates generate dynamically once any enrollment tracks reach **100% completion status**. Explore modules and pass assessments to claim yours!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* HIGH-FIDELITY PRINTABLE CERTIFICATE VIEWING MODAL */}
            {viewingCertificate && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:p-0 print:bg-white print:backdrop-blur-none overflow-y-auto">
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    /* Hide everything except the printable container */
                    body * {
                      visibility: hidden !important;
                    }
                    #printable-certificate-modal, #printable-certificate-modal * {
                      visibility: visible !important;
                    }
                    #printable-certificate-modal {
                      position: fixed !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 297mm !important; /* Standard A4 landscape width */
                      height: 210mm !important; /* Standard A4 landscape height */
                      margin: 0 !important;
                      padding: 15mm !important;
                      background: white !important;
                      color: black !important;
                      box-shadow: none !important;
                      border: 12px double #334155 !important;
                      border-radius: 0 !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                  @page {
                    size: A4 landscape;
                    margin: 0;
                  }
                `}} />

                <div className="relative w-full max-w-4xl my-auto">
                  {/* Floating Action Toolbar (Screen Only) */}
                  <div className="no-print flex justify-between items-center bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white rounded-2xl p-4 mb-4 shadow-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-primary-500/10 text-primary-400 rounded-lg">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">Verified Credential</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{viewingCertificate.uuid}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/verify-credential/${viewingCertificate.uuid}`;
                          const text = `I'm proud to share that I've completed the "${viewingCertificate.courseTitle}" specialization on LearnSphere! 🎓 Verify my credentials here:`;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=400");
                        }}
                        className="p-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/20 hover:border-[#1DA1F2]/40 text-[#1DA1F2] rounded-xl transition cursor-pointer"
                        title="Post to Twitter / X"
                      >
                        <Twitter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/verify-credential/${viewingCertificate.uuid}`;
                          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=500");
                        }}
                        className="p-2 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/20 hover:border-[#0A66C2]/40 text-[#0A66C2] rounded-xl transition cursor-pointer"
                        title="Post to LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/verify-credential/${viewingCertificate.uuid}`;
                          navigator.clipboard.writeText(shareUrl);
                          setCopiedId(viewingCertificate.id);
                          setTimeout(() => setCopiedId(null), 2500);
                        }}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        title="Copy Verification Link"
                      >
                        <Link className="w-4 h-4" />
                        <span>{copiedId === viewingCertificate.id ? "Copied! ✓" : "Copy Link"}</span>
                      </button>
                      
                      <div className="w-[1px] h-6 bg-slate-800 mx-1" />

                      <button
                        onClick={() => window.print()}
                        className="py-2 px-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print or Save PDF</span>
                      </button>
                      <button
                        onClick={() => setViewingCertificate(null)}
                        className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                        title="Close Modal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* High Fidelity Certificate Paper Layout */}
                  <div 
                    id="printable-certificate-modal"
                    className="relative w-full aspect-auto md:aspect-[1.414/1] bg-white text-slate-950 p-6 md:p-14 rounded-3xl border-8 md:border-[16px] border-double border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between text-center select-none overflow-hidden transition-all duration-500 hover:scale-[1.015] hover:shadow-indigo-500/15"
                  >
                    {/* Background Subtle Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.015] dark:opacity-[0.035]">
                      <Award className="w-[80%] h-[80%] text-slate-900" />
                    </div>

                    {/* Floating Premium Verified Badge */}
                    <div className="absolute top-4 right-4 md:top-10 md:right-10 z-20">
                      <div className="glass-premium px-2.5 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5 md:gap-2 shadow-md text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500 animate-pulse" />
                        <span className="text-[7px] md:text-[9px] font-mono font-black tracking-wider md:tracking-widest uppercase">
                          SECURE VERIFIED
                        </span>
                      </div>
                    </div>

                    {/* Frame corner decorative blocks */}
                    <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-slate-400 dark:border-slate-600" />
                    <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-slate-400 dark:border-slate-600" />
                    <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-slate-400 dark:border-slate-600" />
                    <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-slate-400 dark:border-slate-600" />

                    {/* Certificate Content Header */}
                    <div className="space-y-4">
                      <div className="flex justify-center items-center gap-2 mb-1">
                        <Award className="w-7 h-7 text-indigo-650" />
                        <span className="font-display font-black text-xl tracking-widest text-slate-900 uppercase">
                          LearnSphere
                        </span>
                      </div>
                      <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto" />
                      <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-slate-500 font-bold block">
                        Academic Credentials Board of Directors
                      </span>
                    </div>

                    {/* Certificate Body */}
                    <div className="my-auto space-y-4 py-4">
                      <span className="text-[11px] italic text-slate-400 font-serif">This certifies and recognizes that</span>
                      
                      <div className="font-display font-black text-3xl md:text-4xl text-slate-900 tracking-tight my-2">
                        {viewingCertificate.userName}
                      </div>

                      <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                        has successfully fulfilled all rigorous academic modular curriculums, completed core sandbox coursework, solved dynamic program assessments, and passed specialized exams to earn the verified credentials of complete graduation in
                      </p>

                      <div className="inline-block py-2 px-6 bg-slate-50 border border-slate-200/60 rounded-2xl text-slate-900 font-display font-extrabold text-lg md:text-xl tracking-tight shadow-sm">
                        {viewingCertificate.courseTitle}
                      </div>
                    </div>

                    {/* Signatures & Security Ledger Blocks */}
                    <div className="pt-6 mt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                      {/* Left Signature */}
                      <div className="flex flex-col items-center">
                        <div className="font-serif italic text-sm text-slate-800 h-8 flex items-end">
                          Dr. Angela Cooper
                        </div>
                        <div className="h-[1px] w-32 bg-slate-300 my-1" />
                        <span className="text-[8px] font-mono tracking-wider uppercase text-slate-400">
                          Dean of Academic Studies
                        </span>
                      </div>

                      {/* Middle: Gold Gilded Seal */}
                      <div className="flex justify-center">
                        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                          {/* Outer Gilded Star Ring */}
                          <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-500 animate-spin-slow opacity-90" style={{ animationDuration: '60s' }} />
                          {/* Inner Radial Seal Core */}
                          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-400 flex flex-col items-center justify-center shadow-lg relative">
                            <Sparkles className="w-7 h-7 text-white drop-shadow" />
                            <span className="text-[6px] font-mono text-white/90 uppercase tracking-widest font-black absolute bottom-2">
                              VERIFIED
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Signature */}
                      <div className="flex flex-col items-center">
                        <div className="font-serif italic text-sm text-slate-800 h-8 flex items-end">
                          Catherine Vance
                        </div>
                        <div className="h-[1px] w-32 bg-slate-300 my-1" />
                        <span className="text-[8px] font-mono tracking-wider uppercase text-slate-400">
                          Registrar & Records Board
                        </span>
                      </div>
                    </div>

                    {/* Hash Ledger Verification Footer */}
                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-[9px] font-mono text-slate-400 gap-2 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1">
                        <span className="font-bold">Credential Date:</span>
                        <span>{viewingCertificate.issueDate}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        <span className="font-bold">Hash Verified:</span>
                        <span className="text-indigo-600 font-semibold">{viewingCertificate.uuid}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* REUSABLE ENROLLMENT MODAL */}
      <EnrollmentModal
        course={enrollPromptCourse}
        onClose={() => setEnrollPromptCourse(null)}
        onEnroll={handleEnroll}
        theme={theme || "dark"}
      />

      {/* FLOATING AI TUTOR HUB */}
      <AITutorWidget
        user={user}
        courses={courses}
        enrolledCourses={enrolledCoursesList}
        activeCourse={selectedCourse}
        activeLesson={activeLesson || null}
      />

    </div>
  );
}
