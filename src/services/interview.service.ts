import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";

export interface InterviewSession {
  id: string;
  user_id: string;
  mode: "hr" | "technical" | "mixed" | "company" | "resume";
  score: number;
  communication_score: number;
  technical_score: number;
  confidence_score: number;
  duration: number;
  role: string;
  difficulty: string;
  company: string | null;
  resume_id: string | null;
  created_at: string;
}

export interface InterviewQuestion {
  id: string;
  mode: "hr" | "technical" | "mixed" | "company" | "resume";
  question: string;
  expected_answer: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  created_at: string;
}

export interface InterviewAnswer {
  id: string;
  session_id: string;
  question_id: string;
  user_answer: string;
  ai_feedback: string;
  score: number;
  created_at: string;
}

export interface InterviewFeedbackResult {
  score: number;
  feedback: string;
  improvements: string[];
  confidence_level: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  clarityScore: number;
}

export const interviewService = {
  async startSession(
    userId: string,
    mode: string,
    role: string,
    difficulty: string = "medium",
    company: string | null = null,
    resumeId: string | null = null
  ): Promise<InterviewSession> {
    let modeConstraint = mode.toLowerCase();
    if (
      modeConstraint !== "hr" &&
      modeConstraint !== "technical" &&
      modeConstraint !== "mixed" &&
      modeConstraint !== "company" &&
      modeConstraint !== "resume"
    ) {
      modeConstraint = "hr";
    }

    let diffConstraint = difficulty.toLowerCase();
    if (diffConstraint !== "easy" && diffConstraint !== "medium" && diffConstraint !== "hard") {
      diffConstraint = "medium";
    }

    const { data, error } = await (supabase as any)
      .from("interview_sessions")
      .insert({
        user_id: userId,
        mode: modeConstraint,
        role,
        difficulty: diffConstraint,
        company,
        resume_id: resumeId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as InterviewSession;
  },

  async generateQuestion(
    sessionId: string,
    interviewType: string,
    role: string,
    level: string,
    previousQuestions: string[]
  ): Promise<InterviewQuestion> {
    const response = await apiFetch("/api/interview/question", {
      method: "POST",
      body: JSON.stringify({ sessionId, previousQuestions }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to generate question");
    }

    const { question } = await response.json();
    return question as InterviewQuestion;
  },

  async submitAnswer(
    sessionId: string,
    questionId: string,
    questionText: string,
    answer: string
  ): Promise<InterviewAnswer> {
    let validQuestionId = questionId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(questionId);

    // If questionId is a local fake ID (e.g. from fallbacks), create it in the database bank first
    if (!isUuid) {
      const { data: qData, error: qError } = await (supabase as any)
        .from("interview_questions")
        .insert({
          mode: "hr",
          question: questionText,
          expected_answer: "Fallback question context",
          difficulty: "medium",
          topic: "General",
        })
        .select()
        .single();

      if (qError) {
        console.error("Error creating fallback question in db bank:", qError);
      } else {
        validQuestionId = qData.id;
      }
    }

    const { data, error } = await (supabase as any)
      .from("interview_answers")
      .insert({
        session_id: sessionId,
        question_id: validQuestionId,
        user_answer: answer,
        score: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as InterviewAnswer;
  },

  async evaluateAnswer(
    sessionId: string,
    answerId: string,
    question: string,
    answer: string
  ): Promise<InterviewFeedbackResult> {
    const response = await apiFetch("/api/interview/evaluate", {
      method: "POST",
      body: JSON.stringify({ sessionId, answerId, question, answer }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to evaluate answer");
    }

    const { feedback } = await response.json();
    return feedback as InterviewFeedbackResult;
  },

  async completeSession(
    sessionId: string,
    durationSeconds: number
  ): Promise<{ report: any; session: InterviewSession }> {
    const response = await apiFetch("/api/interview/report", {
      method: "POST",
      body: JSON.stringify({ sessionId, duration: durationSeconds }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to finalize session report");
    }

    return await response.json();
  },

  async getSessions(userId: string): Promise<InterviewSession[]> {
    const { data, error } = await (supabase as any)
      .from("interview_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as InterviewSession[];
  },

  async getSessionFeedback(sessionId: string): Promise<{
    answers: InterviewAnswer[];
  }> {
    const { data: answers, error: answersError } = await (supabase as any)
      .from("interview_answers")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (answersError) throw answersError;

    return {
      answers: (answers || []) as InterviewAnswer[],
    };
  },

  async getLatestScore(userId: string): Promise<number | null> {
    const { data, error } = await (supabase as any)
      .from("interview_sessions")
      .select("score")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data?.score ?? null;
  },

  async getProgress(userId: string): Promise<{
    avg_score: number;
    weak_areas: string[];
    improvement_notes: string;
  } | null> {
    const { data, error } = await (supabase as any)
      .from("user_interview_progress")
      .select("avg_score, weak_areas, improvement_notes")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return null;
    return data;
  },
};
