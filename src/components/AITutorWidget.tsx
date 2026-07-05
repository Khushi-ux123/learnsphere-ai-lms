/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { 
  Sparkles, X, Send, Bot, Copy, Check, MessageSquare, Volume2, VolumeX,
  Compass, HelpCircle, BookOpen, Laptop, Code, RefreshCw, Layers, Brain, ArrowRight
} from "lucide-react";
import { Course, Lesson, User } from "../types";

interface AITutorWidgetProps {
  user: User;
  courses: Course[];
  enrolledCourses: Course[];
  activeCourse: Course | null;
  activeLesson: Lesson | null;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function AITutorWidget({ user, courses, enrolledCourses, activeCourse, activeLesson }: AITutorWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Context Selection States
  // "active" uses currently viewed lesson/course if available,
  // "course-id" pins to a chosen course from catalog/enrolled,
  // "general" is for general edtech help.
  const [contextType, setContextType] = useState<"current" | "specific" | "general">("current");
  const [selectedCourseContextId, setSelectedCourseContextId] = useState<string>("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Sync browser Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Set default specific course from enrolled list if available
  useEffect(() => {
    if (enrolledCourses.length > 0 && !selectedCourseContextId) {
      setSelectedCourseContextId(enrolledCourses[0].id);
    }
  }, [enrolledCourses, selectedCourseContextId]);

  // Load chat history from SessionStorage per user to survive route changes
  useEffect(() => {
    const key = `learnsphere_tutor_chat_${user.id}`;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        // Fallback
      }
    } else {
      // Default welcome message
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: `Hi **${user.name}**! 👋 I am your **LearnSphere AI Tutor**.\n\nI can help explain complex curriculum items, review your coding assignments, or design customized mock quizzes!\n\nChoose your study context from the selector below, or pick a quick suggestion to begin!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [user.id]);

  // Save chat history
  const saveChatHistory = (updatedMessages: ChatMessage[]) => {
    setMessages(updatedMessages);
    sessionStorage.setItem(`learnsphere_tutor_chat_${user.id}`, JSON.stringify(updatedMessages));
  };

  // Scroll to bottom on updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Determine current active materials for Context payload
  const currentCourseContext = contextType === "current" 
    ? activeCourse 
    : contextType === "specific" 
      ? courses.find(c => c.id === selectedCourseContextId) || null
      : null;

  const currentLessonContext = contextType === "current" ? activeLesson : null;

  // Render contextual chip/badge
  const getContextName = () => {
    if (contextType === "current") {
      if (activeLesson) return `Lesson: ${activeLesson.title}`;
      if (activeCourse) return `Course: ${activeCourse.title}`;
      return "General Helper (No Material Selected)";
    }
    if (contextType === "specific") {
      const crs = courses.find(c => c.id === selectedCourseContextId);
      return crs ? `Subject: ${crs.title}` : "Specific Course Materials";
    }
    return "General EdTech Assistant";
  };

  // Get Suggested prompts based on Context
  const getSuggestedPrompts = () => {
    if (currentLessonContext) {
      return [
        { label: "💡 Plain English Explanation", prompt: `Explain the lesson "${currentLessonContext.title}" simply, focusing on its core takeaways and practical real-world usages.` },
        { label: "❓ Practice Quiz Prep", prompt: `Generate an interactive practice question about "${currentLessonContext.title}" based on its material. Provide multiple choices and then reveal the correct explanation afterwards.` },
        { label: "🚀 Deep Dive Challenge", prompt: `Give me a short, highly hands-on micro coding exercise or project idea that relates directly to the topics in "${currentLessonContext.title}".` }
      ];
    }
    if (currentCourseContext) {
      return [
        { label: "📊 Subject Breakdown", prompt: `Provide a high-level visual roadmap of the key concepts I should focus on in the course "${currentCourseContext.title}" to master the material.` },
        { label: "🛠️ Practical Applications", prompt: `How is the knowledge in "${currentCourseContext.title}" applied in professional software engineering roles or production environments?` },
        { label: "📝 Course Summary Note", prompt: `Give me a concise 3-bullet study cheat sheet summarizing the main objectives of "${currentCourseContext.title}".` }
      ];
    }
    return [
      { label: "📦 React State Cycle", prompt: "Explain the visual flow of data and state management in a client-side React component simple terms with an example." },
      { label: "🧩 Drizzle ORM Basics", prompt: "What is an ORM (specifically Drizzle/Postgres) and what are the main benefits of using schemas instead of raw SQL strings?" },
      { label: "⚡ Study Efficiency Tip", prompt: "Provide an expert learning technique (like Pomodoro, active recall, or spaced repetition) to complete courses faster with high memory retention." }
    ];
  };

  // Handle Query Submission
  const handleQuery = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || chatInput;
    if (!promptToSend.trim() || loading) return;

    if (!overridePrompt) {
      setChatInput("");
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const nextMessages = [...messages, userMsg];
    saveChatHistory(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/gemini/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          courseContext: currentCourseContext,
          lessonContext: currentLessonContext,
          chatHistory: messages.slice(-6).map(m => ({
            sender: m.sender === "user" ? "user" : "ai",
            text: m.text
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tutor API error");

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.answer || "I processed your request but formulated an empty answer. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      saveChatHistory([...nextMessages, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: `⚠️ **Could not sync with AI Tutor:**\n\n${err?.message || "Internal network connection issue."}\n\nPlease check your sandbox terminal logs or retry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      saveChatHistory([...nextMessages, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Clear messages handler
  const handleResetChat = () => {
    if (confirm("Reset current AI Tutor conversation history?")) {
      const defaultWelcome: ChatMessage[] = [
        {
          id: "welcome",
          sender: "ai",
          text: `Hi **${user.name}**! 👋 conversation reset successfully. Ask me any question relative to your selected course materials!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ];
      saveChatHistory(defaultWelcome);
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setSpeakingId(null);
    }
  };

  // Copy to Clipboard Utility
  const handleCopy = (id: string, text: string) => {
    // Remove markdown symbols for cleaner copy-paste
    const cleanText = text.replace(/[\*\_`#\-]/g, "");
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Browser Text To Speech accessibility readout
  const handleSpeech = (id: string, text: string) => {
    if (!synthRef.current) return;

    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }

    // Cancel active readouts first
    synthRef.current.cancel();

    // Strip markdown out of text for cleaner voice narration
    const readable = text
      .replace(/[\*\_`#\-]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1"); // remove links but keep anchor text

    const utterance = new SpeechSynthesisUtterance(readable);
    utterance.rate = 1.05;
    utterance.onend = () => {
      setSpeakingId(null);
    };
    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(id);
    synthRef.current.speak(utterance);
  };

  return (
    <>
      {/* Draggable Floating Button Trigger */}
      <motion.div
        drag
        dragConstraints={{ left: -1000, right: 0, top: -800, bottom: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing no-print"
        title="Drag me anywhere! Click to open AI Tutor"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 rounded-full bg-gradient-to-tr ${
            isOpen ? "from-slate-800 to-slate-900" : "from-primary-600 via-indigo-600 to-violet-650"
          } text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all border border-white/20 relative`}
        >
          {/* Holographic Glowing pulse ring */}
          <span className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping opacity-60" style={{ animationDuration: "3s" }} />
          
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close-icon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="sparkles-icon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* Floating Interactive 3D Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-24 right-6 z-50 w-[95%] sm:w-[410px] h-[600px] bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800/80 rounded-[28px] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl no-print perspective-1000"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Gilded Top Glow */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-indigo-500 to-pink-500 shrink-0" />

            {/* Widget Header Panel */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-650 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold font-display text-slate-850 dark:text-slate-150">LearnSphere AI Tutor</h3>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-mono flex items-center gap-1">
                    <span>Powered by Gemini-3.5-Flash</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-700 dark:hover:text-slate-350 transition"
                  title="Clear conversation history"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-700 dark:hover:text-slate-350 transition"
                  title="Minimize"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* CONTEXT SELECTOR STATION */}
            <div className="px-4 py-3 bg-slate-100/50 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase font-bold">
                <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-indigo-500" /> Study Material Context:</span>
                <span className="text-[9px] text-primary-500 px-1.5 py-0.5 rounded bg-primary-100/40 dark:bg-primary-950/30 uppercase border border-primary-200/20">Active</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setContextType("current")}
                  className={`py-1.5 px-2 text-[10px] rounded-lg font-bold border flex items-center justify-center gap-1 transition ${
                    contextType === "current"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
                  }`}
                  title="Contextually locks on whatever Course/Lesson you are studying inside Student hub!"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>View Track</span>
                </button>

                <button
                  onClick={() => setContextType("specific")}
                  className={`py-1.5 px-2 text-[10px] rounded-lg font-bold border flex items-center justify-center gap-1 transition ${
                    contextType === "specific"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
                  }`}
                  title="Choose a specific course catalog material to contextually ask questions about"
                >
                  <Compass className="w-3 h-3" />
                  <span>Choose Class</span>
                </button>

                <button
                  onClick={() => setContextType("general")}
                  className={`py-1.5 px-2 text-[10px] rounded-lg font-bold border flex items-center justify-center gap-1 transition ${
                    contextType === "general"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
                  }`}
                  title="General software developer/Edtech AI tutor help"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>General</span>
                </button>
              </div>

              {/* Specific Course Select Panel */}
              <AnimatePresence>
                {contextType === "specific" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <select
                      value={selectedCourseContextId}
                      onChange={(e) => setSelectedCourseContextId(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status display showing what information is currently piped into the prompts */}
              <div className="py-1 px-2.5 rounded-lg bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
                <span className="truncate max-w-[280px]">🎯 {getContextName()}</span>
                {contextType === "current" && (activeLesson || activeCourse) && (
                  <span className="text-[8px] px-1 py-0.2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border border-emerald-200/30 font-bold uppercase rounded tracking-wider animate-pulse shrink-0">Piped</span>
                )}
              </div>
            </div>

            {/* CHAT CHRONICLE MESSAGES VIEW */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40 dark:bg-slate-950/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[20px] px-4 py-3 text-xs shadow-sm border ${
                      msg.sender === "user"
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent rounded-tr-none"
                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800/60 rounded-tl-none"
                    }`}
                  >
                    {/* Message Header with Bot identity / actions */}
                    {msg.sender === "ai" && msg.id !== "welcome" && (
                      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/60 text-slate-450 dark:text-slate-500 text-[9px] font-mono justify-between">
                        <span className="flex items-center gap-1 font-bold text-indigo-500"><Brain className="w-3 h-3 text-indigo-500" /> KNOWLEDGE SOURCE</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="hover:text-primary-500 transition duration-150 flex items-center gap-0.5"
                            title="Copy plain explanation"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                          </button>
                          <span className="text-slate-300 dark:text-slate-800">•</span>
                          <button
                            onClick={() => handleSpeech(msg.id, msg.text)}
                            className="hover:text-primary-500 transition duration-150 flex items-center gap-0.5"
                            title={speakingId === msg.id ? "Stop Narrating" : "Listen via voice TTS"}
                          >
                            {speakingId === msg.id ? (
                              <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3 h-3" />
                            )}
                            <span>{speakingId === msg.id ? "Stop" : "Read"}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Rich Markdown Output */}
                    <div className="prose dark:prose-invert max-w-none break-words leading-relaxed text-left font-sans text-[11.5px] [&>h3]:text-sm [&>h3]:font-black [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-2 [&>pre]:bg-slate-950 [&>pre]:text-emerald-400 [&>pre]:p-2.5 [&>pre]:rounded-xl [&>pre]:my-2 [&>pre]:overflow-x-auto [&>pre]:font-mono [&>pre]:text-[10px] [&>code]:bg-slate-100 dark:[&>code]:bg-slate-950 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-[10px] [&>code]:text-indigo-600 dark:[&>code]:text-indigo-400">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>

                    <div className="text-[8.5px] opacity-60 font-mono text-right mt-1.5">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bouncing Dots Loader when fetching */}
              {loading && (
                <div className="flex flex-col items-start">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/60 rounded-2xl rounded-tl-none p-4 shadow-sm flex flex-col gap-2">
                    <span className="text-[9px] font-mono font-bold text-indigo-500 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      FORMULATING EXPLANATION ENGINE...
                    </span>
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* PRESET CHIPS BAR */}
            <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none no-scrollbar">
              {getSuggestedPrompts().map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuery(chip.prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-750 dark:text-slate-350 hover:border-primary-500/50 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all font-semibold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <span>{chip.label}</span>
                  <ArrowRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>

            {/* CHAT INPUT AREA */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleQuery();
                }}
                className="flex items-center gap-2"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      currentLessonContext
                        ? `Ask about "${currentLessonContext.title}"...`
                        : currentCourseContext
                          ? `Ask about "${currentCourseContext.title}"...`
                          : "Ask any software engineering question..."
                    }
                    className="block w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-950 transition-all font-semibold shadow-inner focus:ring-2 focus:ring-primary-500/10"
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !chatInput.trim()}
                  className="p-3 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-650 hover:from-primary-650 hover:to-indigo-700 text-white shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40 shrink-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-[9px] text-center text-slate-400 dark:text-slate-550 mt-2 font-mono tracking-wide uppercase">
                Enrolled tracks: <span className="font-bold text-slate-500 dark:text-slate-400">{enrolledCourses.length}</span> • XP score: <span className="font-bold text-slate-500 dark:text-slate-400">+{user.xp || 0} XP</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
