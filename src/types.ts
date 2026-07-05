/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "student" | "instructor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  xp: number;
  streak: number;
  badges: string[];
  joinedAt: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: "video" | "pdf" | "assignment" | "quiz";
  duration: string;
  videoUrl?: string; // e.g. youtube/vimeo/mock video stream
  pdfUrl?: string;   // e.g. path to file or text description
  content?: string;  // markdown content or textual lesson content
  assignmentText?: string;
  quizQuestions?: Question[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  instructorId: string;
  instructorName: string;
  instructorTitle?: string;
  instructorAvatar?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  rating: number;
  reviews: Review[];
  modules: Module[];
  isPublished: boolean;
  thumbnail: string;
  duration: string;
  studentCount: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progress: number; // Percentage (0-100)
  completedLessons: string[]; // List of completed lessonIds
  notes: { [lessonId: string]: string }; // Notes taken per lesson
  bookmarkedLessons: string[]; // Lesson IDs that are bookmarked
  quizScores: { [lessonId: string]: number }; // Score percentage (0-100) for completed quizzes
  submittedAssignments: { [lessonId: string]: { submissionText: string; submittedAt: string; grade?: string; feedback?: string } };
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  uuid: string; // Dynamic Verification Code
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "achievement" | "deadline" | "system";
  date: string;
  read: boolean;
}

export interface LeaderboardUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  xp: number;
  streak: number;
  badgesCount: number;
  rank: number;
}
