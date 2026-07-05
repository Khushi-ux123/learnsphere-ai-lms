/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import StudentDashboard from "./components/StudentDashboard";
import InstructorDashboard from "./components/InstructorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { User, Course, UserRole } from "./types";
import { LogOut, Sparkles, GraduationCap, Laptop, BookOpenCheck, Loader2 } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [viewAuth, setViewAuth] = useState(false);
  const [authRoleChoice, setAuthRoleChoice] = useState<UserRole | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  // Initialize and synchronize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("learnsphere_theme");
    const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme) {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("learnsphere_theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Sync active local browser tokens
  useEffect(() => {
    const savedToken = localStorage.getItem("learnsphere_token");
    if (savedToken) {
      setToken(savedToken);
      fetchMe(savedToken);
    } else {
      setLoading(false);
    }
    fetchCoursesList();
  }, []);

  const fetchMe = async (authToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const currentUserData = await res.json();
        setUser(currentUserData);
      } else {
        // Clear invalid token
        localStorage.removeItem("learnsphere_token");
        setToken(null);
      }
    } catch (e) {
      console.error("Failed to fetch verified current user", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesList = async () => {
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const catalog = await res.json();
        setCourses(catalog);
      }
    } catch (e) {
      console.error("Failed to download system courses", e);
    }
  };

  const handleLoginSuccess = (signedUser: User, signedToken: string) => {
    localStorage.setItem("learnsphere_token", signedToken);
    setToken(signedToken);
    setUser(signedUser);
    setViewAuth(false);
    setAuthRoleChoice(undefined);
  };

  const handleLogout = () => {
    localStorage.removeItem("learnsphere_token");
    setToken(null);
    setUser(null);
    setViewAuth(false);
    setAuthRoleChoice(undefined);
  };

  const handleQuickLaunchRole = (roleChoice?: "student" | "instructor" | "admin") => {
    setAuthRoleChoice(roleChoice);
    setViewAuth(true);
  };

  const refreshUserData = () => {
    if (token) {
      fetchMe(token);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-55 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
        <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Synchronizing LMS Nodes...</span>
      </div>
    );
  }

  // Active Screen Routings
  if (user) {
    if (user.role === "student") {
      return (
        <StudentDashboard 
          user={user} 
          courses={courses} 
          onLogout={handleLogout} 
          refreshUserData={refreshUserData} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      );
    } else if (user.role === "instructor") {
      return (
        <InstructorDashboard 
          user={user} 
          courses={courses} 
          onLogout={handleLogout} 
          onCourseCreated={() => {
            fetchCoursesList();
            refreshUserData();
          }} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      );
    } else if (user.role === "admin") {
      return (
        <AdminDashboard 
          user={user} 
          courses={courses} 
          onLogout={handleLogout} 
          refreshData={() => {
            fetchCoursesList();
            refreshUserData();
          }} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      );
    }
  }

  if (viewAuth) {
    return (
      <AuthScreen 
        initialRole={authRoleChoice} 
        onBack={() => setViewAuth(false)} 
        onLoginSuccess={handleLoginSuccess} 
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <LandingPage 
      courses={courses} 
      onStartLearning={handleQuickLaunchRole} 
      onLoginSuccess={handleLoginSuccess}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  );
}
