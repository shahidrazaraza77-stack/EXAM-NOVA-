import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

// In-memory cache for coding questions metadata (TTL: 5 minutes)
let cachedQuestions: Array<{ id: string; difficulty: string; topicName: string }> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getCachedQuestions(supabase: any) {
  const now = Date.now();
  if (cachedQuestions && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedQuestions;
  }

  let allQuestions: Array<{ id: string; difficulty: string; topicName: string }> = [];
  let start = 0;
  const batchSize = 1000;
  while (true) {
    const { data, error: questionsError } = await (supabase.from("coding_questions") as any)
      .select("id, difficulty, coding_topics(name)")
      .range(start, start + batchSize - 1);

    if (questionsError) {
      console.error("Fetch all questions error:", questionsError);
      if (cachedQuestions) return cachedQuestions; // return stale on error
      throw questionsError;
    }
    if (!data || data.length === 0) break;
    const mapped = data.map((q: any) => ({
      id: q.id,
      difficulty: q.difficulty,
      topicName: q.coding_topics?.name || "Arrays",
    }));
    allQuestions = allQuestions.concat(mapped);
    if (data.length < batchSize) break;
    start += batchSize;
  }

  cachedQuestions = allQuestions;
  cacheTimestamp = now;
  return allQuestions;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allQuestions = await getCachedQuestions(supabase);

    const totalQuestionsCount = (allQuestions || []).length;
    const totalEasy = (allQuestions || []).filter((q: any) => q.difficulty === "Easy").length;
    const totalMedium = (allQuestions || []).filter((q: any) => q.difficulty === "Medium").length;
    const totalHard = (allQuestions || []).filter((q: any) => q.difficulty === "Hard").length;

    // 2. Fetch user's submissions
    const { data: submissions, error: subError } = await (supabase.from("coding_submissions") as any)
      .select("*, coding_questions(difficulty, topic_id, coding_topics(name))")
      .eq("user_id", user.id);

    if (subError) throw subError;

    const totalSubmissions = (submissions || []).length;
    const acceptedSubmissions = (submissions || []).filter((s: any) => s.status === "Accepted");
    const accuracy = totalSubmissions > 0 ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100) : 0;

    // Determine unique solved questions
    const solvedQuestionIds = new Set<string>();
    const attemptedQuestionIds = new Set<string>();

    (submissions || []).forEach((sub: any) => {
      if (sub.status === "Accepted") {
        solvedQuestionIds.add(sub.question_id);
      } else {
        attemptedQuestionIds.add(sub.question_id);
      }
    });

    const solvedEasyCount = (allQuestions || []).filter((q: any) => q.difficulty === "Easy" && solvedQuestionIds.has(q.id)).length;
    const solvedMediumCount = (allQuestions || []).filter((q: any) => q.difficulty === "Medium" && solvedQuestionIds.has(q.id)).length;
    const solvedHardCount = (allQuestions || []).filter((q: any) => q.difficulty === "Hard" && solvedQuestionIds.has(q.id)).length;

    // Topic wise progress
    const topicStats: Record<string, { total: number; solved: number; easy: number; medium: number; hard: number; name: string }> = {};
    (allQuestions || []).forEach((q: any) => {
      const topicName = q.coding_topics?.name || "Arrays";
      if (!topicStats[topicName]) {
        topicStats[topicName] = { total: 0, solved: 0, easy: 0, medium: 0, hard: 0, name: topicName };
      }
      topicStats[topicName].total += 1;
      if (q.difficulty === "Easy") topicStats[topicName].easy += 1;
      if (q.difficulty === "Medium") topicStats[topicName].medium += 1;
      if (q.difficulty === "Hard") topicStats[topicName].hard += 1;

      if (solvedQuestionIds.has(q.id)) {
        topicStats[topicName].solved += 1;
      }
    });

    const topicCards = Object.values(topicStats).map((t) => ({
      name: t.name,
      questionsCount: t.total,
      completedPercentage: t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0,
      easyCount: t.easy,
      mediumCount: t.medium,
      hardCount: t.hard
    }));

    // Weak topics recommendations
    const weakTopics = Object.values(topicStats)
      .map((t) => ({
        name: t.name,
        completion: t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0,
        total: t.total
      }))
      .filter((t) => t.completion < 50 && t.total > 0)
      .sort((a, b) => a.completion - b.completion)
      .slice(0, 3)
      .map((t) => ({
        topic: t.name,
        description: `Improve your skills in ${t.name}. Complete more easy/medium problems.`,
        count: t.total
      }));

    // Calculate weekly solved & accuracy trend (last 6 weeks)
    const weeklySolvedData = [
      { name: "Week 1", solved: 0 },
      { name: "Week 2", solved: 0 },
      { name: "Week 3", solved: 0 },
      { name: "Week 4", solved: 0 },
      { name: "Week 5", solved: 0 },
      { name: "Week 6", solved: 0 },
    ];
    
    const weeklyAccuracyData = [
      { name: "Week 1", accuracy: 0, total: 0, accepted: 0 },
      { name: "Week 2", accuracy: 0, total: 0, accepted: 0 },
      { name: "Week 3", accuracy: 0, total: 0, accepted: 0 },
      { name: "Week 4", accuracy: 0, total: 0, accepted: 0 },
      { name: "Week 5", accuracy: 0, total: 0, accepted: 0 },
      { name: "Week 6", accuracy: 0, total: 0, accepted: 0 },
    ];

    const now = new Date();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    (submissions || []).forEach((s: any) => {
      const subDate = new Date(s.submitted_at);
      const diffWeeks = Math.floor((now.getTime() - subDate.getTime()) / oneWeekMs);
      const weekIndex = 5 - diffWeeks;
      if (weekIndex >= 0 && weekIndex < 6) {
        if (s.status === "Accepted") {
          weeklySolvedData[weekIndex].solved += 1;
          weeklyAccuracyData[weekIndex].accepted += 1;
        }
        weeklyAccuracyData[weekIndex].total += 1;
      }
    });

    const accuracyTrend = weeklyAccuracyData.map((w, idx) => {
      let acc = 0;
      if (w.total > 0) {
        acc = Math.round((w.accepted / w.total) * 100);
      } else {
        acc = idx > 0 ? weeklyAccuracyData[idx - 1].accuracy : 70; // baseline fallback
      }
      w.accuracy = acc;
      return { name: w.name, accuracy: acc };
    });

    // Populate company prep dynamically
    const companyNames = ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Amazon", "Google", "Microsoft"];
    const companyProgress = companyNames.map((company) => {
      const compLower = company.toLowerCase();
      const companyQs = (allQuestions || []).filter((q: any) => 
        Array.isArray(q.companies) && q.companies.some((c: string) => c.toLowerCase().includes(compLower))
      );
      const total = companyQs.length;
      const solved = companyQs.filter((q: any) => solvedQuestionIds.has(q.id)).length;
      
      let displayName = company + " Prep";
      if (company === "TCS") displayName = "TCS Ninja / Digital";
      else if (company === "Infosys") displayName = "Infosys SP / DSE";
      else if (company === "Wipro") displayName = "Wipro NLTH";
      else if (company === "Cognizant") displayName = "Cognizant GenC";
      else if (company === "Accenture") displayName = "Accenture ASE";
      else if (company === "Amazon") displayName = "Amazon SDE";
      else if (company === "Google") displayName = "Google SWE";
      else if (company === "Microsoft") displayName = "Microsoft SDE";

      return {
        name: displayName,
        questionsCount: total || 10,
        progressPercentage: total > 0 ? Math.round((solved / total) * 100) : 0
      };
    });

    // Deterministic daily challenge
    let dailyChallenge = {
      id: "d1111111-1111-1111-1111-111111111111",
      title: "Two Sum",
      topic: "Arrays",
      difficulty: "Easy",
      acceptanceRate: "49.5%",
      xpReward: 100,
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
    };

    if (allQuestions && allQuestions.length > 0) {
      const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const challengeIndex = dayOfYear % allQuestions.length;
      const challengeQ = allQuestions[challengeIndex] as any;
      dailyChallenge = {
        id: challengeQ.id,
        title: challengeQ.title || "Daily Coding Challenge",
        topic: challengeQ.topicName || challengeQ.coding_topics?.name || "Arrays",
        difficulty: challengeQ.difficulty as string,
        acceptanceRate: challengeQ.acceptance_rate || "50.0%",
        xpReward: challengeQ.difficulty === "Easy" ? 100 : challengeQ.difficulty === "Medium" ? 250 : 500,
        description: challengeQ.description || "Solve this problem to maintain your daily streak!"
      };
    }

    // Get user's streak
    let streakDays = 0;
    const { data: recentCompletions } = await supabase
      .from("coding_daily_completions")
      .select("daily_challenge_id, coding_daily_challenges(challenge_date)")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(30);

    if (recentCompletions && recentCompletions.length > 0) {
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      for (const comp of recentCompletions) {
        const compDate = new Date((comp as any).coding_daily_challenges?.challenge_date);
        compDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((checkDate.getTime() - compDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          streakDays++;
          checkDate = compDate;
        } else {
          break;
        }
      }
    }

    return NextResponse.json({
      solvedEasy: solvedEasyCount,
      totalEasy: totalEasy || 10,
      solvedMedium: solvedMediumCount,
      totalMedium: totalMedium || 10,
      solvedHard: solvedHardCount,
      totalHard: totalHard || 10,
      accuracy,
      streak: streakDays,
      rating: 1500 + solvedQuestionIds.size * 10,
      readinessIndex: Math.round(((solvedEasyCount * 1 + solvedMediumCount * 2 + solvedHardCount * 3) / Math.max(1, (totalEasy + totalMedium + totalHard) * 2)) * 100),
      topicProgress: topicCards,
      recommendations: weakTopics.length > 0 ? weakTopics : [
        { topic: "Arrays", description: "Practice foundational array manipulation problems.", count: totalEasy },
        { topic: "Strings", description: "Solve string matching and parsing problems.", count: totalMedium }
      ],
      weeklySolved: weeklySolvedData,
      accuracyTrend,
      companyProgress,
      dailyChallenge
    });
  } catch (error: any) {
    console.error("GET coding analytics API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate coding analytics" },
      { status: 500 }
    );
  }
}
