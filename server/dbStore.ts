/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { Client } from "pg";
import { User, Course, Enrollment, Certificate, Notification } from "../src/types";
import { postgresSchemaSQL } from "../src/db/schema";

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
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
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
  private pgClient: Client | null = null;
  public isPostgres = false;

  constructor() {
    this.data = {
      users: [],
      passwords: {},
      courses: [],
      enrollments: [],
      certificates: [],
      notifications: [],
    };
    // Initial sync-load of fallback local JSON.
    // If PostgreSQL connects, this.initialize() will swap it.
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
        this.data.passwords = { ...DEFAULT_PASSWORDS, ...this.data.passwords };
      } else {
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

  public async initialize() {
    let dbUrl = process.env.DATABASE_URL || "";
    if (!dbUrl) {
      console.log("No DATABASE_URL found. Using local JSON store.");
      return;
    }

    // Clean up square bracket formatting in passwords if present from copy-paste
    if (dbUrl.includes(":[") && dbUrl.includes("]@")) {
      dbUrl = dbUrl.replace(":[", ":").replace("]@", "@");
    }

    try {
      console.log("Connecting to PostgreSQL/Supabase database...");
      this.pgClient = new Client({
        connectionString: dbUrl,
        ssl: dbUrl.includes("supabase") || dbUrl.includes("elephantsql") || dbUrl.includes("localhost") === false
          ? { rejectUnauthorized: false }
          : false,
      });

      await this.pgClient.connect();
      console.log("Successfully connected to PostgreSQL/Supabase!");
      this.isPostgres = true;

      // Check if users table exists
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'users'
        );
      `;
      const checkRes = await this.pgClient.query(checkTableQuery);
      const tablesExist = checkRes.rows[0]?.exists;

      if (!tablesExist) {
        console.log("Tables do not exist. Creating schema & executing scripts...");
        await this.pgClient.query(postgresSchemaSQL);
        console.log("Schema tables created successfully!");

        console.log("Seeding PostgreSQL tables with default LearnSphere records...");
        await this.seedPostgres();
        console.log("Database seeded successfully!");
      }

      await this.loadFromPostgres();
      console.log("Loaded local cache from PostgreSQL successfully!");

    } catch (err) {
      console.error("Failed to initialize PostgreSQL. Falling back to local JSON file store.", err);
      this.isPostgres = false;
      this.load();
    }
  }

  private async seedPostgres() {
    if (!this.pgClient) return;

    // Seed Users
    for (const u of SEED_USERS) {
      await this.pgClient.query(
        `INSERT INTO users (id, name, email, password_hash, role, avatar_url, xp, streak, badges, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.name, u.email, DEFAULT_PASSWORDS[u.email] || 'password123', u.role, u.avatarUrl, u.xp, u.streak, u.badges, u.joinedAt ? new Date(u.joinedAt) : new Date()]
      );
    }

    // Seed Courses
    for (const c of SEED_COURSES) {
      await this.pgClient.query(
        `INSERT INTO courses (id, title, description, long_description, category, instructor_id, difficulty, price, rating, thumbnail_url, duration, student_count, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.title, c.description, c.longDescription || "", c.category, c.instructorId, c.difficulty, c.price, c.rating, c.thumbnail || "", c.duration, c.studentCount, c.isPublished]
      );

      let mIdx = 0;
      for (const m of c.modules) {
        await this.pgClient.query(
          `INSERT INTO modules (id, course_id, title, sort_order)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO NOTHING`,
          [m.id, c.id, m.title, mIdx++]
        );

        let lIdx = 0;
        for (const l of m.lessons) {
          await this.pgClient.query(
            `INSERT INTO lessons (id, module_id, title, type, duration, video_url, pdf_url, content, assignment_text, quiz_questions, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (id) DO NOTHING`,
            [
              l.id, m.id, l.title, l.type, l.duration,
              l.videoUrl || null, l.pdfUrl || null, l.content || null, l.assignmentText || null,
              l.quizQuestions ? JSON.stringify(l.quizQuestions) : null, lIdx++
            ]
          );
        }
      }

      // Reviews
      for (const r of c.reviews) {
        await this.pgClient.query(
          `INSERT INTO reviews (id, course_id, user_id, rating, comment, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [r.id, c.id, r.userId, r.rating, r.comment, r.date ? new Date(r.date) : new Date()]
        );
      }
    }

    // Seed Enrollments
    for (const e of SEED_ENROLLMENTS) {
      await this.pgClient.query(
        `INSERT INTO enrollments (id, user_id, course_id, progress, completed_lessons, notes, bookmarked_lessons, quiz_scores, submitted_assignments, enrolled_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          e.id, e.userId, e.courseId, e.progress, e.completedLessons,
          JSON.stringify(e.notes), e.bookmarkedLessons, JSON.stringify(e.quizScores),
          JSON.stringify(e.submittedAssignments), e.enrolledAt ? new Date(e.enrolledAt) : new Date()
        ]
      );
    }

    // Seed Notifications
    for (const n of SEED_NOTIFICATIONS) {
      await this.pgClient.query(
        `INSERT INTO notifications (id, user_id, title, message, type, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [n.id, n.userId, n.title, n.message, n.type, n.read, n.date ? new Date(n.date) : new Date()]
      );
    }
  }

  private async loadFromPostgres() {
    if (!this.pgClient) return;

    const usersRes = await this.pgClient.query(`SELECT * FROM users`);
    const coursesRes = await this.pgClient.query(`SELECT * FROM courses`);
    const modulesRes = await this.pgClient.query(`SELECT * FROM modules ORDER BY sort_order ASC`);
    const lessonsRes = await this.pgClient.query(`SELECT * FROM lessons ORDER BY sort_order ASC`);
    const reviewsRes = await this.pgClient.query(`SELECT * FROM reviews ORDER BY created_at DESC`);
    const enrollmentsRes = await this.pgClient.query(`SELECT * FROM enrollments`);
    const certificatesRes = await this.pgClient.query(`SELECT * FROM certificates`);
    const notificationsRes = await this.pgClient.query(`SELECT * FROM notifications ORDER BY created_at DESC`);

    // Parse Users
    const users: User[] = usersRes.rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatar_url || "",
      xp: u.xp,
      streak: u.streak,
      badges: u.badges || [],
      joinedAt: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString()
    }));

    const passwords: { [email: string]: string } = {};
    usersRes.rows.forEach(u => {
      if (u.password_hash) {
        passwords[u.email.toLowerCase()] = u.password_hash;
      }
    });

    // Parse Reviews
    const reviewsByCourse: { [courseId: string]: any[] } = {};
    reviewsRes.rows.forEach(r => {
      const user = users.find(u => u.id === r.user_id);
      const reviewObj = {
        id: r.id,
        userId: r.user_id,
        userName: user ? user.name : "Student",
        rating: r.rating,
        comment: r.comment,
        date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
      if (!reviewsByCourse[r.course_id]) {
        reviewsByCourse[r.course_id] = [];
      }
      reviewsByCourse[r.course_id].push(reviewObj);
    });

    // Parse Lessons
    const lessonsByModule: { [moduleId: string]: any[] } = {};
    lessonsRes.rows.forEach(l => {
      const lessonObj = {
        id: l.id,
        title: l.title,
        type: l.type,
        duration: l.duration,
        videoUrl: l.video_url || undefined,
        pdfUrl: l.pdf_url || undefined,
        content: l.content || undefined,
        assignmentText: l.assignment_text || undefined,
        quizQuestions: typeof l.quiz_questions === 'string' ? JSON.parse(l.quiz_questions) : l.quiz_questions || undefined
      };
      if (!lessonsByModule[l.module_id]) {
        lessonsByModule[l.module_id] = [];
      }
      lessonsByModule[l.module_id].push(lessonObj);
    });

    // Parse Modules
    const modulesByCourse: { [courseId: string]: any[] } = {};
    modulesRes.rows.forEach(m => {
      const moduleObj = {
        id: m.id,
        title: m.title,
        lessons: lessonsByModule[m.id] || []
      };
      if (!modulesByCourse[m.course_id]) {
        modulesByCourse[m.course_id] = [];
      }
      modulesByCourse[m.course_id].push(moduleObj);
    });

    // Parse Courses
    const courses: Course[] = coursesRes.rows.map(c => {
      const instructor = users.find(u => u.id === c.instructor_id);
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        longDescription: c.long_description || "",
        category: c.category,
        instructorId: c.instructor_id,
        instructorName: instructor ? instructor.name : "Instructor",
        instructorTitle: "Principal Engineer & Educator",
        instructorAvatar: instructor ? instructor.avatarUrl : "",
        difficulty: c.difficulty as any,
        price: typeof c.price === 'string' ? parseFloat(c.price) : c.price,
        rating: typeof c.rating === 'string' ? parseFloat(c.rating) : c.rating,
        reviews: reviewsByCourse[c.id] || [],
        isPublished: c.is_published,
        thumbnail: c.thumbnail_url || "",
        duration: c.duration,
        studentCount: c.student_count,
        modules: modulesByCourse[c.id] || []
      };
    });

    // Parse Enrollments
    const enrollments: Enrollment[] = enrollmentsRes.rows.map(e => ({
      id: e.id,
      userId: e.user_id,
      courseId: e.course_id,
      progress: e.progress,
      completedLessons: e.completed_lessons || [],
      notes: typeof e.notes === 'string' ? JSON.parse(e.notes) : e.notes || {},
      bookmarkedLessons: e.bookmarked_lessons || [],
      quizScores: typeof e.quiz_scores === 'string' ? JSON.parse(e.quiz_scores) : e.quiz_scores || {},
      submittedAssignments: typeof e.submitted_assignments === 'string' ? JSON.parse(e.submitted_assignments) : e.submitted_assignments || {},
      enrolledAt: e.enrolled_at ? new Date(e.enrolled_at).toISOString() : new Date().toISOString()
    }));

    // Parse Certificates
    const certificates: Certificate[] = certificatesRes.rows.map(c => {
      const user = users.find(u => u.id === c.user_id);
      const course = courses.find(co => co.id === c.course_id);
      return {
        id: c.id,
        userId: c.user_id,
        courseId: c.course_id,
        uuid: c.uuid,
        userName: user ? user.name : "Student",
        courseTitle: course ? course.title : "Course Specialization",
        instructorName: course ? course.instructorName : "Angela Cooper",
        issueDate: c.issue_date ? new Date(c.issue_date).toISOString() : new Date().toISOString()
      };
    });

    // Parse Notifications
    const notifications: Notification[] = notificationsRes.rows.map(n => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type as any,
      read: n.read,
      date: n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString()
    }));

    this.data = {
      users,
      passwords,
      courses,
      enrollments,
      certificates,
      notifications
    };
  }

  private async runQuery(sql: string, params: any[] = []) {
    if (this.isPostgres && this.pgClient) {
      return this.pgClient.query(sql, params);
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

    // PG WRITE-THROUGH
    if (this.isPostgres) {
      this.runQuery(
        `INSERT INTO users (id, name, email, role, avatar_url, xp, streak, badges)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           role = EXCLUDED.role,
           avatar_url = EXCLUDED.avatar_url,
           xp = EXCLUDED.xp,
           streak = EXCLUDED.streak,
           badges = EXCLUDED.badges`,
        [user.id, user.name, user.email, user.role, user.avatarUrl, user.xp, user.streak, user.badges]
      ).catch(err => console.error("Postgres async write-through saveUser failed:", err));
    }
  }

  public registerUser(user: User, passwordRaw: string) {
    this.saveUser(user);
    this.data.passwords[user.email.toLowerCase()] = passwordRaw;
    this.save();

    // PG WRITE-THROUGH
    if (this.isPostgres) {
      this.runQuery(
        `INSERT INTO users (id, name, email, password_hash, role, avatar_url, xp, streak, badges)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           avatar_url = EXCLUDED.avatar_url,
           xp = EXCLUDED.xp,
           streak = EXCLUDED.streak,
           badges = EXCLUDED.badges`,
         [user.id, user.name, user.email, passwordRaw, user.role, user.avatarUrl, user.xp, user.streak, user.badges]
      ).catch(err => console.error("Postgres registerUser failed:", err));
    }
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

    // PG WRITE-THROUGH
    if (this.isPostgres) {
      this.runQuery(
        `INSERT INTO courses (id, title, description, long_description, category, instructor_id, difficulty, price, rating, thumbnail_url, duration, student_count, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           long_description = EXCLUDED.long_description,
           category = EXCLUDED.category,
           instructor_id = EXCLUDED.instructor_id,
           difficulty = EXCLUDED.difficulty,
           price = EXCLUDED.price,
           rating = EXCLUDED.rating,
           thumbnail_url = EXCLUDED.thumbnail_url,
           duration = EXCLUDED.duration,
           student_count = EXCLUDED.student_count,
           is_published = EXCLUDED.is_published`,
        [
          course.id, course.title, course.description, course.longDescription || "", course.category,
          course.instructorId, course.difficulty, course.price, course.rating, course.thumbnail || "",
          course.duration, course.studentCount, course.isPublished
        ]
      ).then(async () => {
        let mIdx = 0;
        for (const m of course.modules) {
          await this.runQuery(
            `INSERT INTO modules (id, course_id, title, sort_order)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO UPDATE SET
               title = EXCLUDED.title,
               sort_order = EXCLUDED.sort_order`,
            [m.id, course.id, m.title, mIdx++]
          );

          let lIdx = 0;
          for (const l of m.lessons) {
            await this.runQuery(
              `INSERT INTO lessons (id, module_id, title, type, duration, video_url, pdf_url, content, assignment_text, quiz_questions, sort_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
               ON CONFLICT (id) DO UPDATE SET
                 title = EXCLUDED.title,
                 type = EXCLUDED.type,
                 duration = EXCLUDED.duration,
                 video_url = EXCLUDED.video_url,
                 pdf_url = EXCLUDED.pdf_url,
                 content = EXCLUDED.content,
                 assignment_text = EXCLUDED.assignment_text,
                 quiz_questions = EXCLUDED.quiz_questions,
                 sort_order = EXCLUDED.sort_order`,
              [
                l.id, m.id, l.title, l.type, l.duration,
                l.videoUrl || null, l.pdfUrl || null, l.content || null, l.assignmentText || null,
                l.quizQuestions ? JSON.stringify(l.quizQuestions) : null, lIdx++
              ]
            );
          }
        }
      }).catch(err => console.error("Postgres saveCourse failed:", err));
    }
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

    // PG WRITE-THROUGH
    if (this.isPostgres) {
      this.runQuery(
        `INSERT INTO enrollments (id, user_id, course_id, progress, completed_lessons, notes, bookmarked_lessons, quiz_scores, submitted_assignments)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           progress = EXCLUDED.progress,
           completed_lessons = EXCLUDED.completed_lessons,
           notes = EXCLUDED.notes,
           bookmarked_lessons = EXCLUDED.bookmarked_lessons,
           quiz_scores = EXCLUDED.quiz_scores,
           submitted_assignments = EXCLUDED.submitted_assignments`,
        [
          enrollment.id, enrollment.userId, enrollment.courseId, enrollment.progress,
          enrollment.completedLessons, JSON.stringify(enrollment.notes), enrollment.bookmarkedLessons,
          JSON.stringify(enrollment.quizScores), JSON.stringify(enrollment.submittedAssignments)
        ]
      ).catch(err => console.error("Postgres saveEnrollment failed:", err));
    }
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

    // PG WRITE-THROUGH
    if (this.isPostgres) {
      this.runQuery(
        `INSERT INTO certificates (id, user_id, course_id, uuid)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           course_id = EXCLUDED.course_id,
           uuid = EXCLUDED.uuid`,
        [cert.id, cert.userId, cert.courseId, cert.uuid]
      ).catch(err => console.error("Postgres saveCertificate failed:", err));
    }
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

    // PG WRITE-THROUGH
    if (this.isPostgres) {
      this.runQuery(
        `INSERT INTO notifications (id, user_id, title, message, type, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           message = EXCLUDED.message,
           type = EXCLUDED.type,
           read = EXCLUDED.read`,
         [notif.id, notif.userId, notif.title, notif.message, notif.type, notif.read, notif.date ? new Date(notif.date) : new Date()]
      ).catch(err => console.error("Postgres saveNotification failed:", err));
    }
  }

  public markNotificationAsRead(notifId: string) {
    const idx = this.data.notifications.findIndex(n => n.id === notifId);
    if (idx >= 0) {
      this.data.notifications[idx].read = true;
      this.save();
    }

    // PG WRITE-THROUGH
    if (this.isPostgres) {
      this.runQuery(
        `UPDATE notifications SET read = true WHERE id = $1`,
        [notifId]
      ).catch(err => console.error("Postgres markNotificationAsRead failed:", err));
    }
  }
}

export const dbStore = new DatabaseStore();
