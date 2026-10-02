"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import {
  aptitudeAttemptSchema,
  aptitudeTestAttemptSchema,
  bookmarkSchema,
} from "@/lib/validation";

const indexToLetter = ["A", "B", "C", "D"];

/**
 * Server action to save a single question answer attempt
 */
export async function submitAptitudeAnswerAction(
  userId: string,
  payload: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const parsed = aptitudeAttemptSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const { questionId, selectedOption, isCorrect, timeTaken } = parsed.data;
    const selectedLetter = indexToLetter[selectedOption] || "A";

    const { data, error } = await (supabase as any)
      .from("aptitude_attempts")
      .insert({
        user_id: userId,
        question_id: questionId,
        selected_answer: selectedLetter,
        is_correct: isCorrect,
        time_taken: timeTaken,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("submitAptitudeAnswerAction failed:", err);
    return { success: false, error: err.message || "Failed to submit answer" };
  }
}

/**
 * Server action to save a full mock test attempt
 */
export async function submitAptitudeTestAttemptAction(
  userId: string,
  payload: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const parsed = aptitudeTestAttemptSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const { testId, score, correctAnswers, totalQuestions, answers } = parsed.data;

    const mappedAnswers = answers.map((a) => ({
      question_id: a.questionId,
      selected_answer: indexToLetter[a.selectedOption] || "A",
      is_correct: a.isCorrect,
    }));

    const { data, error } = await (supabase as any)
      .from("test_attempts")
      .insert({
        user_id: userId,
        test_id: testId,
        score,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        answers: mappedAnswers,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("submitAptitudeTestAttemptAction failed:", err);
    return { success: false, error: err.message || "Failed to submit test attempt" };
  }
}

/**
 * Server action to toggle a question bookmark
 */
export async function toggleAptitudeBookmarkAction(
  userId: string,
  questionId: string,
  shouldBookmark: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const parsed = bookmarkSchema.safeParse({ questionId });
    if (!parsed.success) {
      return { success: false, error: "Invalid question ID format" };
    }

    if (shouldBookmark) {
      const { error } = await (supabase as any)
        .from("aptitude_bookmarks")
        .insert({
          user_id: userId,
          question_id: questionId,
        });
      if (error) throw error;
    } else {
      const { error } = await (supabase as any)
        .from("aptitude_bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("question_id", questionId);
      if (error) throw error;
    }

    return { success: true };
  } catch (err: any) {
    console.error("toggleAptitudeBookmarkAction failed:", err);
    return { success: false, error: err.message || "Failed to toggle bookmark" };
  }
}
