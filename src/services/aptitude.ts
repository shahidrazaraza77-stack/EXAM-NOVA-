import { apiFetch } from "@/lib/api";

type TopicRow = any;
type QuestionRow = any;
type AttemptRow = any;
type BookmarkRow = any;
type TestAttemptRow = any;

export interface FrontendQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  topic_id: string;
  category: string;
  companies: string[];
}

const letterToIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
const indexToLetter = ["A", "B", "C", "D"];

/**
 * Maps a database question row to the format expected by the frontend components
 */
export function mapDbQuestionToFrontend(dbQ: any): FrontendQuestion {
  return {
    id: dbQ.id,
    question: dbQ.question,
    options: [dbQ.option_a, dbQ.option_b, dbQ.option_c, dbQ.option_d],
    correctAnswer: letterToIndex[dbQ.correct_answer] ?? 0,
    explanation: dbQ.explanation || "",
    difficulty: dbQ.difficulty as "Easy" | "Medium" | "Hard",
    topic: dbQ.aptitude_topics?.name || dbQ.topic_name || "Aptitude",
    topic_id: dbQ.topic_id || "",
    category: dbQ.aptitude_topics?.category || dbQ.category || "quantitative",
    companies: dbQ.companies || [],
  };
}

export const aptitudeService = {
  /**
   * Fetch all topics
   */
  async getTopics(): Promise<TopicRow[]> {
    const res = await apiFetch("/api/aptitude/topics");
    if (!res.ok) throw new Error("Failed to fetch topics");
    const data = await res.json();
    return data.topics || [];
  },

  /**
   * Fetch questions with topic, difficulty, search, and solved status filters
   */
  async getQuestions(params: {
    userId?: string;
    topicId?: string;
    topicName?: string;
    difficulty?: string;
    search?: string;
    solvedStatus?: "all" | "solved" | "unsolved";
    companyName?: string;
    page?: number;
    limit?: number;
  }): Promise<FrontendQuestion[]> {
    const queryParts: string[] = [];
    if (params.topicId) queryParts.push(`topicId=${params.topicId}`);
    if (params.topicName) queryParts.push(`topicName=${encodeURIComponent(params.topicName)}`);
    if (params.difficulty) queryParts.push(`difficulty=${params.difficulty}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.companyName) queryParts.push(`companyName=${encodeURIComponent(params.companyName)}`);
    if (params.solvedStatus) queryParts.push(`solvedStatus=${params.solvedStatus}`);
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const res = await apiFetch(`/api/aptitude/questions${queryString}`);
    if (!res.ok) throw new Error("Failed to fetch questions");
    const data = await res.json();
    return (data.questions || []).map(mapDbQuestionToFrontend);
  },

  /**
   * Submit an individual answer attempt
   */
  async submitAnswer(
    userId: string,
    questionId: string,
    selectedAnswerIndex: number,
    isCorrect: boolean,
    timeTaken: number
  ): Promise<AttemptRow> {
    const res = await apiFetch("/api/aptitude/attempts", {
      method: "POST",
      body: JSON.stringify({ questionId, selectedOption: selectedAnswerIndex, isCorrect, timeTaken }),
    });
    if (!res.ok) {
      let errorMsg = "Failed to save answer";
      try {
        const errJson = await res.json();
        errorMsg = errJson.error || errorMsg;
        if (errJson.details) {
          console.error("submitAnswer API error details:", errJson.details);
        }
      } catch (e) {
        console.error("submitAnswer failed to parse error response:", e);
      }
      throw new Error(errorMsg);
    }
    const data = await res.json();
    return data.attempt;
  },

  /**
   * Get attempt history for a user
   */
  async getAttempts(userId: string): Promise<AttemptRow[]> {
    const res = await apiFetch("/api/aptitude/attempts");
    if (!res.ok) throw new Error("Failed to fetch attempts");
    const data = await res.json();
    return data.attempts || [];
  },

  /**
   * Get all bookmarked questions for a user
   */
  async getBookmarks(userId: string): Promise<FrontendQuestion[]> {
    const res = await apiFetch("/api/aptitude/bookmarks");
    if (!res.ok) throw new Error("Failed to fetch bookmarks");
    const data = await res.json();
    return (data.bookmarks || []).map(mapDbQuestionToFrontend);
  },

  /**
   * Add a bookmark
   */
  async addBookmark(userId: string, questionId: string): Promise<BookmarkRow> {
    const res = await apiFetch("/api/aptitude/bookmarks", {
      method: "POST",
      body: JSON.stringify({ questionId }),
    });
    if (!res.ok) throw new Error("Failed to add bookmark");
    const data = await res.json();
    return data.bookmark;
  },

  /**
   * Remove a bookmark
   */
  async removeBookmark(userId: string, questionId: string): Promise<void> {
    const res = await apiFetch(`/api/aptitude/bookmarks?questionId=${questionId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove bookmark");
  },

  /**
   * Fetch all mock tests mapped to the frontend MockTest format
   */
  async getMockTests(): Promise<any[]> {
    const res = await apiFetch("/api/aptitude/tests");
    if (!res.ok) throw new Error("Failed to fetch mock tests");
    const data = await res.json();
    return data.tests || [];
  },

  /**
   * Fetch all questions inside a specific test
   */
  async getTestQuestions(testId: string): Promise<FrontendQuestion[]> {
    const res = await apiFetch(`/api/aptitude/tests/${testId}`);
    if (!res.ok) throw new Error("Failed to fetch test questions");
    const data = await res.json();
    return (data.questions || []).map(mapDbQuestionToFrontend);
  },

  /**
   * Submit a full mock test attempt
   */
  async submitTestAttempt(
    userId: string,
    testId: string,
    score: number,
    correctAnswers: number,
    totalQuestions: number,
    answers: Array<{ questionId: string; selectedOption: number; isCorrect: boolean }>
  ): Promise<TestAttemptRow> {
    const res = await apiFetch("/api/aptitude/tests/attempts", {
      method: "POST",
      body: JSON.stringify({ testId, score, correctAnswers, totalQuestions, answers }),
    });
    if (!res.ok) throw new Error("Failed to submit test attempt");
    const data = await res.json();
    return data.attempt;
  },

  /**
   * Fetch dashboard analytics metrics for a user
   */
  async getAnalytics(userId: string) {
    const res = await apiFetch("/api/aptitude/analytics");
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return await res.json();
  },

  // Admin CMS Functions
  async adminAddQuestion(question: Omit<QuestionRow, "id" | "created_at">) {
    const res = await apiFetch("/api/admin/aptitude/questions", {
      method: "POST",
      body: JSON.stringify(question),
    });
    if (!res.ok) throw new Error("Failed to create admin question");
    const data = await res.json();
    return data.question;
  },

  async adminEditQuestion(id: string, updates: Partial<QuestionRow>) {
    const res = await apiFetch(`/api/admin/aptitude/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update admin question");
    const data = await res.json();
    return data.question;
  },

  async adminDeleteQuestion(id: string) {
    const res = await apiFetch(`/api/admin/aptitude/questions/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete admin question");
  },

  async adminBulkImport(questions: Array<Omit<QuestionRow, "id" | "created_at">>) {
    const imported = [];
    for (const q of questions) {
      const data = await this.adminAddQuestion(q);
      imported.push(data);
    }
    return imported;
  },
};
