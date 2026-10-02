"use server";

import { recommendationService } from "@/services/recommendation.service";

export async function regenerateRecommendations(userId: string) {
  try {
    const recs = await recommendationService.generateAIRecommendations(userId);
    return { success: true, recommendations: recs };
  } catch (error: any) {
    console.error("Server action error regenerating recommendations:", error);
    return { success: false, error: error.message || "Failed to regenerate recommendations" };
  }
}
