import { z } from "zod";

// 1. Aptitude Attempt Validation
export const aptitudeAttemptSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  selectedOption: z.number().int().min(0).max(3, "Option index must be between 0 and 3"),
  isCorrect: z.boolean(),
  timeTaken: z.number().int().min(0, "Time taken cannot be negative"),
});

// 2. Aptitude Mock Test Attempt Validation
export const aptitudeTestAttemptSchema = z.object({
  testId: z.string().min(1, "Test ID is required"),
  score: z.number().min(0).max(100, "Score must be between 0 and 100"),
  correctAnswers: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1, "Question ID is required"),
      selectedOption: z.number().int().min(0).max(3),
      isCorrect: z.boolean(),
    })
  ).min(1, "Must submit answers for at least one question"),
});

// 3. Bookmark Toggle Validation
export const bookmarkSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
});

export const codingBookmarkSchema = z.object({
  problemId: z.string().min(1, "Invalid problem ID format"),
});

// 4. Coding Draft Save Validation
export const codingDraftSchema = z.object({
  questionId: z.string().min(1, "Invalid question ID format"),
  language: z.string().min(1, "Language is required"),
  code: z.string(),
});

// 5. Coding Solution Submission Validation
export const codingSubmissionSchema = z.object({
  questionId: z.string().min(1, "Invalid question ID format"),
  code: z.string().min(1, "Code content cannot be empty"),
  language: z.string().min(1, "Language is required"),
  status: z.string().min(1, "Status is required"),
  executionTime: z.number().optional(),
  memoryUsed: z.number().optional(),
  testCasesPassed: z.number().int().min(0).optional(),
  totalTestCases: z.number().int().min(0).optional(),
  errorMessage: z.string().nullable().optional(),
});

// 6. Admin Aptitude Question CRUD Validation
export const adminAptitudeQuestionSchema = z.object({
  topic_id: z.string().min(1, "Invalid topic ID format"),
  question: z.string().min(5, "Question must be at least 5 characters"),
  option_a: z.string().min(1, "Option A is required"),
  option_b: z.string().min(1, "Option B is required"),
  option_c: z.string().min(1, "Option C is required"),
  option_d: z.string().min(1, "Option D is required"),
  correct_answer: z.enum(["A", "B", "C", "D"] as const),
  explanation: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"] as const),
  companies: z.array(z.string()).default([]),
});

// 7. Admin Coding Problem CRUD Validation
export const adminCodingProblemSchema = z.object({
  topic_id: z.string().min(1, "Invalid topic ID format").nullable().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  difficulty: z.enum(["Easy", "Medium", "Hard"] as const),
  constraints: z.array(z.string()).default([]),
  sample_input: z.string().optional(),
  sample_output: z.string().optional(),
  explanation: z.string().optional(),
  companies: z.array(z.string()).default([]),
  starter_code: z.record(z.string(), z.string()).default({}),
  optimal_solutions: z.record(z.string(), z.string()).default({}),
  complexity: z.object({
    time: z.string().default("O(N)"),
    space: z.string().default("O(1)"),
  }).default({ time: "O(N)", space: "O(1)" }),
  examples: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
      explanation: z.string().optional(),
    })
  ).default([]),
  acceptance_rate: z.string().default("50.0%"),
});
