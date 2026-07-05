/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// This file defines the PostgreSQL schemas using Drizzle-like syntax
// It functions as a production-ready reference for the relational schema requested in the deliverables.

export const postgresSchemaSQL = `
-- Drop tables if they exist
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "certificates" CASCADE;
DROP TABLE IF EXISTS "enrollments" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "lessons" CASCADE;
DROP TABLE IF EXISTS "modules" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Users table
CREATE TABLE "users" (
  "id" VARCHAR(255) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255),
  "role" VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  "avatar_url" TEXT,
  "xp" INTEGER DEFAULT 0 NOT NULL,
  "streak" INTEGER DEFAULT 0 NOT NULL,
  "badges" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Courses table
CREATE TABLE "courses" (
  "id" VARCHAR(255) PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "long_description" TEXT,
  "category" VARCHAR(100) NOT NULL,
  "instructor_id" VARCHAR(255) REFERENCES "users"("id") ON DELETE CASCADE,
  "difficulty" VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  "price" NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  "rating" NUMERIC(3, 2) DEFAULT 0.00 NOT NULL,
  "thumbnail_url" TEXT,
  "duration" VARCHAR(100) DEFAULT '0' NOT NULL,
  "student_count" INTEGER DEFAULT 0 NOT NULL,
  "is_published" BOOLEAN DEFAULT false NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Modules table
CREATE TABLE "modules" (
  "id" VARCHAR(255) PRIMARY KEY,
  "course_id" VARCHAR(255) REFERENCES "courses"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "sort_order" INTEGER DEFAULT 0 NOT NULL
);

-- Lessons table
CREATE TABLE "lessons" (
  "id" VARCHAR(255) PRIMARY KEY,
  "module_id" VARCHAR(255) REFERENCES "modules"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "type" VARCHAR(50) NOT NULL CHECK (type IN ('video', 'pdf', 'assignment', 'quiz')),
  "duration" VARCHAR(50),
  "video_url" TEXT,
  "pdf_url" TEXT,
  "content" TEXT,
  "assignment_text" TEXT,
  "quiz_questions" JSONB,
  "sort_order" INTEGER DEFAULT 0 NOT NULL
);

-- Enrollments table
CREATE TABLE "enrollments" (
  "id" VARCHAR(255) PRIMARY KEY,
  "user_id" VARCHAR(255) REFERENCES "users"("id") ON DELETE CASCADE,
  "course_id" VARCHAR(255) REFERENCES "courses"("id") ON DELETE CASCADE,
  "progress" INTEGER DEFAULT 0 NOT NULL,
  "completed_lessons" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  "notes" JSONB DEFAULT '{}'::JSONB NOT NULL,
  "bookmarked_lessons" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  "quiz_scores" JSONB DEFAULT '{}'::JSONB NOT NULL,
  "submitted_assignments" JSONB DEFAULT '{}'::JSONB NOT NULL,
  "enrolled_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "user_course_unique" UNIQUE ("user_id", "course_id")
);

-- Certificates table
CREATE TABLE "certificates" (
  "id" VARCHAR(255) PRIMARY KEY,
  "user_id" VARCHAR(255) REFERENCES "users"("id") ON DELETE CASCADE,
  "course_id" VARCHAR(255) REFERENCES "courses"("id") ON DELETE CASCADE,
  "uuid" VARCHAR(255) UNIQUE NOT NULL,
  "issue_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Reviews table
CREATE TABLE "reviews" (
  "id" VARCHAR(255) PRIMARY KEY,
  "course_id" VARCHAR(255) REFERENCES "courses"("id") ON DELETE CASCADE,
  "user_id" VARCHAR(255) REFERENCES "users"("id") ON DELETE CASCADE,
  "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "comment" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Notifications table
CREATE TABLE "notifications" (
  "id" VARCHAR(255) PRIMARY KEY,
  "user_id" VARCHAR(255) REFERENCES "users"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "type" VARCHAR(50) DEFAULT 'info' NOT NULL,
  "read" BOOLEAN DEFAULT false NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index optimization
CREATE INDEX "idx_courses_instructor" ON "courses"("instructor_id");
CREATE INDEX "idx_modules_course" ON "modules"("course_id");
CREATE INDEX "idx_lessons_module" ON "lessons"("module_id");
CREATE INDEX "idx_enrollments_user" ON "enrollments"("user_id");
CREATE INDEX "idx_enrollments_course" ON "enrollments"("course_id");
`;
