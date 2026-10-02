import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";

const db = supabase as any;

export interface MockPlacement {
  id: string;
  user_id: string;
  company_id: string;
  status: "ongoing" | "completed" | "failed" | "selected";
  final_score: number;
  result: "selected" | "rejected" | null;
  created_at: string;
  companies?: {
    name: string;
    slug: string;
    logo_url: string | null;
  };
}

export interface MockRound {
  id: string;
  mock_id: string;
  round_type: "resume" | "aptitude" | "coding" | "interview";
  score: number;
  status: "pending" | "completed";
  started_at: string;
  completed_at: string | null;
}

export interface MockRoundAttempt {
  id: string;
  round_id: string;
  question_id: string;
  answer: string | null;
  is_correct: boolean;
  score: number;
  created_at?: string;
}

export interface MockResult {
  id: string;
  mock_id: string;
  resume_score: number;
  aptitude_score: number;
  coding_score: number;
  interview_score: number;
  final_score: number;
  feedback: string; // Serialized AI report JSON
  selected: boolean;
  created_at: string;
}

export const COMPANY_SELECTION_THRESHOLDS: Record<string, number> = {
  Amazon: 75,
  Microsoft: 75,
  Google: 80,
  TCS: 60,
  Wipro: 60,
  Cognizant: 65,
  Infosys: 65,
  Accenture: 70,
  Capgemini: 65,
};

export const mockPlacementService = {
  async startPlacement(
    userId: string,
    companyId: string,
    resumeId: string | null = null
  ): Promise<{ mock: MockPlacement; rounds: MockRound[] }> {
    // 1. Insert a Mock Placement record
    const { data: mockData, error: mockError } = await db
      .from("mock_placements")
      .insert({
        user_id: userId,
        company_id: companyId,
        resume_id: resumeId,
        status: "ongoing",
        final_score: 0,
        result: null,
      })
      .select("*, companies(name, slug, logo_url)")
      .single();

    if (mockError) throw mockError;

    // 2. Create the four rounds pre-defined for Phase 10
    const roundTypes: Array<"resume" | "aptitude" | "coding" | "interview"> = ["resume", "aptitude", "coding", "interview"];
    const roundsToInsert = roundTypes.map((type) => ({
      mock_id: mockData.id,
      round_type: type,
      status: "pending" as const,
      score: 0,
    }));

    const { data: roundsData, error: roundsError } = await db
      .from("mock_rounds")
      .insert(roundsToInsert)
      .select();

    if (roundsError) throw roundsError;

    return {
      mock: mockData as unknown as MockPlacement,
      rounds: roundsData as MockRound[],
    };
  },

  async getRounds(mockId: string): Promise<MockRound[]> {
    const { data, error } = await db
      .from("mock_rounds")
      .select("*")
      .eq("mock_id", mockId)
      .order("round_type");

    if (error) throw error;
    return data as MockRound[];
  },

  async submitRound(
    mockId: string,
    roundType: "resume" | "aptitude" | "coding" | "interview",
    score: number,
    attempts: Array<{ question_id: string; answer: string | null; is_correct: boolean; score: number }> = []
  ): Promise<MockRound> {
    // 1. Update round details to completed
    const { data: roundData, error: roundError } = await db
      .from("mock_rounds")
      .update({
        score,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("mock_id", mockId)
      .eq("round_type", roundType)
      .select()
      .single();

    if (roundError) throw roundError;

    // 2. Insert round attempts if any
    if (attempts.length > 0) {
      const attemptsToInsert = attempts.map((att) => ({
        round_id: roundData.id,
        question_id: att.question_id,
        answer: att.answer,
        is_correct: att.is_correct,
        score: att.score,
      }));

      const { error: attError } = await db
        .from("mock_round_attempts")
        .insert(attemptsToInsert);

      if (attError) {
        console.error("Failed to insert round attempts:", attError);
      }
    }

    return roundData as MockRound;
  },

  async calculateFinalResult(mockId: string, companyId: string): Promise<MockResult> {
    // 1. Fetch company info to resolve selection threshold
    const { data: company, error: companyError } = await db
      .from("companies")
      .select("name")
      .eq("id", companyId)
      .single();

    if (companyError) throw companyError;

    // 2. Fetch all rounds to get individual scores
    const rounds = await this.getRounds(mockId);
    const resumeRound = rounds.find((r) => r.round_type === "resume");
    const aptitudeRound = rounds.find((r) => r.round_type === "aptitude");
    const codingRound = rounds.find((r) => r.round_type === "coding");
    const interviewRound = rounds.find((r) => r.round_type === "interview");

    const resumeScore = resumeRound?.score || 0;
    const aptitudeScore = aptitudeRound?.score || 0;
    const codingScore = codingRound?.score || 0;
    const interviewScore = interviewRound?.score || 0;

    // 3. Compute final weighted score: Resume (20%) + Aptitude (25%) + Coding (30%) + Interview (25%)
    const finalScore = Math.round(
      resumeScore * 0.20 +
      aptitudeScore * 0.25 +
      codingScore * 0.30 +
      interviewScore * 0.25
    );

    // 4. Decide outcome based on company selection threshold
    const threshold = COMPANY_SELECTION_THRESHOLDS[company.name] || 70;
    const isSelected = finalScore >= threshold;
    const finalResultStr = isSelected ? "selected" : "rejected";

    // 5. Generate AI feedback from API route
    let aiFeedback = {};
    try {
      const companyWeights = { resume: 20, aptitude: 25, coding: 30, technical: 12.5, hr: 12.5 };
      const response = await apiFetch("/api/mock-placement/feedback", {
        method: "POST",
        body: JSON.stringify({
          companyName: company.name,
          scores: {
            resume: resumeScore,
            aptitude: aptitudeScore,
            coding: codingScore,
            technical: interviewScore,
            hr: interviewScore,
          },
          weights: companyWeights,
          overallScore: finalScore,
          result: isSelected ? "Selected" : "Not Selected",
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        aiFeedback = resData.feedback;
      }
    } catch (e) {
      console.error("AI Feedback retrieval failed, using fallback:", e);
    }

    // 6. Save results to mock_results
    const { data: resultData, error: resultError } = await db
      .from("mock_results")
      .upsert(
        {
          mock_id: mockId,
          resume_score: resumeScore,
          aptitude_score: aptitudeScore,
          coding_score: codingScore,
          interview_score: interviewScore,
          final_score: finalScore,
          feedback: JSON.stringify(aiFeedback),
          selected: isSelected,
        },
        { onConflict: "mock_id" }
      )
      .select()
      .single();

    if (resultError) throw resultError;

    // 7. Update mock placements status
    const { error: placementUpdateError } = await db
      .from("mock_placements")
      .update({
        status: isSelected ? "selected" : "failed",
        final_score: finalScore,
        result: finalResultStr,
      })
      .eq("id", mockId);

    if (placementUpdateError) {
      console.error("Failed to update final status of mock placement drive:", placementUpdateError);
    }

    return resultData as MockResult;
  },

  async getHistory(userId: string): Promise<any[]> {
    const { data, error } = await db
      .from("mock_placements")
      .select(`
        id,
        status,
        result,
        created_at,
        companies(name, slug, logo_url),
        mock_rounds(round_type, score, status, completed_at),
        mock_results(resume_score, aptitude_score, coding_score, interview_score, final_score, feedback, selected)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((session: any) => {
      const resultObj = session.mock_results?.[0];
      const rounds = session.mock_rounds || [];
      const resumeRound = rounds.find((r: any) => r.round_type === "resume");
      const aptitudeRound = rounds.find((r: any) => r.round_type === "aptitude");
      const codingRound = rounds.find((r: any) => r.round_type === "coding");
      const interviewRound = rounds.find((r: any) => r.round_type === "interview");

      let durationStr = "N/A";
      const completedTimes = rounds
        .map((r: any) => r.completed_at ? new Date(r.completed_at).getTime() : 0)
        .filter(Boolean);
      if (completedTimes.length > 0 && session.created_at) {
        const maxCompleted = Math.max(...completedTimes);
        const diffMs = maxCompleted - new Date(session.created_at).getTime();
        const mins = Math.floor(diffMs / 60000);
        durationStr = `${mins}m`;
      }

      let outcome: "Offered" | "Waitlisted" | "Rejected" | "Incomplete" = "Incomplete";
      if (session.status === "selected") outcome = "Offered";
      else if (session.status === "failed") outcome = "Rejected";
      else if (session.status === "completed") {
        outcome = resultObj?.selected ? "Offered" : "Rejected";
      }

      let parsedFeedback = null;
      if (resultObj?.feedback) {
        try {
          parsedFeedback = JSON.parse(resultObj.feedback);
        } catch {
          parsedFeedback = resultObj.feedback;
        }
      }

      return {
        id: session.id,
        date: session.created_at ? session.created_at.split("T")[0] : "--",
        company: session.companies?.name || "Company",
        company_slug: session.companies?.slug || "company",
        logo_url: session.companies?.logo_url,
        score: resultObj?.final_score || session.final_score || 0,
        result: outcome,
        duration: durationStr,
        status: session.status,
        rounds: {
          resume: resumeRound?.score ?? null,
          aptitude: aptitudeRound?.score ?? null,
          coding: codingRound?.score ?? null,
          interview: interviewRound?.score ?? null,
        },
        feedback: parsedFeedback,
        strengths: parsedFeedback?.strengths || [],
        weaknesses: parsedFeedback?.weaknesses || [],
      };
    });
  },

  async getDashboardStats(userId: string): Promise<{
    simulationsCompleted: number;
    bestScore: number;
    successRate: number;
  }> {
    const { data, error } = await db
      .from("mock_placements")
      .select("id, status, final_score")
      .eq("user_id", userId);

    if (error) throw error;

    let completed = 0;
    let selectedCount = 0;
    let bestScore = 0;

    (data || []).forEach((p: any) => {
      if (p.status === "selected" || p.status === "completed" || p.status === "failed") {
        completed++;
        if (p.status === "selected") selectedCount++;
        if (p.final_score > bestScore) bestScore = p.final_score;
      }
    });

    const successRate = completed > 0 ? Math.round((selectedCount / completed) * 100) : 0;

    return {
      simulationsCompleted: completed,
      bestScore,
      successRate,
    };
  },
};
