/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { User, Course, Enrollment, Certificate, Notification } from "../src/types";

const DB_FILE = path.join(process.cwd(), "db.json");

interface DbSchema {
  users: User[];
  passwords: { [email: string]: string };
  courses: Course[];
  enrollments: Enrollment[];
  certificates: Certificate[];
  notifications: Notification[];
}

const DEFAULT_PASSWORDS: { [email: string]: string } = {
  "student@novalearn.com": "password123",
  "instructor@novalearn.com": "password123",
  "admin@novalearn.com": "password123",
};

const SEED_USERS: User[] = [
  {
    id: "user-student",
    name: "Alex Mercer",
    email: "student@novalearn.com",
    role: "student",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
    xp: 2450,
    streak: 6,
    badges: ["First Step", "Quick Learner", "Quiz Whiz", "AI Conversationalist", "Consistent Scholar"],
    joinedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "user-instructor",
    name: "Dr. Angela Cooper",
    email: "instructor@novalearn.com",
    role: "instructor",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop",
    xp: 8500,
    streak: 12,
    badges: ["Top Educator", "Author of the Month", "Community Anchor"],
    joinedAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "user-admin",
    name: "Catherine Vance",
    email: "admin@novalearn.com",
    role: "admin",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop",
    xp: 15000,
    streak: 30,
    badges: ["Supreme Arbiter", "LMS Founder"],
    joinedAt: "2026-01-01T00:00:00Z",
  }
];

const SEED_COURSES: Course[] = [
  {
    id: "course-react",
    title: "Full-Stack Web Development with React 19 & Express",
    description: "Learn state-of-the-art interactive development using React 19, custom Node server controllers, and beautiful CSS interfaces.",
    longDescription: "Deploy robust corporate-grade dashboards. This comprehensive specialization program scales from HTML/CSS fundamental layouts up to concurrent server routing, Vite middleware configuration, and secure JSON databases on Express and Node.js.",
    category: "Development",
    instructorId: "user-instructor",
    instructorName: "Dr. Angela Cooper",
    instructorTitle: "Principal Engineer & Educator",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop",
    difficulty: "Intermediate",
    price: 99.99,
    rating: 4.8,
    reviews: [
      {
        id: "r1",
        userId: "user-student",
        userName: "Alex Mercer",
        rating: 5,
        comment: "Outstanding structure! The Express server setups and state-driven routes are extremely clean and production-ready.",
        date: "2026-06-10",
      },
      {
        id: "r2",
        userId: "other-stud-1",
        userName: "Sarah Jenkins",
        rating: 4,
        comment: "Excellent pace. Very comprehensive review of React hooks and the new React 19 compiler features.",
        date: "2026-06-12",
      }
    ],
    isPublished: true,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    duration: "24h 45m",
    studentCount: 840,
    modules: [
      {
        id: "m-react-1",
        title: "Module 1: React 19 Foundational State & Hooks",
        lessons: [
          {
            id: "l-react-1-1",
            title: "Lesson 1.1: Unleashing State & Performance optimizations",
            type: "video",
            duration: "15:20",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            content: "Welcome to React 19! In this initial lesson, we learn about foundational states, avoiding excessive re-renders, and the inner workings of the new React compiler (React Forget) which automates hook dependencies memoization.",
          },
          {
            id: "l-react-1-2",
            title: "Lesson 1.2: Mastering Tailwind CSS v4 layout architectures",
            type: "pdf",
            duration: "10 min read",
            content: "### Tailwind CSS v4 Grid & Design Harmony\n\nTailwind v4 introduces a streamlined compiler. Avoid cluttering elements with dozens of arbitrary classes. Instead, combine structural layouts with standard classes:\n- Use `grid grid-cols-1 md:grid-cols-3 gap-6` for responsive bento dashboard panels.\n- Always set `rounded-2xl` (16px) or `rounded-3xl` (24px) to respect modern Stripe/Apple layout design rules.\n- Combine glassmorphism layers (`backdrop-filter`) with subtle ring outlines for stunning aesthetic metrics card visualizers.",
          },
          {
            id: "l-react-1-3",
            title: "Lesson 1.3: Creating a Multi-view SPA state router",
            type: "assignment",
            duration: "45 min task",
            assignmentText: "Assignment task requirement:\nWrite a complete single-page responsive navigation header. The header must support three separate view state modes (Dashboard, Detail, and Creator) and dynamically switch content containers based on a single localized React state. Submit the exact React component code that implements this view routing using simple button handlers.",
          }
        ],
      },
      {
        id: "m-react-2",
        title: "Module 2: Complete Assessments & Performance Quiz",
        lessons: [
          {
            id: "l-react-2-1",
            title: "Quiz 2.1: React 19 & CSS Layout Assessment",
            type: "quiz",
            duration: "10 min timed",
            quizQuestions: [
              {
                id: "q-r-1",
                text: "Which hook can be used in React 19 to safely consume promises or Context objects inline?",
                options: ["use()", "useState()", "useEffectPromise()", "useReactContext()"],
                correctOptionIndex: 0,
                explanation: "The new `use` hook in React 19 can be called conditionally or inline to consume Contexts or Promises dynamically.",
              },
              {
                id: "q-r-2",
                text: "What is the recommended port for all dev servers to run internally in this containerized reverse-proxy setup?",
                options: ["Port 5173", "Port 80", "Port 3000", "Port 8080"],
                correctOptionIndex: 2,
                explanation: "Port 3000 is the ONLY externally accessible port through the nginx reverse-proxy layer in this sandboxed playground environment.",
              }
            ],
          }
        ],
      }
    ],
  },
  {
    id: "course-ux-design",
    title: "Creative Apple-Level UI/UX Design & Spatial Harmony",
    description: "Learn Stripe-inspired grid alignments, glassmorphic visual stacks, minimalist micro-animations, and balanced typography.",
    longDescription: "Learn to design world-class landing pages. This class covers typography rules (such as matching high-character headers written in Space Grotesk with snug body text in Inter), margins spacing, and scroll-triggered interactive highlights.",
    category: "Design",
    instructorId: "user-instructor",
    instructorName: "Dr. Angela Cooper",
    instructorTitle: "Principal Engineer & Educator",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop",
    difficulty: "Beginner",
    price: 49.99,
    rating: 4.9,
    reviews: [],
    isPublished: true,
    thumbnail: "/src/assets/images/apple_ui_design_1781741607210.jpg",
    duration: "10h 15m",
    studentCount: 325,
    modules: [
      {
        id: "m-ux-1",
        title: "Module 1: Typography Balance & Spatial Layout",
        lessons: [
          {
            id: "l-ux-1-1",
            title: "Lesson 1.1: Selecting expressive fonts",
            type: "video",
            duration: "12:50",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            content: "Visual pacing comes from intentional couplings. In this lesson, we study pairing Space Grotesk display headings with Inter for high-density dashboard layouts, and JetBrains Mono for clean technical statistics.",
          },
          {
            id: "l-ux-1-2",
            title: "Lesson 1.2: Interactive design guidelines",
            type: "pdf",
            duration: "8 min read",
            content: "### Designing Premium SaaS Layouts\n\nPremium layout aesthetics rely on absolute structural clarity:\n1. **Zero Gradients Clutter**: Avoid multi-color rainbow backgrounds. Stick to clean, rich greys (`bg-slate-50` / `bg-slate-900`) and use vibrant primary accents sparingly.\n2. **Architectural Honesty**: Ensure every button has a touch space target of at least 44px.\n3. **Generous Borders**: Keep card backgrounds transparently glassy with a subtle white ring outline (`border border-white/20`) to catch the light.",
          }
        ],
      }
    ],
  },
  {
    id: "course-gemini-ai",
    title: "Advanced AI Applications with Gemini 3.5 & Web Systems",
    description: "Learn to integrate Google's latest Gemini models for summarizing courses, chatbot reasoning, and dynamic student assessments.",
    longDescription: "Master generative artificial intelligence workflows. In this specialization, we build server-side proxies to run Gemini 3.5 Flash, parse JSON schemas directly from the model output, and build automated tutor assistants that resolve coding tasks and doubt resolution requests.",
    category: "Science",
    instructorId: "user-instructor",
    instructorName: "Dr. Angela Cooper",
    instructorTitle: "Principal Engineer & Educator",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop",
    difficulty: "Advanced",
    price: 129.99,
    rating: 5.0,
    reviews: [
      {
        id: "review-gemini",
        userId: "other-stud-2",
        userName: "Elena Petrov",
        rating: 5,
        comment: "Absolutely revolutionary. Serving the model through Express APIs and executing real-time summaries is the best way to leverage generative tech in educational settings.",
        date: "2026-06-15",
      }
    ],
    isPublished: true,
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
    duration: "18h 30m",
    studentCount: 512,
    modules: [
      {
        id: "m-gem-1",
        title: "Module 1: Server-Side Generative AI Architecture",
        lessons: [
          {
            id: "l-gem-1-1",
            title: "Lesson 1.1: Creating secure Gemini API Controller",
            type: "video",
            duration: "22:15",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            content: "Learn to construct robust server endpoints in Express using the official @google/genai module. We review how to safely inject process.env.GEMINI_API_KEY on the Node server and avoid exposing keys to client-side bundles.",
          },
          {
            id: "l-gem-1-2",
            title: "Lesson 1.2: Designing Schema-locked structured JSON query formats",
            type: "pdf",
            duration: "15 min read",
            content: "### Generating JSON recipes safely from Gemini\n\nWhen we want Gemini 3.5 Flash to generate Structured parameters such as multiple-choice questions or summarizing notes, we set the response schema:\n\n```ts\nimport { Type } from '@google/genai';\n\nconst response = await ai.models.generateContent({\n  model: 'gemini-3.5-flash',\n  contents: 'Generate a quiz...',\n  config: {\n    responseMimeType: 'application/json',\n    responseSchema: {\n      type: Type.ARRAY,\n      items: {\n        type: Type.OBJECT,\n        properties: {\n          text: { type: Type.STRING },\n          options: { type: Type.ARRAY, items: { type: Type.STRING } },\n          correctOptionIndex: { type: Type.INTEGER }\n        }\n      }\n    }\n  }\n});\n```",
          },
          {
            id: "l-gem-1-3",
            title: "Lesson 1.3: Creating an AI-assisted tutoring playground",
            type: "assignment",
            duration: "1 hour task",
            assignmentText: "Design and implement a doubts routing system where the assistant reviews a student's project code structure and returns actionable debug suggestions in pristine markdown formatting.",
          }
        ],
      },
      {
        id: "m-gem-2",
        title: "Module 2: Real-time Gemini Doubt Resolution",
        lessons: [
          {
            id: "l-gem-2-1",
            title: "Quiz 2.1: Core AI & Gemini Orchestration Assessment",
            type: "quiz",
            duration: "15 min timed",
            quizQuestions: [
              {
                id: "q-g-1",
                text: "Which model alias is recommended for basic text tasks such as summaries, chat doubt-resolution, and quiz formulation?",
                options: ["gemini-1.5-flash", "gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-pro"],
                correctOptionIndex: 1,
                explanation: "The 'gemini-3.5-flash' model is the designated standard for basic text, summarizing, and simple interactive Q&As in our modern SDK guidance.",
              },
              {
                id: "q-g-2",
                text: "How should the Gemini API key be loaded when designing full-stack standard applications?",
                options: ["Hardcoded in App.tsx", "As user input box in settings tab", "Server-side via process.env.GEMINI_API_KEY only", "Exposed using VITE_ prefix"],
                correctOptionIndex: 2,
                explanation: "Always run Gemini queries server-side to hide keys. Gemini API keys must never be prefix-exposed with VITE_ or visible in public client bundles.",
              }
            ],
          }
        ],
      }
    ],
  }
];

const SEED_ENROLLMENTS: Enrollment[] = [
  {
    id: "enr-react-alex",
    userId: "user-student",
    courseId: "course-react",
    enrolledAt: "2026-06-01T12:00:00Z",
    progress: 33,
    completedLessons: ["l-react-1-1"],
    notes: {
      "l-react-1-1": "React 19 compiles states automatically, saving us from writing tedious useMemo loops! This will completely revolutionize highly complex dashboard components.",
    },
    bookmarkedLessons: ["l-react-1-2"],
    quizScores: {},
    submittedAssignments: {},
  }
];

const SEED_CERTIFICATES: Certificate[] = [];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-welcome",
    userId: "user-student",
    title: "Welcome to LearnSphere, Alex!",
    message: "Embark on our Apple-level spatial design paths or full-stack software tracks. Click on your profile to view XP milestones.",
    type: "info",
    date: "2026-06-17T12:00:00Z",
    read: false,
  },
  {
    id: "notif-streak",
    userId: "user-student",
    title: "6-Day Study Streak Active 🔥",
    message: "You are only 1 lesson away from claiming your 7-day badge under the global ranking list!",
    type: "achievement",
    date: "2026-06-17T14:30:00Z",
    read: false,
  }
];

class DatabaseStore {
  private data: DbSchema;

  constructor() {
    this.data = {
      users: [],
      passwords: {},
      courses: [],
      enrollments: [],
      certificates: [],
      notifications: [],
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
        // Ensure default logins exist in loaded passwords
        this.data.passwords = { ...DEFAULT_PASSWORDS, ...this.data.passwords };
      } else {
        // Run seed
        this.data = {
          users: SEED_USERS,
          passwords: DEFAULT_PASSWORDS,
          courses: SEED_COURSES,
          enrollments: SEED_ENROLLMENTS,
          certificates: SEED_CERTIFICATES,
          notifications: SEED_NOTIFICATIONS,
        };
        this.save();
      }
    } catch (err) {
      console.error("Failed to read or parse db.json, holding in memory reset", err);
      this.data = {
        users: SEED_USERS,
        passwords: DEFAULT_PASSWORDS,
        courses: SEED_COURSES,
        enrollments: SEED_ENROLLMENTS,
        certificates: SEED_CERTIFICATES,
        notifications: SEED_NOTIFICATIONS,
      };
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save to db.json", err);
    }
  }

  public getUsers(): User[] {
    return this.data.users;
  }

  public getUser(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public saveUser(user: User) {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.data.users[idx] = user;
    } else {
      this.data.users.push(user);
    }
    this.save();
  }

  public registerUser(user: User, passwordRaw: string) {
    this.saveUser(user);
    this.data.passwords[user.email.toLowerCase()] = passwordRaw;
    this.save();
  }

  public checkPassword(email: string, passwordRaw: string): boolean {
    const pwd = this.data.passwords[email.toLowerCase()];
    return pwd !== undefined && pwd === passwordRaw;
  }

  public getCourses(): Course[] {
    return this.data.courses;
  }

  public getCourse(id: string): Course | undefined {
    return this.data.courses.find(c => c.id === id);
  }

  public saveCourse(course: Course) {
    const idx = this.data.courses.findIndex(c => c.id === course.id);
    if (idx >= 0) {
      this.data.courses[idx] = course;
    } else {
      this.data.courses.push(course);
    }
    this.save();
  }

  public getEnrollments(): Enrollment[] {
    return this.data.enrollments;
  }

  public getUserEnrollments(userId: string): Enrollment[] {
    return this.data.enrollments.filter(e => e.userId === userId);
  }

  public getEnrollment(userId: string, courseId: string): Enrollment | undefined {
    return this.data.enrollments.find(e => e.userId === userId && e.courseId === courseId);
  }

  public saveEnrollment(enrollment: Enrollment) {
    const idx = this.data.enrollments.findIndex(e => e.id === enrollment.id || (e.userId === enrollment.userId && e.courseId === enrollment.courseId));
    if (idx >= 0) {
      this.data.enrollments[idx] = enrollment;
    } else {
      this.data.enrollments.push(enrollment);
    }
    this.save();
  }

  public getCertificates(): Certificate[] {
    return this.data.certificates;
  }

  public getCertificate(id: string): Certificate | undefined {
    return this.data.certificates.find(c => c.id === id || c.uuid === id);
  }

  public getUserCertificates(userId: string): Certificate[] {
    return this.data.certificates.filter(c => c.userId === userId);
  }

  public saveCertificate(cert: Certificate) {
    const idx = this.data.certificates.findIndex(c => c.id === cert.id);
    if (idx >= 0) {
      this.data.certificates[idx] = cert;
    } else {
      this.data.certificates.push(cert);
    }
    this.save();
  }

  public getNotifications(): Notification[] {
    return this.data.notifications;
  }

  public getUserNotifications(userId: string): Notification[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  public saveNotification(notif: Notification) {
    this.data.notifications.push(notif);
    this.save();
  }

  public markNotificationAsRead(notifId: string) {
    const idx = this.data.notifications.findIndex(n => n.id === notifId);
    if (idx >= 0) {
      this.data.notifications[idx].read = true;
      this.save();
    }
  }
}

export const dbStore = new DatabaseStore();
