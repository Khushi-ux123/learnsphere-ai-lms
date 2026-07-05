/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BookOpen, Award, ShieldCheck, Sparkles, Target, Zap, Clock, 
  ThumbsUp, ArrowRight, Star, GraduationCap, ChevronDown, Check, 
  Video, FileText, Cpu, Laptop, CheckCircle, BarChart3, Users, 
  Sun, Moon, Menu, X, CreditCard, Lock as SecureLock 
} from "lucide-react";
import { Course, User } from "../types";

interface LandingPageProps {
  onStartLearning: (role?: "student" | "instructor" | "admin") => void;
  onLoginSuccess: (user: User, token: string) => void;
  courses: Course[];
  theme: "light" | "dark" | null;
  toggleTheme: () => void;
}

export default function LandingPage({ onStartLearning, onLoginSuccess, courses, theme, toggleTheme }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Interactive Filter States
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Enrollment & Simulated Payment Modal States
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modalStep, setModalStep] = useState<"preview" | "checkout" | "processing" | "success">("preview");
  const [checkoutMode, setCheckoutMode] = useState<"sandbox" | "new">("sandbox");
  
  // Registration Form States for checkout on-the-fly
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("password123");
  
  // Card Payment Simulation States
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [processingText, setProcessingText] = useState("Contacting merchant node...");

  const categories = ["All", "Development", "Design", "Science", "Finance", "Business"];

  const stats = [
    { label: "Active Cultivated Minds", value: "10,000+" },
    { label: "Graduated Professionals", value: "4,200+" },
    { label: "Expert Faculty Advisors", value: "45" },
    { label: "AI Queries Answered Weekly", value: "128K" },
  ];

  const plans = [
    {
      name: "Starter Scholar",
      price: "$0",
      description: "Explore standard course paths with local browser tracking credentials.",
      features: [
        "Audit 3 introductory specializations",
        "Community study circles",
        "Daily micro-challenges",
        "Limited tutor summaries"
      ],
      cta: "Join Student Sandbox",
      role: "student" as const,
      popular: false
    },
    {
      name: "Venture Academy Pass",
      price: "$29",
      period: "/month",
      description: "The complete suite for aspiring elite software and creative professionals.",
      features: [
        "Access to all 120+ courses & modules",
        "Unlimited Gemini AI Doubt Resolution",
        "Certified Blockchain Credential ID",
        "Custom PDF Notebook Summaries",
        "Leaderboard priority ranking",
        "Instructor assignment evaluations"
      ],
      cta: "Embark Premium Path",
      role: "student" as const,
      popular: true
    },
    {
      name: "Mentor Syndicate",
      price: "Revenue Share",
      description: "For elite engineers, designers, and scientists intent on broadcasting insight.",
      features: [
        "Advanced modular syllabus builder",
        "Student enrollment telemetry analytics",
        "Direct monetization payout APIs",
        "Video lecture storage pipelines",
        "Admin rapid publication access"
      ],
      cta: "Join Leading Faculty",
      role: "instructor" as const,
      popular: false
    }
  ];

  const instructors = [
    {
      name: "Dr. Angela Cooper",
      role: "Ex-Staff AI Infrastructure Architect",
      institution: "Stanford Engineering Faculty",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250&auto=format&fit=crop"
    },
    {
      name: "Marcus Aurelius",
      role: "Director of Spatial Symbology",
      institution: "Metropolitan Design Guild",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=250&auto=format&fit=crop"
    },
    {
      name: "Elena Petrov",
      role: "Deep Math Lead Scholar",
      institution: "Bratislava Cybernetics Institute",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250&auto=format&fit=crop"
    }
  ];

  const successTimeline = [
    {
      year: "Phase 1: Explore & Onboard",
      title: "Venture-grade Course Curation",
      desc: "Enroll in clean computer science tracks, advanced AI reasoning, or Stripe-inspired interface designs with responsive layouts."
    },
    {
      year: "Phase 2: Engage & Complete",
      title: "Interactive State Quizzes & Projects",
      desc: "Submit functional development models and take timed assessments to earn status XP and daily streak multipliers."
    },
    {
      year: "Phase 3: Verify & Deploy",
      title: "AI Review & Global Certification Ledger",
      desc: "Download official high-contrast verification diplomas backed by a unique ledger hash ready for LinkedIn spotlighting."
    }
  ];

  const faqs = [
    {
      q: "What makes LearnSphere fundamentally different from Coursera or Udemy?",
      a: "LearnSphere leverages a dual-engine architecture: (1) Server-side Gemini 3.5 Artificial Intelligence that reads course modules contextually and explains complex doubt queries in real-time, and (2) Gamified state telemetry that maps learning streak calendars, XP badges, and public leaderboard ranks."
    },
    {
      q: "Are the certificate credential verification hashes secure?",
      a: "Yes. Every student who reaches 100% completion on a curriculum track builds an official verification certificate. This generates a unique, immutable validation hash stored in our server's ledger file. Recruiters can verify identity and metrics directly on our verification portal."
    },
    {
      q: "How does the AI Study Assistant keep context?",
      a: "The Express API routes proxy queries using the Gemini 3.5 Flash server model. We merge the active course outline, modules, and specific lesson files so that the AI understands exactly which video or PDF notes you are referencing."
    },
    {
      q: "Is there a role-based playground to test out all options?",
      a: "Absolutely! We seeded the platform with default mock users for Students, Instructors, and Admin roles. Use the quick launch buttons in our modern hero layout to instant-preview each rich dashboard experience."
    }
  ];

  // Filters published courses based on chosen category tab
  const filteredCourses = courses.filter((c) => {
    if (!c.isPublished) return false;
    if (activeCategory === "All") return true;
    return c.category.toLowerCase() === activeCategory.toLowerCase();
  });

  // Limits number of courses shown unless "show all" directory is open
  const displayedCourses = showAllCourses ? filteredCourses : filteredCourses.slice(0, 3);

  // Opens Course Modal
  const openCourseModal = (course: Course) => {
    setSelectedCourse(course);
    setModalStep("preview");
    setPaymentError(null);
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardName("");
    setRegName("");
    setRegEmail("");
  };

  // Handles Simulated Payment Processing
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    if (checkoutMode === "new" && (!regName || !regEmail)) {
      setPaymentError("Please input your name and email to establish a student record.");
      return;
    }

    if (selectedCourse.price > 0) {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setPaymentError("Please input a valid 16-digit simulated credit card number.");
        return;
      }
      if (!cardExpiry || !cardCvc) {
        setPaymentError("Please provide an expiration date and CVC security token.");
        return;
      }
    }

    setPaymentError(null);
    setModalStep("processing");

    // Dynamic terminal log feedback during processing
    const steps = [
      "Contacting secure sandbox merchant nodes...",
      "Validating credit ledger balance...",
      "Securing SSL 256-Bit authentication tokens...",
      "Approving payment invoice...",
      "Registering credentials & spinning course modules...",
      "Configuring study board calendars...",
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        setProcessingText(steps[currentStepIndex]);
      }
    }, 450);

    setTimeout(async () => {
      clearInterval(interval);
      try {
        let loggedInUser: User;
        let token: string;

        if (checkoutMode === "sandbox") {
          // Log in pre-seeded user Alex Mercer
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "student@learnsphere.com", password: "password123" }),
          });
          const loginData = await loginRes.json();
          if (!loginRes.ok) throw new Error(loginData.error || "Login fail");
          loggedInUser = loginData.user;
          token = loginData.token;
        } else {
          // Register custom student profile on-the-fly
          const regRes = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: regName,
              email: regEmail,
              password: regPassword,
              role: "student"
            }),
          });
          const regData = await regRes.json();
          if (!regRes.ok) throw new Error(regData.error || "Register fail");
          loggedInUser = regData.user;
          token = regData.token;
        }

        // Join selected course
        const joinRes = await fetch("/api/enrollments/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: loggedInUser.id, courseId: selectedCourse.id }),
        });

        if (!joinRes.ok) {
          const joinData = await joinRes.json();
          throw new Error(joinData.error || "Join course fail");
        }

        // Success transition
        setModalStep("success");
        
        // Auto sign in user after delay
        setTimeout(() => {
          onLoginSuccess(loggedInUser, token);
        }, 1800);

      } catch (err: any) {
        console.error(err);
        setPaymentError(err.message || "Simulated payment transaction failed. Please retry.");
        setModalStep("preview");
      }
    }, 2800);
  };

  // Automated Card Formatting helper
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, "");
    const formatted = raw.replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
    setCardNumber(formatted);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-primary-100/30 to-transparent dark:from-primary-900/10 pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-200/20 dark:bg-primary-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      
      {/* Premium Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-display font-bold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
              LearnSphere
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#courses" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Courses</a>
            <a href="#curriculum" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800 transition-all cursor-pointer"
              title={theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
            >
              {theme === "light" ? (
                <Moon className="w-4.5 h-4.5 text-indigo-500" />
              ) : (
                <Sun className="w-4.5 h-4.5 text-amber-500" />
              )}
            </button>
            <button 
              onClick={() => onStartLearning()}
              className="hidden sm:inline-block px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
            >
              Log In
            </button>
            <button 
              onClick={() => onStartLearning()}
              id="btn-register-header"
              className="hidden sm:inline-block px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white shadow-lg transition-all"
            >
              Register Now
            </button>
            
            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg p-5 flex flex-col gap-4 text-left animate-slide-down shadow-xl">
            <a 
              href="#courses" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold py-2 text-slate-750 dark:text-slate-200 hover:text-primary-600"
            >
              Curriculum Courses
            </a>
            <a 
              href="#curriculum" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold py-2 text-slate-755 dark:text-slate-200 hover:text-primary-600"
            >
              How It Works
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold py-2 text-slate-755 dark:text-slate-200 hover:text-primary-600"
            >
              Pricing Tiers
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold py-2 text-slate-755 dark:text-slate-200 hover:text-primary-600"
            >
              Academic FAQ
            </a>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex gap-3">
              <button 
                onClick={() => { setMobileMenuOpen(false); onStartLearning(); }}
                className="flex-1 py-2.5 text-xs font-bold text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onStartLearning(); }}
                className="flex-1 py-2.5 text-xs font-bold text-center rounded-xl bg-primary-600 text-white"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-semibold tracking-wider uppercase mb-6 border border-primary-200/50 dark:border-primary-500/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Venture-Backed EdTech Intelligence
          </div>
          <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-tight mb-6">
            The elite LMS scaling <br />
            <span className="bg-gradient-to-r from-primary-600 via-indigo-500 to-purple-400 bg-clip-text text-transparent font-black">
              human potential
            </span> <br />
            with Gemini AI.
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed">
            Designed for forward-thinking developers, visual creatives, and technical architects. Explore course paths with real file-persistent progress tracking, live interactive scoring assessments, and automated certificate generation.
          </p>

          {/* Quick Sandbox Launcher Board */}
          <div className="p-5 rounded-2xl glass-premium border border-slate-200 dark:border-slate-800 w-full max-w-xl mb-10">
            <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Quick Access Sandbox Portals:
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onStartLearning("student")}
                className="p-3 text-left rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="text-xs sm:text-sm font-semibold flex items-center justify-between text-slate-800 dark:text-slate-100">
                  Alex
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-[9px] font-mono text-slate-400">Student Profile</div>
              </button>
              <button
                onClick={() => onStartLearning("instructor")}
                className="p-3 text-left rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="text-xs sm:text-sm font-semibold flex items-center justify-between text-slate-800 dark:text-slate-100">
                  Cooper
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-[9px] font-mono text-slate-400">Instructor Profile</div>
              </button>
              <button
                onClick={() => onStartLearning("admin")}
                className="p-3 text-left rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="text-xs sm:text-sm font-semibold flex items-center justify-between text-slate-800 dark:text-slate-100">
                  Catherine
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-[9px] font-mono text-slate-400">Admin Console</div>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a
              href="#courses"
              className="px-8 py-4 font-semibold text-white rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 flex items-center justify-center gap-3 transition-all"
            >
              Explore Academic Tracks <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Apple/Stripe-style Floating Illustration Scene */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="w-[300px] md:w-[400px] h-[380px] md:h-[460px] rounded-[32px] bg-gradient-to-tr from-primary-600/20 to-indigo-500/20 border border-white/20 dark:border-white/5 shadow-2xl relative flex items-center justify-center overflow-hidden">
            
            {/* Visual Glassmorphism Cards stack */}
            <div className="absolute top-[8%] left-[5%] p-4 rounded-2xl glass border border-white/30 dark:border-slate-800 shadow-xl w-44 text-left animate-float">
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase mb-1">
                <Cpu className="w-4 h-4" />
                Cognitive Node
              </div>
              <div className="text-xs font-semibold text-slate-850 dark:text-slate-100">Gemini 3.5 Active</div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 mt-2 rounded-full">
                <div className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full w-[85%] rounded-full" />
              </div>
            </div>

            <div className="absolute bottom-[10%] right-[5%] p-4 rounded-xl glass border border-white/30 dark:border-slate-800 shadow-xl w-48 text-left" style={{ animation: "float 6s ease-in-out infinite alternate" }}>
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase mb-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Assessment Approved
              </div>
              <div className="text-[10px] text-slate-400">Score Achieved: 100%</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">+150 XP Awarded</div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 text-white border border-slate-700 shadow-2xl w-[240px] md:w-[280px] flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-primary-600/20 flex items-center justify-center border border-primary-500/30 mb-4 animate-pulse">
                <Laptop className="w-7 h-7 text-primary-400" />
              </div>
              <span className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">LMS Engine</span>
              <h3 className="font-display font-medium text-base mt-0.5 mb-2.5">Live Sandbox</h3>
              <div className="flex items-center gap-2 text-[10px] bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-mono text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                server PORT: 3000
              </div>
            </div>

            {/* Glowing floating blur dots */}
            <div className="absolute top-[20%] right-[10%] w-10 h-10 bg-primary-500 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-[20%] left-[10%] w-12 h-12 bg-pink-500 rounded-full blur-xl animate-pulse" />
          </div>
        </div>
      </section>

      {/* Platform Statistics Counters */}
      <section className="bg-white dark:bg-slate-900 py-10 border-y border-slate-200/60 dark:border-slate-800/60 transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((st, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="font-display font-extrabold text-3xl md:text-4xl text-primary-600 dark:text-primary-400 mb-1">
                {st.value}
              </span>
              <span className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Course Showcase */}
      <section id="courses" className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-primary-600 dark:text-primary-400">Curriculum Catalog</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 mb-4">Explore Academic Academies</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
            Immerse in detailed, interactive modules crafted by experts. Filter course libraries, test code frameworks, or query explanations.
          </p>
        </div>

        {/* Category Tabs Section */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                // Reset limit when switching categories
                setShowAllCourses(true);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {displayedCourses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <div className="font-semibold text-sm">No live courses in {activeCategory} category</div>
            <p className="text-xs text-slate-500 mt-1">Check back later or register as an instructor to publish courses in this field!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedCourses.map((course) => (
              <div 
                key={course.id}
                onClick={() => openCourseModal(course)}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-primary-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer"
              >
                <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full glass text-[10px] font-bold text-slate-800 dark:text-white border border-white/20">
                    {course.category}
                  </div>
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-slate-900/85 text-[10px] text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {course.rating.toFixed(1)}
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-grow text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-150 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                      {course.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" /> {course.duration}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2.5 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-5 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Faculty Card */}
                  <div className="flex items-center gap-3 border-t border-slate-150 dark:border-slate-850 pt-4 mt-auto">
                    <img 
                      src={course.instructorAvatar} 
                      alt={course.instructorName} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-xs text-left">
                      <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{course.instructorName}</div>
                      <div className="text-slate-400 text-[9px] mt-0.5 truncate max-w-[140px]">{course.instructorTitle || "Authorized Faculty"}</div>
                    </div>
                    <div className="ml-auto font-display font-extrabold text-base sm:text-lg text-primary-600 dark:text-primary-400">
                      {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => setShowAllCourses(!showAllCourses)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-750 transition bg-primary-500/5 hover:bg-primary-500/10 dark:bg-primary-400/5 dark:hover:bg-primary-400/10 px-5 py-3 rounded-2xl border border-primary-500/15"
          >
            {showAllCourses 
              ? "Show Featured Highlights Only" 
              : `Access Full Course Directory (${filteredCourses.length} Syllabi in ${activeCategory})`
            } 
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Success Journey */}
      <section id="curriculum" className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/40 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-primary-600 dark:text-primary-400">Student Milestones</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 mb-4">SaaS Learning Timeline</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
              Unlock modular progression blocks designed to build verifiable career readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            <div className="hidden lg:block absolute top-[40px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary-400/20 via-indigo-400/40 to-purple-400/20 z-0" />
            
            {successTimeline.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left group">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-white font-display font-bold text-lg mb-6 shadow-xl shadow-primary-500/10 group-hover:scale-110 transition-transform">
                  {idx + 1}
                </div>
                <span className="text-xs font-mono font-bold uppercase text-primary-500 mb-2">{step.year}</span>
                <h3 className="font-display font-bold text-lg md:text-xl mb-3 text-slate-800 dark:text-slate-100">{step.title}</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Options */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto text-center relative z-10">
        <div className="max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-primary-600 dark:text-primary-400">Premium Membership Plans</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 mb-4">Value-optimized Subscriptions</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
            Choose a level matching your requirements. All modes support roles and direct access settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`rounded-3xl p-6 sm:p-8 border text-left flex flex-col ${
                plan.popular 
                  ? "bg-slate-900 border-primary-500 text-white shadow-xl scale-[1.01] z-10" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100"
              } transition-all`}
            >
              {plan.popular && (
                <span className="self-start px-3 py-1 rounded-full bg-primary-600 text-white text-[10px] font-bold tracking-wider uppercase mb-4">
                  Elite Popular Candidate
                </span>
              )}
              <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
              <p className={`text-xs mb-6 ${plan.popular ? "text-slate-300" : "text-slate-500"}`}>
                {plan.description}
              </p>

              <div className="flex items-baseline mb-8">
                <span className="font-display font-extrabold text-4xl">{plan.price}</span>
                {plan.period && <span className="text-sm ml-1 text-slate-400">{plan.period}</span>}
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feat, fidx) => (
                  <li key={fidx} className="flex items-start gap-2.5 text-xs">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className={plan.popular ? "text-slate-300" : "text-slate-600 dark:text-slate-350"}>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onStartLearning(plan.role)}
                className={`w-full py-3 px-4 font-semibold text-center text-xs rounded-xl shadow-md transition-all cursor-pointer ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Top Instructors */}
      <section className="py-16 bg-slate-100/40 dark:bg-slate-900/20 border-y border-slate-200/50 dark:border-slate-800/40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-primary-600 dark:text-primary-400">Distinguished Academicians</span>
            <h2 className="font-display font-bold text-2xl md:text-3xl mt-3 mb-4">Learn From Leading Mentors</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
              Our guides are verified enterprise consultants, ex-FAANG maintainers, and leading university researchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {instructors.map((inst, i) => (
              <div key={i} className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/40 text-left flex items-center gap-4 hover:shadow-md transition-all">
                <img 
                  src={inst.avatar} 
                  alt={inst.name} 
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-150 dark:border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left overflow-hidden">
                  <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-slate-150 truncate">{inst.name}</h4>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-0.5 truncate">{inst.role}</p>
                  <p className="text-[10px] text-slate-400 truncate">{inst.institution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto text-left relative z-10">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-primary-600 dark:text-primary-400">Common Questions</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3">Curriculum Explanations FAQ</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between text-xs sm:text-sm font-semibold hover:text-primary-600 dark:hover:text-primary-400 transition cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ml-2 ${activeFaq === idx ? "rotate-180 text-primary-500" : ""}`} />
              </button>
              
              {activeFaq === idx && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3 text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">LearnSphere</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Accelerating professional instruction through modular code playgrounds, certified hash verification, and server Gemini chatbot agents.
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-white text-xs sm:text-sm mb-4 font-display">Academics</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onStartLearning()} className="hover:text-white transition">Development boot camps</button></li>
              <li><button onClick={() => onStartLearning()} className="hover:text-white transition">Creative spatial designs</button></li>
              <li><button onClick={() => onStartLearning()} className="hover:text-white transition">Generative AI structures</button></li>
              <li><button onClick={() => onStartLearning()} className="hover:text-white transition">Full integration checklists</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white text-xs sm:text-sm mb-4 font-display">Enterprise</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#pricing" className="hover:text-white transition">Academy Pass prices</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Faculty monetization APIs</a></li>
              <li><span className="text-slate-500">Railway deployment specs</span></li>
              <li><span className="text-slate-500">PostgreSQL migrations</span></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white text-xs sm:text-sm mb-4 font-display">Playground Host</h5>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active on port 3000
              </li>
              <li className="text-[10px] text-slate-650">Local database instance: db.json</li>
              <li className="text-[10px] text-slate-650">Gemini model: gemini-3.5-flash</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-600">
          <span>&copy; 2026 LearnSphere EdTech Inc. All rights reserved.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Security Ledger Rules</span>
            <span onClick={() => onStartLearning("admin")} className="cursor-pointer hover:text-slate-400">Admin Console access</span>
          </div>
        </div>
      </footer>

      {/* Immersive Course Detail & Simulated Checkout Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden text-left flex flex-col max-h-[95vh] sm:max-h-[88vh]">
            
            {/* Modal Header banner */}
            <div className="relative h-28 shrink-0 bg-slate-100 dark:bg-slate-950 overflow-hidden border-b border-slate-200/50 dark:border-slate-850">
              <img 
                src={selectedCourse.thumbnail} 
                alt={selectedCourse.title} 
                className="w-full h-full object-cover opacity-85 dark:opacity-40"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
              
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition cursor-pointer"
                title="Close Portal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-6 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-600 text-white font-mono text-[9px] uppercase tracking-wider font-bold">
                  {selectedCourse.category}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 font-bold">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> {selectedCourse.rating.toFixed(1)} Rating
                </span>
              </div>
            </div>

            {/* Modal Content Space */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {paymentError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {paymentError}
                </div>
              )}

              {modalStep === "preview" && (
                <div className="space-y-6 text-left">
                  <div>
                    <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight leading-tight">
                      {selectedCourse.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {selectedCourse.longDescription || selectedCourse.description}
                    </p>
                  </div>

                  {/* Course Quick Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <div className="text-slate-400 font-semibold uppercase tracking-wider">Duration</div>
                      <div className="text-xs text-slate-800 dark:text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" /> {selectedCourse.duration}
                      </div>
                    </div>
                    <div className="text-center border-x border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 font-semibold uppercase tracking-wider">Level</div>
                      <div className="text-xs text-slate-800 dark:text-slate-200 mt-0.5">{selectedCourse.difficulty}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 font-semibold uppercase tracking-wider">Tuition</div>
                      <div className="text-xs text-primary-600 dark:text-primary-400 mt-0.5 font-extrabold">
                        {selectedCourse.price > 0 ? `$${selectedCourse.price.toFixed(2)}` : "FREE ENROLL"}
                      </div>
                    </div>
                  </div>

                  {/* Verifiable Certificate Details Section */}
                  <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-left space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <Award className="w-5 h-5 shrink-0" />
                      <span>Ledger-Certified Certificate Included</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-relaxed">
                      Upon 100% completion of course lessons and quiz assessments, LearnSphere automatically mints a <strong>verifiable digital diploma</strong> issued with a unique tamper-proof ledger validation code. Showcase it to enterprise recruiters or link directly to professional profiles!
                    </p>
                  </div>

                  {/* Syllabus modules snippet */}
                  <div className="space-y-2.5 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Admissions Course Syllabus ({selectedCourse.modules.length} Modules):
                    </h4>
                    <div className="space-y-2">
                      {selectedCourse.modules.map((mod, mi) => (
                        <div 
                          key={mod.id || mi}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/60 text-xs"
                        >
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{mod.title}</div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {mod.lessons.length} structured lectures • Includes practice assessments
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {modalStep === "checkout" && (
                <form onSubmit={handlePaymentSubmit} className="space-y-5 text-left">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                      Complete Checkout Enrollment
                    </h4>
                    <p className="text-xs text-slate-400">
                      Sync account identity credentials and initiate simulation checkout gateway.
                    </p>
                  </div>

                  {/* Profile Mode Toggle */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">
                      Select Student Profile Access:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutMode("sandbox")}
                        className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          checkoutMode === "sandbox"
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        Alex Mercer (Sandbox Student)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutMode("new")}
                        className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          checkoutMode === "new"
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        Create Custom Student
                      </button>
                    </div>
                  </div>

                  {/* Custom Account Registration fields */}
                  {checkoutMode === "new" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase">Student Full Name</label>
                        <input 
                          type="text" 
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="your name" 
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase">Email Address</label>
                        <input 
                          type="email" 
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="email@example.com" 
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Simulated Credit Card input Fields (Only if price > 0) */}
                  {selectedCourse.price > 0 && (
                    <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-400/5 border border-indigo-500/10 dark:border-indigo-400/10 space-y-4">
                      <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase">
                          <CreditCard className="w-4 h-4" /> Secure Payment Simulation
                        </span>
                        <span className="text-[10px] flex items-center gap-1 text-slate-400">
                          <SecureLock className="w-3 h-3 text-emerald-500" /> SSL 256-Bit Encrypted
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase">Cardholder Name</label>
                          <input 
                            type="text"
                            placeholder="Alex Mercer"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800/80 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary-500"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase">Card Number</label>
                          <input 
                            type="text"
                            placeholder="4111 2222 3333 4444"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-255/60 dark:border-slate-800/80 rounded-xl text-xs font-mono font-semibold tracking-widest focus:outline-none focus:border-primary-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase">Expiry Date</label>
                            <input 
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-255/60 dark:border-slate-800/80 rounded-xl text-xs font-mono font-semibold text-center focus:outline-none focus:border-primary-500"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase">CVC Code</label>
                            <input 
                              type="password"
                              placeholder="•••"
                              maxLength={3}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-255/60 dark:border-slate-800/80 rounded-xl text-xs font-mono font-semibold text-center focus:outline-none focus:border-primary-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-[9px] font-mono text-slate-405 dark:text-slate-500 text-center uppercase leading-normal">
                        No actual charges are made. Enter any mock values to complete simulated enrollment checkout successfully.
                      </div>
                    </div>
                  )}

                  {selectedCourse.price === 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-xs text-center uppercase tracking-wider">
                      ★ Open Admissions - Free Class Access Trigger
                    </div>
                  )}

                  <button type="submit" className="hidden" id="submit-checkout-secret-btn" />
                </form>
              )}

              {modalStep === "processing" && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-primary-600 animate-spin" />
                    <Sparkles className="w-5 h-5 text-amber-400 absolute top-0 right-0 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-lg text-slate-900 dark:text-slate-100">
                      Processing Admissions Invoice
                    </h4>
                    <p className="text-xs font-mono text-indigo-500 dark:text-indigo-400 mt-1 max-w-sm mx-auto leading-relaxed uppercase tracking-wider">
                      {processingText}
                    </p>
                  </div>
                </div>
              )}

              {modalStep === "success" && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-5 animate-bounce-short">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-extrabold uppercase text-emerald-500 tracking-wider">
                      Simulated Payment Invoice Success ✓
                    </span>
                    <h4 className="font-display font-black text-2xl text-slate-900 dark:text-slate-100 tracking-tight">
                      Admissions Approved!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-405 max-w-md mx-auto leading-relaxed">
                      Congratulations! Your simulated payment has been securely authorized. Your profile has been auto-logged in, and <strong>{selectedCourse.title}</strong> is now unlocked in your Student Dashboard. Launching learning desk...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-slate-150 dark:border-slate-850 flex items-center justify-end gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
              {modalStep === "preview" && (
                <>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer active:scale-98"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setModalStep("checkout")}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:shadow transition cursor-pointer active:scale-98"
                  >
                    <span>Admit & Enroll</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {modalStep === "checkout" && (
                <>
                  <button
                    onClick={() => setModalStep("preview")}
                    className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer active:scale-98"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById("submit-checkout-secret-btn")?.click();
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-650 hover:to-indigo-650 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition cursor-pointer active:scale-98"
                  >
                    <span>{selectedCourse.price > 0 ? "Authorize Payment & Enroll" : "Enroll Directly"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {modalStep === "processing" && (
                <button
                  disabled
                  className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 text-xs font-bold rounded-xl cursor-not-allowed flex items-center gap-1.5"
                >
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                  <span>Processing gateway sync...</span>
                </button>
              )}

              {modalStep === "success" && (
                <button
                  disabled
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <span>Launching Learning Desk...</span>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
