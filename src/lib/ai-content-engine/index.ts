import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin as originalSupabaseAdmin } from "@/lib/supabase/admin";
import { safeGenerateContent } from "@/lib/gemini";
const supabaseAdmin = originalSupabaseAdmin as any;

const apiKey = process.env.GEMINI_API_KEY || "";

function getGeminiModel() {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

/**
 * Strips markdown code blocks and attempts to parse JSON.
 */
function parseCleanJSON(text: string): any {
  let cleaned = text.trim();
  // Strip code fences if present
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/```\s*$/g, "");
  cleaned = cleaned.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt minor auto-corrections for common LLM JSON syntax issues
    try {
      // Fix single quotes to double quotes, replace trailing commas before array/object close
      const fixed = cleaned
        .replace(/,\s*([\]}])/g, "$1") 
        .replace(/'/g, '"');
      return JSON.parse(fixed);
    } catch {
      throw new Error(`Failed to parse JSON. Original response:\n${text}`);
    }
  }
}

/**
 * Auto-retry wrapper that retries Gemini generation on failure.
 */
async function generateWithRetry(prompt: string, maxRetries = 3): Promise<any> {
  try {
    const text = await safeGenerateContent(prompt, "gemini-2.5-flash");
    return parseCleanJSON(text);
  } catch (err: any) {
    console.error("AI Content Engine generation failed:", err);
    throw err;
  }
}

async function isAutoPublishEnabled(): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "ai_content_auto_publish")
      .maybeSingle();
    if (!data) return false;
    const value = data.setting_value;
    return value === true || value === "true" || JSON.stringify(value) === "true";
  } catch (err) {
    console.error("Failed to check isAutoPublishEnabled:", err);
    return false;
  }
}

export const AIContentEngine = {
  /**
   * MODULE 1: Aptitude Question Generator
   */
  async generateAptitudeQuestions(params: {
    topic: string;
    subtopic?: string;
    difficulty: "Easy" | "Medium" | "Hard";
    count: number;
  }) {
    const { topic, subtopic = "General", difficulty, count } = params;
    
    const prompt = `You are an expert Aptitude Test Designer. Generate exactly ${count} multiple-choice aptitude questions.
Topic: ${topic}
Subtopic: ${subtopic}
Difficulty: ${difficulty}

You MUST return a JSON object containing a "questions" array of objects.
Each question object MUST have the following structure:
{
  "question": "What is the probability of...",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "answer": "A", // Must be exactly one of: "A", "B", "C", "D"
  "explanation": "Detailed step-by-step mathematical or logical explanation.",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "subtopic": "${subtopic}"
}

Return ONLY valid JSON. Do NOT wrap in markdown, code blocks, or include any surrounding text.`;

    const data = await generateWithRetry(prompt);
    const generatedQuestions = data?.questions || [];

    if (!Array.isArray(generatedQuestions)) {
      throw new Error("Invalid output format: 'questions' must be an array");
    }

    // Save to database
    // 1. First ensure the topic exists in aptitude_topics
    let topicId: string | null = null;
    const category = topic.toLowerCase().includes("reasoning") || topic.toLowerCase().includes("logical")
      ? "logical"
      : topic.toLowerCase().includes("verbal") || topic.toLowerCase().includes("english")
      ? "verbal"
      : "quantitative";

    const { data: existingTopic } = await supabaseAdmin
      .from("aptitude_topics")
      .select("id")
      .ilike("name", topic)
      .maybeSingle();

    if (existingTopic) {
      topicId = existingTopic.id;
    } else {
      const { data: newTopic, error: topicErr } = await supabaseAdmin
        .from("aptitude_topics")
        .insert({
          name: topic,
          category,
          description: `AI-generated topic folder for ${topic}`,
          icon: "Brain"
        })
        .select("id")
        .single();
      
      if (!topicErr && newTopic) {
        topicId = newTopic.id;
      }
    }

    const savedBank: any[] = [];
    const savedActive: any[] = [];
    const autoPublish = await isAutoPublishEnabled();

    for (const q of generatedQuestions) {
      const optA = q.options?.[0] || "Option A";
      const optB = q.options?.[1] || "Option B";
      const optC = q.options?.[2] || "Option C";
      const optD = q.options?.[3] || "Option D";
      const correctAns = q.answer || "A";

      // Insert into bank
      const bankInsert = {
        question: q.question,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_answer: correctAns,
        explanation: q.explanation,
        difficulty: q.difficulty || difficulty,
        topic: q.topic || topic,
        subtopic: q.subtopic || subtopic,
        companies: []
      };

      const { data: bankRow } = await supabaseAdmin
        .from("aptitude_question_bank")
        .insert(bankInsert)
        .select()
        .single();
      
      if (bankRow) savedBank.push(bankRow);

      // Insert into active platform table ONLY if auto-publish is true
      if (autoPublish) {
        const activeInsert = {
          topic_id: topicId,
          question: q.question,
          option_a: optA,
          option_b: optB,
          option_c: optC,
          option_d: optD,
          correct_answer: correctAns,
          explanation: q.explanation,
          difficulty: q.difficulty || difficulty,
          companies: []
        };

        const { data: activeRow } = await supabaseAdmin
          .from("aptitude_questions")
          .insert(activeInsert)
          .select()
          .single();

        if (activeRow) savedActive.push(activeRow);
      }
    }

    return {
      success: true,
      count: savedBank.length,
      bank: savedBank,
      active: savedActive
    };
  },

  /**
   * MODULE 2: Coding Problem Generator
   */
  async generateCodingProblems(params: {
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
    count: number;
  }) {
    const { topic, difficulty, count } = params;

    const prompt = `You are a Senior Algorithms Engineer. Generate exactly ${count} coding challenge problem(s).
Topic: ${topic}
Difficulty: ${difficulty}

You MUST return a JSON object containing a "problems" array of objects.
Each problem object MUST have the following structure:
{
  "title": "Problem Title",
  "description": "Clear detailed Markdown description of the problem statement, parameters, and return types.",
  "difficulty": "${difficulty}",
  "constraints": ["1 <= nums.length <= 10^5", "All values are integers"],
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0, 1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  "test_cases": [
    { "input": "[2,7,11,15], 9", "output": "[0,1]" },
    { "input": "[3,2,4], 6", "output": "[1,2]" }
  ],
  "starter_code": {
    "Python": "class Solution:\\n    def solve(self, nums: List[int], target: int) -> List[int]:\\n        pass",
    "JavaScript": "function solve(nums, target) {\\n\\n}",
    "Java": "class Solution {\\n    public int[] solve(int[] nums, int target) {\\n        return new int[0];\\n    }\\n}",
    "C++": "class Solution {\\npublic:\\n    vector<int> solve(vector<int>& nums, int target) {\\n        \\n    }\\n};"
  },
  "optimal_solutions": {
    "Python": "class Solution:\\n    def solve(self, nums: List[int], target: int) -> List[int]:\\n        seen = {}\\n        for i, n in enumerate(nums):\\n            diff = target - n\\n            if diff in seen:\\n                return [seen[diff], i]\\n            seen[n] = i\\n        return []"
  },
  "complexity": {
    "time": "O(N)",
    "space": "O(N)"
  }
}

Return ONLY valid JSON. Do NOT wrap in markdown code blocks.`;

    const data = await generateWithRetry(prompt);
    const generatedProblems = data?.problems || [];

    if (!Array.isArray(generatedProblems)) {
      throw new Error("Invalid output format: 'problems' must be an array");
    }

    // Ensure topic exists in coding_topics
    let topicId: string | null = null;
    const { data: existingTopic } = await supabaseAdmin
      .from("coding_topics")
      .select("id")
      .ilike("name", topic)
      .maybeSingle();

    if (existingTopic) {
      topicId = existingTopic.id;
    } else {
      const { data: newTopic, error: topicErr } = await supabaseAdmin
        .from("coding_topics")
        .insert({
          name: topic,
          description: `AI-generated problems folder for ${topic}`
        })
        .select("id")
        .single();
      
      if (!topicErr && newTopic) {
        topicId = newTopic.id;
      }
    }

    const savedBank: any[] = [];
    const savedActive: any[] = [];

    for (const p of generatedProblems) {
      const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const bankInsert = {
        title: p.title,
        slug,
        description: p.description,
        difficulty: p.difficulty || difficulty,
        constraints: p.constraints || [],
        sample_input: p.examples?.[0]?.input || "",
        sample_output: p.examples?.[0]?.output || "",
        explanation: p.examples?.[0]?.explanation || "Standard optimal complexity.",
        companies: [],
        starter_code: p.starter_code || {},
        optimal_solutions: p.optimal_solutions || {},
        complexity: p.complexity || { time: "O(N)", space: "O(1)" },
        examples: p.examples || [],
        test_cases: p.test_cases || [],
        acceptance_rate: "50.0%",
        topic: topic
      };

      const { data: bankRow } = await supabaseAdmin
        .from("coding_problem_bank")
        .insert(bankInsert)
        .select()
        .single();

      if (bankRow) savedBank.push(bankRow);

      const autoPublish = await isAutoPublishEnabled();
      if (autoPublish) {
        const activeInsert = {
          topic_id: topicId,
          title: p.title,
          slug,
          description: p.description,
          difficulty: p.difficulty || difficulty,
          constraints: p.constraints || [],
          sample_input: p.examples?.[0]?.input || "",
          sample_output: p.examples?.[0]?.output || "",
          explanation: p.examples?.[0]?.explanation || "Standard optimal complexity.",
          companies: [],
          starter_code: p.starter_code || {},
          optimal_solutions: p.optimal_solutions || {},
          complexity: p.complexity || { time: "O(N)", space: "O(1)" },
          examples: p.examples || [],
          acceptance_rate: "50.0%"
        };

        const { data: activeRow } = await supabaseAdmin
          .from("coding_questions")
          .insert(activeInsert)
          .select()
          .single();

        if (activeRow) savedActive.push(activeRow);
      }
    }

    return {
      success: true,
      count: savedBank.length,
      bank: savedBank,
      active: savedActive
    };
  },

  /**
   * MODULE 2b: Advanced Coding Problem Generator
   */
  async generateAdvancedCodingProblems(params: {
    topics?: string[];
    companies?: string[];
    difficulty?: string;
    count: number;
    mode?: "single" | "multi" | "company" | "mixed";
    distribution?: { Easy?: number; Medium?: number; Hard?: number };
  }) {
    const { 
      topics = ["Arrays"], 
      companies = ["General"], 
      difficulty = "Medium", 
      count,
      mode = "single",
      distribution 
    } = params;

    let remainingEasy = distribution?.Easy || 0;
    let remainingMedium = distribution?.Medium || 0;
    let remainingHard = distribution?.Hard || 0;

    if (difficulty === "Mixed" && remainingEasy === 0 && remainingMedium === 0 && remainingHard === 0) {
      remainingEasy = Math.floor(count / 3);
      remainingMedium = Math.floor(count / 3);
      remainingHard = count - remainingEasy - remainingMedium;
    }

    const savedBankRows: any[] = [];
    let remainingCount = count;
    const batchSize = 2; // Process 2 problems per Gemini call to prevent timeout and token limits

    while (remainingCount > 0) {
      const numToGenerate = Math.min(batchSize, remainingCount);
      
      const batchDifficulties: string[] = [];
      for (let i = 0; i < numToGenerate; i++) {
        if (difficulty !== "Mixed") {
          batchDifficulties.push(difficulty);
        } else {
          if (remainingEasy > 0) {
            batchDifficulties.push("Easy");
            remainingEasy--;
          } else if (remainingMedium > 0) {
            batchDifficulties.push("Medium");
            remainingMedium--;
          } else if (remainingHard > 0) {
            batchDifficulties.push("Hard");
            remainingHard--;
          } else {
            batchDifficulties.push("Medium");
          }
        }
      }

      const prompt = `You are a Senior Competitive Programming Expert and Interview Examiner. Generate exactly ${numToGenerate} high-quality coding problems matching these specifications:
- Topics to distribute across: ${topics.join(", ")}
- Target Companies: ${companies.join(", ")}
- Target Difficulty levels for the generated problem(s): ${batchDifficulties.join(", ")}

You MUST return a JSON object with a "problems" array of objects.
Each problem object in the array MUST strictly follow this JSON structure:
{
  "title": "Problem Title",
  "slug": "problem-title-slug",
  "description": "Clear detailed Markdown description of the problem statement, parameters, and return types.",
  "difficulty": "Easy/Medium/Hard",
  "topics": ["Array", "Hashing"], // Select 1 or more matching topics from: ${topics.join(", ")}
  "company_tags": ["Google", "Amazon"], // Select 1 or more target companies from: ${companies.join(", ")}
  "constraints": ["1 <= nums.length <= 10^5", "All values are integers"],
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0, 1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  "starter_code": {
    "cpp": "class Solution {\\npublic:\\n    vector<int> twoSum(vector<int>& nums, int target) {\\n        \\n    }\\n};",
    "java": "class Solution {\\n    public int[] twoSum(int[] nums, int target) {\\n        return new int[0];\\n    }\\n}",
    "python": "class Solution:\\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\\n        pass",
    "javascript": "/**\\n * @param {number[]} nums\\n * @param {number} target\\n * @return {number[]}\\n */\\nvar twoSum = function(nums, target) {\\n    \\n};"
  },
  "hidden_testcases": [
    {
      "input": "...",
      "output": "..."
    }
  ],
  "editorial": {
    "approach": "Describe the optimal sliding window or hashing approach...",
    "time_complexity": "O(N)",
    "space_complexity": "O(N)",
    "solution_explanation": "Explain why this solution is optimal..."
  }
}

Return ONLY valid JSON. Do NOT wrap in markdown code blocks or add any text outside JSON.`;

      let data: any = null;
      try {
        data = await generateWithRetry(prompt);
      } catch (err) {
        console.error("Gemini batch generation failed:", err);
        break; // Stop loop on consecutive failures
      }

      const batchProblems = data?.problems || [];
      if (!Array.isArray(batchProblems)) {
        console.warn("Invalid API output format: problems must be an array");
        break;
      }

      for (const p of batchProblems) {
        const bankInsert = {
          title: p.title,
          slug: p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: p.description,
          difficulty: p.difficulty || "Medium",
          constraints: p.constraints || [],
          examples: p.examples || [],
          hidden_testcases: p.hidden_testcases || [],
          starter_code: p.starter_code || {},
          editorial: p.editorial || {},
          status: "draft",
          is_ai_generated: true,
          companies: p.company_tags || [],
          topic: p.topics?.[0] || "Arrays",
          sample_input: p.examples?.[0]?.input || "",
          sample_output: p.examples?.[0]?.output || "",
          explanation: p.examples?.[0]?.explanation || ""
        };

        const { data: bankRow, error: bankErr } = await supabaseAdmin
          .from("coding_problem_bank")
          .insert(bankInsert)
          .select()
          .single();

        if (bankErr || !bankRow) {
          console.error("Error inserting bank problem:", bankErr?.message);
          continue;
        }

        savedBankRows.push(bankRow);

        // Link topics
        const topicsArr = p.topics || [];
        for (const topicName of topicsArr) {
          const { data: topicData } = await supabaseAdmin
            .from("coding_topics")
            .select("id")
            .ilike("name", topicName.trim())
            .maybeSingle();

          if (topicData) {
            await supabaseAdmin
              .from("coding_problem_topics")
              .insert({
                problem_id: bankRow.id,
                topic_id: topicData.id
              });
          } else {
            // Dynamically seed topic if it doesn't exist yet
            const { data: newTopic } = await supabaseAdmin
              .from("coding_topics")
              .insert({ name: topicName.trim(), description: "AI Created Topic" })
              .select("id")
              .single();
            
            if (newTopic) {
              await supabaseAdmin
                .from("coding_problem_topics")
                .insert({
                  problem_id: bankRow.id,
                  topic_id: newTopic.id
                });
            }
          }
        }

        // Link companies
        const companyTags = p.company_tags || [];
        for (const companyName of companyTags) {
          const { data: companyData } = await supabaseAdmin
            .from("companies")
            .select("id")
            .ilike("name", companyName.trim())
            .maybeSingle();

          if (companyData) {
            await supabaseAdmin
              .from("coding_problem_companies")
              .insert({
                problem_id: bankRow.id,
                company_id: companyData.id
              });
          }
        }
      }

      remainingCount -= numToGenerate;
    }

    return {
      success: true,
      count: savedBankRows.length,
      problems: savedBankRows
    };
  },

  /**
   * MODULE 3: Interview Question Generator
   */
  async generateInterviewQuestions(params: {
    category: "HR" | "Technical" | "Company-Specific";
    difficulty: "Easy" | "Medium" | "Hard";
    count: number;
    company?: string;
  }) {
    const { category, difficulty, count, company = "General" } = params;

    const prompt = `You are a Senior Tech Recruiter. Generate exactly ${count} interview questions.
Category: ${category}
Difficulty: ${difficulty}
Company Context: ${company}

You MUST return a JSON object containing a "questions" array of objects.
Each object MUST have this structure:
{
  "question": "Question text here",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "company": "${company}",
  "expected_answer": "Key concepts, definitions, or bullet points expected in a high-quality response.",
  "topic": "e.g. Behavioral / DBMS / Algorithms / System Design"
}

Return ONLY valid JSON. Do NOT wrap in markdown code blocks.`;

    const data = await generateWithRetry(prompt);
    const generatedQuestions = data?.questions || [];

    if (!Array.isArray(generatedQuestions)) {
      throw new Error("Invalid output format: 'questions' must be an array");
    }

    const savedBank: any[] = [];

    for (const q of generatedQuestions) {
      const bankInsert = {
        question: q.question,
        category: q.category || category,
        difficulty: q.difficulty || difficulty,
        company: q.company || company,
        expected_answer: q.expected_answer,
        topic: q.topic || "General"
      };

      const { data: bankRow } = await supabaseAdmin
        .from("interview_question_bank")
        .insert(bankInsert)
        .select()
        .single();

      if (bankRow) savedBank.push(bankRow);
    }

    return {
      success: true,
      count: savedBank.length,
      bank: savedBank
    };
  },

  /**
   * MODULE 4: Company Roadmap Generator
   */
  async generateCompanyRoadmap(params: {
    companyName: string;
    companyId: string;
  }) {
    const { companyName, companyId } = params;

    const prompt = `You are a Placement Mentor. Design a structured 4-week preparation roadmap for cracked interviews at ${companyName}.
Each week must target specific topics and provide practical tasks for Aptitude, Coding, and Interviews.

You MUST return a JSON object containing a "weeks" array of exactly 4 objects.
Each week object MUST follow this structure:
{
  "week_number": 1,
  "topics": ["Quantitative Aptitude Basics", "Recursion & Backtracking"],
  "aptitude_tasks": ["Complete 20 questions on Percentages", "Solve Averages sets"],
  "coding_tasks": ["Solve String Permutations", "Solve 5 recursion problems"],
  "interview_tasks": ["Draft self-introduction", "Review ${companyName} interview patterns"]
}

Return ONLY valid JSON. Do NOT wrap in markdown code blocks.`;

    const data = await generateWithRetry(prompt);
    const weeks = data?.weeks || [];

    if (!Array.isArray(weeks) || weeks.length !== 4) {
      throw new Error("Roadmap must contain exactly 4 weeks.");
    }

    const savedRoadmaps: any[] = [];

    for (const w of weeks) {
      const insertData = {
        company_id: companyId,
        week_number: w.week_number,
        topics: w.topics || [],
        aptitude_tasks: w.aptitude_tasks || [],
        coding_tasks: w.coding_tasks || [],
        interview_tasks: w.interview_tasks || []
      };

      const { data: row, error } = await supabaseAdmin
        .from("company_roadmaps")
        .upsert(insertData, { onConflict: "company_id,week_number" })
        .select()
        .single();

      if (error) {
        console.error(`Error saving roadmap week ${w.week_number}:`, error.message);
      } else if (row) {
        savedRoadmaps.push(row);
      }
    }

    return {
      success: true,
      count: savedRoadmaps.length,
      roadmaps: savedRoadmaps
    };
  },

  /**
   * MODULE 5: Mock Test Generator
   */
  async generateMockTest(params: {
    testType: "aptitude" | "coding" | "interview";
    difficulty: "Easy" | "Medium" | "Hard" | "Expert";
    title: string;
    durationMinutes: number;
  }) {
    const { testType, difficulty, title, durationMinutes } = params;

    const prompt = `You are a Placement Examiner. Generate a full mock test template.
Type: ${testType}
Difficulty: ${difficulty}
Title: ${title}
Duration: ${durationMinutes} minutes

Provide a set of questions for this test.
You MUST return a JSON object with this structure:
{
  "title": "${title}",
  "description": "Detailed briefing and rules for this placement mock test.",
  "test_type": "${testType}",
  "difficulty": "${difficulty}",
  "duration_minutes": ${durationMinutes},
  "questions": [
    {
      "id": 1,
      "question": "Question statement...",
      "options": ["A", "B", "C", "D"], // MCQs (For aptitude/interviews)
      "answer": "A", // Correct option key
      "explanation": "Reasoning...",
      "score": 10
    }
  ]
}

Return ONLY valid JSON. Do NOT wrap in markdown code blocks.`;

    const data = await generateWithRetry(prompt);

    const testInsert = {
      title: data.title || title,
      description: data.description || "AI-generated placement exam.",
      test_type: testType,
      difficulty: difficulty,
      duration_minutes: data.duration_minutes || durationMinutes,
      questions: data.questions || []
    };

    const { data: bankRow } = await supabaseAdmin
      .from("mock_test_templates")
      .insert(testInsert)
      .select()
      .single();

    const autoPublish = await isAutoPublishEnabled();

    // If it's an aptitude test, we can also insert it into aptitude_tests so it appears in the active platform (ONLY if auto-publish is enabled)
    let activeTestRow: any = null;
    if (testType === "aptitude" && bankRow && autoPublish) {
      const { data: actTest } = await supabaseAdmin
        .from("aptitude_tests")
        .insert({
          title: testInsert.title,
          description: testInsert.description,
          duration_minutes: testInsert.duration_minutes,
          difficulty: testInsert.difficulty
        })
        .select()
        .single();

      activeTestRow = actTest;

      // Seed questions into active database (if they have topics, maps to default topic)
      if (actTest && Array.isArray(testInsert.questions)) {
        // Query a fallback topic
        const { data: defaultTopic } = await supabaseAdmin
          .from("aptitude_topics")
          .select("id")
          .limit(1)
          .single();

        for (const q of testInsert.questions) {
          const { data: actQ } = await supabaseAdmin
            .from("aptitude_questions")
            .insert({
              topic_id: defaultTopic?.id || null,
              question: q.question,
              option_a: q.options?.[0] || "A",
              option_b: q.options?.[1] || "B",
              option_c: q.options?.[2] || "C",
              option_d: q.options?.[3] || "D",
              correct_answer: q.answer || "A",
              explanation: q.explanation || "",
              difficulty: difficulty,
              companies: []
            })
            .select()
            .single();

          if (actQ) {
            await supabaseAdmin
              .from("test_questions")
              .insert({
                test_id: actTest.id,
                question_id: actQ.id
              });
          }
        }
      }
    }

    return {
      success: true,
      bank: bankRow,
      active: activeTestRow
    };
  },

  /**
   * MODULE 6: AI Study Plan Generator
   */
  async generateStudyPlan(params: {
    userId: string;
    targetCompany: string;
    weakAreas: string[];
  }) {
    const { userId, targetCompany, weakAreas } = params;

    const prompt = `You are a Placement Mentor. Create a detailed daily, weekly, and monthly personalized preparation plan.
Target Company: ${targetCompany}
Weak Areas: ${weakAreas.join(", ")}

You MUST return a JSON object with this structure:
{
  "title": "Study Plan for ${targetCompany}",
  "daily_plan": [
    { "time": "Morning", "task": "Review weak area: ${weakAreas[0] || 'Aptitude'}" },
    { "time": "Afternoon", "task": "Solve 2 coding challenges" }
  ],
  "weekly_plan": [
    { "week": "Week 1", "objective": "Strengthen core concepts in ${weakAreas.join(', ')}" }
  ],
  "monthly_plan": [
    { "month": "Month 1", "objective": "Practice full mock placement interviews and tests" }
  ]
}

Return ONLY valid JSON. Do NOT wrap in markdown code blocks.`;

    const data = await generateWithRetry(prompt);

    const studyInsert = {
      user_id: userId,
      title: data.title || `Study Plan for ${targetCompany}`,
      target_company: targetCompany,
      weak_areas: weakAreas,
      daily_plan: data.daily_plan || [],
      weekly_plan: data.weekly_plan || [],
      monthly_plan: data.monthly_plan || []
    };

    const { data: row } = await supabaseAdmin
      .from("study_plans")
      .insert(studyInsert)
      .select()
      .single();

    return {
      success: true,
      plan: row
    };
  },

  /**
   * MODULE 7: AI Recommendation Engine
   */
  async generateAIRecommendations(params: {
    userId: string;
    targetCompany: string;
    weakAreas: string[];
    scores: {
      resumeScore: number;
      aptitudeScore: number;
      codingScore: number;
      interviewScore: number;
      overallReadiness: number;
    }
  }) {
    const { userId, targetCompany, weakAreas, scores } = params;

    const prompt = `You are an AI Mentor. Formulate actionable recommendation tips for a student preparing for placement.
Target Company: ${targetCompany}
Weak Topics: ${weakAreas.join(", ")}
Performance Scores:
- Resume: ${scores.resumeScore}/100
- Aptitude: ${scores.aptitudeScore}/100
- Coding: ${scores.codingScore}/100
- Interview: ${scores.interviewScore}/100
- Overall: ${scores.overallReadiness}/100

You MUST return a JSON object with this structure:
{
  "recommendations": [
    {
      "title": "Improve Resume Keywords",
      "description": "Add keywords related to ${targetCompany} job listings to raise your score above 85.",
      "reason": "Resume score is currently ${scores.resumeScore}",
      "priority": "High"
    },
    {
      "title": "Aptitude Drill: ${weakAreas[0] || 'Math'}",
      "description": "Your practice score is low. Complete 20 questions in ${weakAreas[0] || 'Aptitude'}.",
      "reason": "Target weakness identified",
      "priority": "Medium"
    }
  ]
}

Return ONLY valid JSON. Do NOT wrap in markdown code blocks.`;

    const data = await generateWithRetry(prompt);
    const recommendations = data?.recommendations || [];

    // Save to ai_recommendations table
    const { data: row } = await supabaseAdmin
      .from("ai_recommendations")
      .insert({
        user_id: userId,
        recommendations: recommendations
      })
      .select()
      .single();

    // Also write to legacy recommendation_logs for backwards compatibility
    const logsInsert = recommendations.map((r: any) => ({
      user_id: userId,
      recommendation_type: r.priority.toLowerCase() === "high" ? "study" : "weakness",
      recommendation_text: `${r.title}: ${r.description} (Reason: ${r.reason})`
    }));

    if (logsInsert.length > 0) {
      await supabaseAdmin.from("recommendation_logs").insert(logsInsert);
    }

    return {
      success: true,
      recommendations: row,
      raw: recommendations
    };
  },

  /**
   * MODULE 8: AI Notification Engine
   */
  async generateAINotifications(params: {
    userId: string;
    triggerType: "streak" | "readiness" | "reminder" | "achievement";
    details: string;
  }) {
    const { userId, triggerType, details } = params;

    const prompt = `You are a Placement Coach. Generate a friendly, engaging notification alert for a student.
Trigger Event Type: ${triggerType}
Context Details: ${details}

You MUST return a JSON object with this structure:
{
  "title": "Notification Headline",
  "message": "Clear call-to-action or encouraging message under 150 characters.",
  "priority": "medium", // Must be: "high", "medium", or "low"
  "category": "ai" // Must be: "system", "ai", "gamification", or "study"
}

Return ONLY valid JSON. Do NOT wrap in markdown code blocks.`;

    const data = await generateWithRetry(prompt);

    const notifInsert = {
      user_id: userId,
      title: data.title || "AI Coach Alert",
      message: data.message || details,
      category: data.category || "ai",
      priority: data.priority || "medium",
      is_read: false
    };

    const { data: row } = await supabaseAdmin
      .from("notifications")
      .insert(notifInsert as any)
      .select()
      .single();

    return {
      success: true,
      notification: row
    };
  }
};
