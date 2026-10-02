import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { safeGenerateContent } from "@/lib/gemini";

// GET /api/coding/daily - Get today's daily challenge
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);
    const { data: { user } } = await supabase.auth.getUser();

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Fetch today's challenge from coding_daily_challenges
    let { data: challenge, error } = await supabase
      .from("coding_daily_challenges")
      .select(`
        *,
        coding_questions(
          id, title, slug, difficulty, description, constraints, examples,
          explanation, complexity, starter_code, optimal_solutions, companies,
          acceptance_rate,
          coding_topics(id, name)
        )
      `)
      .eq("challenge_date", today)
      .maybeSingle();

    // If no challenge exists for today, generate one with Gemini
    if (!challenge) {
      const supabaseAdmin = getSupabaseServerClient(null);
      try {
        console.log("Generating today's coding daily challenge with Gemini...");
        const topics = [
          "Arrays", "Strings", "Hash Tables", "Two Pointers", "Sliding Window",
          "Binary Search", "Stacks & Queues", "Trees", "Graphs", "Dynamic Programming",
          "Greedy Algorithms", "Recursion"
        ];
        const chosenTopic = topics[Math.floor(Math.random() * topics.length)];
        const difficulties = ["Easy", "Medium"];
        const chosenDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
 
        const prompt = `You are a professional algorithm question setter. Generate a unique coding problem for a daily coding practice.
Topic: ${chosenTopic}
Difficulty: ${chosenDifficulty}
 
Return ONLY a valid, raw JSON object (with NO markdown code blocks, NO backticks, NO markdown formatting) representing the problem. The JSON object must strictly match the following keys:
{
  "title": "A short, catchy name for the problem",
  "difficulty": "${chosenDifficulty}",
  "topic": "${chosenTopic}",
  "description": "A clear description of the problem, including the goal, inputs, and outputs. Use simple clean formatting.",
  "constraints": ["e.g. nums.length <= 10^5", "e.g. -10^9 <= nums[i] <= 10^9"],
  "sample_input": "Format of the sample input",
  "sample_output": "Expected output format",
  "explanation": "Brief explanation of why the input produces the output",
  "companies": ["Amazon", "Google", "Microsoft"],
  "starter_code": {
    "javascript": "function solve(nums) {\\n  // Write your code here\\n}",
    "python": "def solve(nums: List[int]) -> int:\\n    # Write your code here\\n    pass",
    "java": "class Solution {\\n    public int solve(int[] nums) {\\n        // Write your code here\\n        return 0;\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    int solve(vector<int>& nums) {\\n        // Write your code here\\n        return 0;\\n    }\\n}"
  },
  "optimal_solutions": {
    "javascript": "function solve(nums) {\\n  // Optimal solution\\n}",
    "python": "def solve(nums: List[int]) -> int:\\n    # Optimal solution\\n    pass",
    "java": "class Solution {\\n    public int solve(int[] nums) {\\n        // Optimal solution\\n        return 0;\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    int solve(vector<int>& nums) {\\n        // Optimal solution\\n        return 0;\\n    }\\n}"
  },
  "complexity": {
    "time": "O(N)",
    "space": "O(1)"
  },
  "examples": [
    {
      "input": "input example",
      "output": "output example",
      "explanation": "explanation of example"
    }
  ]
}
 
Ensure the code snippets are valid syntactic code and escape characters are properly formatted for JSON.`;
 
        const responseText = await safeGenerateContent(prompt, "gemini-2.5-flash");
        let cleanedText = responseText.trim();
        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
 
        const problemJson = JSON.parse(cleanedText);
        const generatedTopic = problemJson.topic || chosenTopic;
 
        // Ensure topic exists in coding_topics
        const { data: topicData } = await supabaseAdmin
          .from("coding_topics")
          .select("id")
          .ilike("name", generatedTopic.trim())
          .maybeSingle();
 
        let topicId;
        if (topicData) {
          topicId = topicData.id;
        } else {
          const { data: newTopic, error: topicErr } = await supabaseAdmin
            .from("coding_topics")
            .insert({
              name: generatedTopic.trim(),
              description: `Practice problems related to ${generatedTopic}`
            })
            .select("id")
            .single();
 
          if (topicErr) {
            console.error("Failed to create coding topic:", topicErr);
            const { data: fallbackTopic } = await supabaseAdmin
              .from("coding_topics")
              .select("id")
              .limit(1)
              .maybeSingle();
            topicId = fallbackTopic?.id || null;
          } else {
            topicId = newTopic.id;
          }
        }
 
        // Insert question
        const slug = (problemJson.title || "gemini-challenge").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
        const { data: newQ, error: qErr } = await supabaseAdmin
          .from("coding_questions")
          .insert({
            title: problemJson.title || `AI Daily Challenge - ${chosenTopic}`,
            slug: slug,
            description: problemJson.description || "Solve this daily challenge.",
            difficulty: problemJson.difficulty || chosenDifficulty,
            constraints: problemJson.constraints || [],
            sample_input: problemJson.sample_input || "",
            sample_output: problemJson.sample_output || "",
            explanation: problemJson.explanation || "",
            companies: problemJson.companies || ["Amazon"],
            starter_code: problemJson.starter_code || {},
            optimal_solutions: problemJson.optimal_solutions || {},
            complexity: problemJson.complexity || {},
            examples: problemJson.examples || [],
            topic_id: topicId,
            acceptance_rate: "50.0%"
          })
          .select()
          .single();
 
        let questionId;
        if (qErr) {
          console.warn("Failed to insert question, attempting to fallback/fetch existing:", qErr.message);
          const { data: existingQ } = await supabaseAdmin
            .from("coding_questions")
            .select("id")
            .ilike("title", (problemJson.title || "").trim())
            .maybeSingle();
 
          if (existingQ) {
            questionId = existingQ.id;
          } else {
            throw qErr;
          }
        } else {
          questionId = newQ.id;
        }
 
        // Create challenge entry
        const xpReward = problemJson.difficulty === "Easy" ? 100 : problemJson.difficulty === "Medium" ? 250 : 500;
        const bonusXp = problemJson.difficulty === "Easy" ? 25 : problemJson.difficulty === "Medium" ? 50 : 100;
 
        const { data: newChallenge, error: insertError } = await supabaseAdmin
          .from("coding_daily_challenges")
          .insert({
            problem_id: questionId,
            challenge_date: today,
            xp_reward: xpReward,
            bonus_xp: bonusXp,
          })
          .select(`
            *,
            coding_questions(
              id, title, slug, difficulty, description, constraints, examples,
              explanation, complexity, starter_code, optimal_solutions, companies,
              acceptance_rate,
              coding_topics(id, name)
            )
          `)
          .single();
 
        if (insertError) {
          throw insertError;
        }
 
        challenge = newChallenge;
      } catch (gemErr) {
        console.error("Failed to generate coding daily challenge with Gemini, falling back to database query:", gemErr);
        // Fallback: query database for a random problem
        const { data: problems } = await supabaseAdmin
          .from("coding_questions")
          .select("id, difficulty")
          .order("created_at", { ascending: false })
          .limit(50);
 
        if (problems && problems.length > 0) {
          const mediumProblems = problems.filter((p: any) => p.difficulty === "Medium");
          const pool = mediumProblems.length > 0 ? mediumProblems : problems;
          const randomProblem = pool[Math.floor(Math.random() * pool.length)];
 
          const { data: newChallenge } = await supabaseAdmin
            .from("coding_daily_challenges")
            .upsert(
              {
                problem_id: randomProblem.id,
                challenge_date: today,
                xp_reward: randomProblem.difficulty === "Easy" ? 100 : randomProblem.difficulty === "Medium" ? 250 : 500,
                bonus_xp: randomProblem.difficulty === "Easy" ? 25 : randomProblem.difficulty === "Medium" ? 50 : 100,
              },
              { onConflict: "challenge_date" }
            )
            .select(`
              *,
              coding_questions(
                id, title, slug, difficulty, description, constraints, examples,
                explanation, complexity, starter_code, optimal_solutions, companies,
                acceptance_rate,
                coding_topics(id, name)
              )
            `)
            .maybeSingle();
 
          challenge = newChallenge;
        }
      }
    }

    if (!challenge) {
      return NextResponse.json({ challenge: null, message: "No daily challenge available" });
    }

    // Check if user has completed today's challenge
    let isCompleted = false;
    let completion = null;
    if (user && challenge) {
      const { data: comp } = await supabase
        .from("coding_daily_completions")
        .select("*")
        .eq("daily_challenge_id", challenge.id)
        .eq("user_id", user.id)
        .maybeSingle();
      isCompleted = !!comp;
      completion = comp;
    }

    // Get total completions today
    const { count: totalCompletions } = await supabase
      .from("coding_daily_completions")
      .select("*", { count: "exact", head: true })
      .eq("daily_challenge_id", challenge?.id || "");

    // Get user's streak
    let streakDays = 0;
    if (user) {
      // Count consecutive days with completions going backwards from today
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
    }

    const problem = (challenge as any).coding_questions;

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        challenge_date: challenge.challenge_date,
        xp_reward: challenge.xp_reward,
        bonus_xp: challenge.bonus_xp,
        is_completed: isCompleted,
        completion,
        total_completions: totalCompletions || 0,
      },
      problem: problem ? {
        ...problem,
        topic: problem.coding_topics?.name || "General",
      } : null,
      streak: streakDays,
    });
  } catch (err: any) {
    console.error("Daily challenge GET error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/coding/daily - Mark daily challenge as completed
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { daily_challenge_id, submission_id } = body;

    if (!daily_challenge_id) {
      return NextResponse.json({ error: "daily_challenge_id is required" }, { status: 400 });
    }

    // Fetch challenge for XP data
    const { data: challenge } = await supabase
      .from("coding_daily_challenges")
      .select("xp_reward, bonus_xp, challenge_date")
      .eq("id", daily_challenge_id)
      .single();

    if (!challenge) {
      return NextResponse.json({ error: "Daily challenge not found" }, { status: 404 });
    }

    // Check if already completed
    const { data: existing } = await supabase
      .from("coding_daily_completions")
      .select("id")
      .eq("daily_challenge_id", daily_challenge_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: "Already completed today's challenge", already_completed: true });
    }

    const xpEarned = challenge.xp_reward || 50;

    const { data: completion, error: compErr } = await supabase
      .from("coding_daily_completions")
      .insert({
        daily_challenge_id,
        user_id: user.id,
        submission_id: submission_id || null,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (compErr) {
      return NextResponse.json({ error: compErr.message }, { status: 500 });
    }

    // Record XP in history
    try {
      await supabase.from("xp_history").insert({
        user_id: user.id,
        xp_amount: xpEarned,
        xp: xpEarned,
        reason: `Completed daily coding challenge for ${challenge.challenge_date}`,
        action: `Completed daily coding challenge for ${challenge.challenge_date}`,
        source: "daily_challenge",
        reference_id: daily_challenge_id,
      });
    } catch (xpErr) {
      console.warn("Could not record XP history:", xpErr);
    }

    // Update gamification XP if the table exists
    try {
      const { data: gamification } = await supabase
        .from("user_gamification")
        .select("xp, streak_days")
        .eq("user_id", user.id)
        .maybeSingle();

      if (gamification) {
        await supabase
          .from("user_gamification")
          .update({
            xp: (gamification.xp || 0) + xpEarned,
            streak_days: (gamification.streak_days || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }
    } catch (gamErr) {
      console.warn("Could not update gamification:", gamErr);
    }

    return NextResponse.json({ completion, xp_earned: xpEarned }, { status: 201 });
  } catch (err: any) {
    console.error("Daily challenge POST error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
