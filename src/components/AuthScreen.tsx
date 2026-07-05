/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, ArrowLeft, Mail, Lock, User as UserIcon, 
  ShieldAlert, Sparkles, Check, Sun, Moon, KeyRound, Laptop, 
  Users, ShieldCheck, ArrowRight, RotateCw 
} from "lucide-react";
import { UserRole, User } from "../types";

interface AuthScreenProps {
  onBack: () => void;
  onLoginSuccess: (user: User, token: string) => void;
  initialRole?: UserRole;
  theme: "light" | "dark" | null;
  toggleTheme: () => void;
}

export default function AuthScreen({ onBack, onLoginSuccess, initialRole, theme, toggleTheme }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(initialRole || "student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mouse hover tilt coordinates for 3D depth effect
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // rotation limits (-7deg to +7deg) for comfortable usability
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glowX, glowY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  };

  // Shortcut login execution
  const handleShortcutLogin = async (shortcutEmail: string) => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: shortcutEmail, password: "password123" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Authentication error");
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorStatus(err.message || "Failed to authorize shortcut credential");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setErrorStatus("Please fulfill all parameters.");
      return;
    }

    setLoading(true);
    setErrorStatus(null);

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin 
      ? { email, password }
      : { name, email, password, role };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Authentication error");
      
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorStatus(err.message || "Could not process identity verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-start md:justify-center items-center py-10 px-4 relative font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* Floating Header Actions */}
      <div className="w-full max-w-5xl flex justify-between items-center z-50 absolute top-4 md:top-6 left-0 right-0 px-4 md:px-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 transition-colors cursor-pointer bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Venture Hub
        </button>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800 shadow-sm transition-all cursor-pointer"
        >
          {theme === "light" ? (
            <Moon className="w-4.5 h-4.5 text-indigo-500" />
          ) : (
            <Sun className="w-4.5 h-4.5 text-amber-500" />
          )}
        </button>
      </div>

      {/* Decorative Interactive Background Layers */}
      <div className="absolute top-[5%] left-[10%] w-[380px] h-[380px] bg-gradient-to-tr from-primary-500/10 to-indigo-500/5 dark:from-primary-500/5 dark:to-transparent rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[5%] right-[10%] w-[420px] h-[420px] bg-gradient-to-tr from-purple-500/10 to-pink-500/5 dark:from-purple-500/5 dark:to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Interactive Title Block */}
      <div className="w-full max-w-lg text-center mb-6 mt-16 md:mt-0 relative z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100/60 dark:bg-primary-950/30 border border-primary-200/30 dark:border-primary-900/20 text-xs font-bold text-primary-600 dark:text-primary-400 mb-3 tracking-wide font-mono uppercase">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          3D Cognitive Shield Enabled
        </div>

        <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
          {isLogin ? "Sign in to LearnSphere" : "Form your LearnSphere profile"}
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          {isLogin ? "Unlock custom-curated academic tracks" : "Join the global developer syndicate"}
          {" "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setErrorStatus(null); }}
            className="font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer inline-flex items-center gap-1 bg-primary-500/5 px-2 py-0.5 rounded-md border border-primary-500/10"
          >
            <span>{isLogin ? "Switch to 3D Signup" : "Switch to 3D Signin"}</span>
            <RotateCw className="w-3 h-3 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
          </button>
        </p>
      </div>

      {/* 3D PERSPECTIVE WRAPPER CONTAINER */}
      <div className="w-full max-w-lg" style={{ perspective: "1500px" }}>
        
        {/* PHYSICAL 3D ROTATION CONTAINER */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1500px) rotateY(${isLogin ? 0 : 180}deg) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY + (isLogin ? 0 : 180)}deg) translateZ(10px)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
          className="w-full min-h-[480px] relative preserve-3d"
        >

          {/* ==================== CARD SIDE A: LOGIN ==================== */}
          <div 
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            }}
            className="w-full h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/85 dark:border-slate-800 rounded-[32px] shadow-2xl p-6 sm:p-8 flex flex-col justify-between absolute top-0 left-0 right-0 preserve-3d"
          >
            {/* Reflective spot light effect */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-35 dark:opacity-50 rounded-[32px]"
              style={{
                background: `radial-gradient(circle 280px at ${tilt.glowX}% ${tilt.glowY}%, var(--color-primary-400, #818cf8) 0%, transparent 80%)`,
                mixBlendMode: "screen",
              }}
            />

            <div className="relative z-10 space-y-5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase">Node Session authorization</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {errorStatus && isLogin && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/25 border border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 text-xs flex items-start gap-2 animate-pulse">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorStatus}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Email Address</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@learnsphere.com"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-primary-500 transition-all font-semibold focus:ring-2 focus:ring-primary-500/10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Password Credential</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-primary-500 transition-all font-semibold focus:ring-2 focus:ring-primary-500/10"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-650 hover:to-indigo-650 font-bold text-white text-xs sm:text-sm cursor-pointer shadow-lg active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-b-4 border-indigo-800"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Authorizing Node Connection...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-indigo-200" />
                      <span>Authorize Secure Login</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Launch Shortcut Dock */}
              <div className="pt-5 border-t border-slate-150 dark:border-slate-800/80 text-left">
                <div className="text-[9px] font-mono tracking-widest uppercase text-slate-400 mb-3.5 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse shrink-0" />
                  <span>One-Click Developer sandbox:</span>
                </div>
                
                <div className="space-y-2">
                  {[
                    { 
                      email: "student@learnsphere.com", 
                      name: "Alex Mercer", 
                      role: "STUDENT", 
                      icon: Laptop, 
                      color: "from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400" 
                    },
                    { 
                      email: "instructor@learnsphere.com", 
                      name: "Dr. Angela Cooper", 
                      role: "INSTRUCTOR", 
                      icon: Users, 
                      color: "from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400" 
                    }
                  ].map((sc) => {
                    const Icon = sc.icon;
                    return (
                      <button
                        key={sc.email}
                        type="button"
                        onClick={() => handleShortcutLogin(sc.email)}
                        className={`w-full p-2.5 rounded-xl bg-gradient-to-r ${sc.color} border hover:border-primary-500/50 transition-all text-xs flex items-center justify-between group cursor-pointer`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm border border-slate-200/50 dark:border-slate-800">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left overflow-hidden">
                            <div className="font-extrabold text-slate-850 dark:text-slate-150 leading-tight text-xs truncate max-w-[150px]">{sc.name}</div>
                            <div className="text-[8px] font-mono font-bold opacity-75 mt-0.5 truncate">{sc.role} • {sc.email}</div>
                          </div>
                        </div>
                        <div className="text-[9px] font-mono font-black text-primary-600 dark:text-primary-400 flex items-center gap-1 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800 shrink-0">
                          <span>SYNC</span>
                          <Check className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button 
                type="button"
                onClick={() => { setIsLogin(false); setErrorStatus(null); }}
                className="text-[10px] font-mono tracking-wider uppercase text-slate-400 hover:text-primary-500 transition-colors cursor-pointer"
              >
                No account? Flip to 3D registration Backside ➔
              </button>
            </div>
          </div>


          {/* ==================== CARD SIDE B: SIGNUP (Rotated 180deg) ==================== */}
          <div 
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
            className="w-full h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/85 dark:border-slate-800 rounded-[32px] shadow-2xl p-6 sm:p-8 flex flex-col justify-between absolute top-0 left-0 right-0 preserve-3d"
          >
            {/* Reflective spot light effect on backside */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-35 dark:opacity-50 rounded-[32px]"
              style={{
                background: `radial-gradient(circle 280px at ${tilt.glowX}% ${tilt.glowY}%, var(--color-primary-400, #c084fc) 0%, transparent 80%)`,
                mixBlendMode: "screen",
              }}
            />

            <div className="relative z-10 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase">Generate secure ledger identity</span>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
              </div>

              {errorStatus && !isLogin && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/25 border border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 text-xs flex items-start gap-2 animate-pulse">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorStatus}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {/* Track Selection */}
                <div>
                  <label className="block text-[9px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2 font-bold">
                    Select Academic Specialty Track:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["student", "instructor", "admin"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 px-1 text-[9px] font-bold rounded-xl border uppercase tracking-wider transition-all cursor-pointer ${
                          role === r 
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow"
                            : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Full Legal Name</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 group-focus-within:text-primary-500 pointer-events-none">
                      <UserIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-primary-500 transition-all font-semibold"
                      required={!isLogin}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Email Address</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 group-focus-within:text-primary-500 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@learnsphere.com"
                      className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-primary-500 transition-all font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Security Password</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 group-focus-within:text-primary-500 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-primary-500 transition-all font-semibold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-700 hover:to-indigo-700 font-bold text-white text-xs sm:text-sm cursor-pointer shadow-lg active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-b-4 border-indigo-900"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Forging Sandbox Node...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-purple-200" />
                      <span>Form Identity Credentials</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-4 text-center">
              <button 
                type="button"
                onClick={() => { setIsLogin(true); setErrorStatus(null); }}
                className="text-[10px] font-mono tracking-wider uppercase text-slate-400 hover:text-purple-500 transition-colors cursor-pointer"
              >
                ➔ Already registered? Flip to 3D signin Frontside
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
