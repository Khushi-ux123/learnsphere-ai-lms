/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Course } from "../types";
import { 
  X, BookOpen, Clock, Award, CheckCircle2, Sparkles, Loader2, ArrowRight, ShieldCheck, HelpCircle 
} from "lucide-react";

interface EnrollmentModalProps {
  course: Course | null;
  onClose: () => void;
  onEnroll: (courseId: string) => Promise<void>;
  theme: "light" | "dark" | null;
}

export default function EnrollmentModal({ course, onClose, onEnroll, theme }: EnrollmentModalProps) {
  const [step, setStep] = useState<"preview" | "enrolling" | "success">("preview");
  const [studyPlanHours, setStudyPlanHours] = useState<number>(2);
  const [focusGoal, setFocusGoal] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset internal states when a new course is selected
  useEffect(() => {
    if (course) {
      setStep("preview");
      setErrorMsg(null);
      setFocusGoal("");
    }
  }, [course]);

  // Handle Close on Esc Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!course) return null;

  // Total lessons calculator
  const totalLessons = course.modules.reduce(
    (acc, mod) => acc + (mod.lessons?.length || 0), 0
  );

  const handleConfirmEnroll = async () => {
    setStep("enrolling");
    setErrorMsg(null);
    try {
      // Simulate real-world transaction / authorization buffer for dynamic UI feedback
      await new Promise((resolve) => setTimeout(resolve, 1400));
      await onEnroll(course.id);
      setStep("success");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to process enrollment. Please try again.");
      setStep("preview");
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={handleOverlayClick}
      >
        <motion.div
          id="enrollment-modal-container"
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden text-left flex flex-col max-h-[90vh] md:max-h-[85vh] depth-card-3d"
        >
          {/* Subtle Decorative Ambient Glow */}
          <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-gradient-to-br from-primary-500/10 to-indigo-500/5 dark:from-primary-500/20 dark:to-transparent rounded-full blur-[50px] pointer-events-none" />

          {/* Modal Header */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between shrink-0 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-extrabold tracking-widest text-primary-600 dark:text-primary-400 uppercase">
                  Class Enrollment Portal
                </span>
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                  Sandbox Catalog Admissions
                </h3>
              </div>
            </div>

            <button
              id="enrollment-modal-close"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-850 dark:hover:text-white transition cursor-pointer"
              title="Close Portal"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Modal Content Space */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative z-10 custom-scrollbar">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === "preview" && (
                <motion.div
                  key="preview-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Course Overview Row */}
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Course Image */}
                    <div className="w-full md:w-44 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/50 dark:border-slate-800 relative shadow-inner">
                      <img
                        src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm text-[9px] text-white font-mono uppercase">
                        {course.difficulty || "Intermediate"}
                      </div>
                    </div>

                    {/* Course Title and Stats */}
                    <div className="text-left flex-1 flex flex-col justify-center">
                      <h4 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description || "Unlock comprehensive syllabus modules packed with real-world algorithms, assignments, and certified examinations."}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-3 text-slate-500 dark:text-slate-400 font-mono text-[10px] font-semibold">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                          <span>{course.modules.length} Modules</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{totalLessons} Lectures</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Authorized Credential</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Syllabus / Module List Accordion-preview */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">
                      Curriculum Modules Summary
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                      {course.modules.map((mod, i) => (
                        <div
                          key={mod.id || i}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 flex items-start gap-3 text-left"
                        >
                          <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div className="overflow-hidden">
                            <h6 className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate leading-tight">
                              {mod.title}
                            </h6>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-mono">
                              {mod.lessons?.length || 0} Lectures • {mod.lessons?.filter(l => l.type === "quiz")?.length || 0} Assessments
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Target Study Planner & Goals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="text-left">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Target Daily Hours
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setStudyPlanHours(h)}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer active:scale-95 ${
                              studyPlanHours === h
                                ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                                : "bg-slate-50 border-slate-200 dark:bg-slate-850 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            {h}h
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                        Estimates completion in {Math.round((totalLessons * 0.5) / studyPlanHours) || 1} days.
                      </p>
                    </div>

                    <div className="text-left">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Primary Learning Goal
                      </label>
                      <input
                        type="text"
                        value={focusGoal}
                        onChange={(e) => setFocusGoal(e.target.value)}
                        placeholder="e.g. Master React Hooks, pass assignment"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* Fee Panel */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                      <ShieldCheck className="w-4.5 h-4.5" />
                      <span>Sandbox Open Admissions</span>
                    </div>
                    <span className="text-emerald-500 font-bold text-sm">FREE TUITION</span>
                  </div>
                </motion.div>
              )}

              {step === "enrolling" && (
                <motion.div
                  key="enrolling-tab"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                    <Sparkles className="w-5 h-5 text-amber-400 absolute top-0 right-0 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-lg text-slate-900 dark:text-slate-100">
                      Processing Class Credentials
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                      Syncing course files, initializing user database records, and mounting educational syllabus workspace assets. Please hold...
                    </p>
                  </div>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="py-6 flex flex-col items-center justify-center text-center space-y-5"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-150 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-500 tracking-wider">
                      Admissions Approved ✓
                    </span>
                    <h4 className="font-display font-black text-2xl text-slate-900 dark:text-slate-100 tracking-tight">
                      Enrollment Completed!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                      Congratulations! You have successfully signed up for <strong>{course.title}</strong>. Your sandbox access has been unlocked. Get ready to tackle modules, submit coding assignments, and mint your digital certificate!
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 w-full max-w-md text-left space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Curriculum:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">{course.modules.length} Modules</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Lectures:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">{totalLessons} Syllabus Lectures</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Daily Study Target:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">{studyPlanHours} Hours / day</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-950/20 relative z-10">
            {step === "preview" && (
              <>
                <button
                  id="enrollment-modal-cancel"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer active:scale-98"
                >
                  Cancel
                </button>
                <button
                  id="enrollment-modal-confirm"
                  onClick={handleConfirmEnroll}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:shadow transition cursor-pointer active:scale-98"
                >
                  <span>Confirm Enrollment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {step === "enrolling" && (
              <button
                disabled
                className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 text-xs font-bold rounded-xl cursor-not-allowed flex items-center gap-1.5"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing admissions...</span>
              </button>
            )}

            {step === "success" && (
              <button
                id="enrollment-modal-start"
                onClick={onClose}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-650 hover:to-indigo-650 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 transition cursor-pointer active:scale-98"
              >
                <span>Launch Course Dashboard</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
