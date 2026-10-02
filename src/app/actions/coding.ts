"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import {
  codingSubmissionSchema,
  codingBookmarkSchema,
  codingDraftSchema,
} from "@/lib/validation";

/**
 * Server action to save a coding solution submission
 */
export async function submitCodingSolutionAction(
  userId: string,
  payload: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const parsed = codingSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const {
      questionId,
      code,
      language,
      status,
      executionTime,
      memoryUsed,
      testCasesPassed,
      totalTestCases,
      errorMessage,
    } = parsed.data;

    const { data, error } = await supabase
      .from("coding_submissions")
      .insert({
        user_id: userId,
        question_id: questionId,
        code,
        language,
        status,
        execution_time: executionTime || 0,
        memory_used: memoryUsed || 0,
        test_cases_passed: testCasesPassed || 0,
        total_test_cases: totalTestCases || 0,
        error_message: errorMessage || null,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("submitCodingSolutionAction failed:", err);
    return { success: false, error: err.message || "Failed to submit code" };
  }
}

/**
 * Server action to save code draft
 */
export async function saveCodingDraftAction(
  userId: string,
  payload: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const parsed = codingDraftSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const { questionId, language, code } = parsed.data;

    const { data, error } = await (supabase as any)
      .from("coding_drafts")
      .upsert(
        {
          user_id: userId,
          question_id: questionId,
          language,
          code,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,question_id,language",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("saveCodingDraftAction failed:", err);
    return { success: false, error: err.message || "Failed to save draft" };
  }
}

/**
 * Server action to toggle problem bookmark
 */
export async function toggleCodingBookmarkAction(
  userId: string,
  problemId: string,
  shouldBookmark: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const parsed = codingBookmarkSchema.safeParse({ problemId });
    if (!parsed.success) {
      return { success: false, error: "Invalid problem ID format" };
    }

    if (shouldBookmark) {
      const { error } = await (supabase as any)
        .from("coding_bookmarks")
        .insert({
          user_id: userId,
          question_id: problemId,
        });
      if (error) throw error;
    } else {
      const { error } = await (supabase as any)
        .from("coding_bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("question_id", problemId);
      if (error) throw error;
    }

    return { success: true };
  } catch (err: any) {
    console.error("toggleCodingBookmarkAction failed:", err);
    return { success: false, error: err.message || "Failed to toggle bookmark" };
  }
}
