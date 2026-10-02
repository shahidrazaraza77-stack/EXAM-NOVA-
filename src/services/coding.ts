import { apiFetch } from "@/lib/api";
import { supabase as supabaseClient } from "@/lib/supabase";
const supabase = supabaseClient as any;

type TopicRow = any;
type QuestionRow = any;
type SubmissionRow = any;
type BookmarkRow = any;
type DraftRow = any;

export interface FrontendCodingProblem {
  id: string;
  title: string;
  topic: string;
  topic_id: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptanceRate: string;
  status: "Solved" | "Attempted" | "Todo";
  tags: string[];
  description: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  explanation: string;
  complexity: {
    time: string;
    space: string;
  };
  boilerplates: Record<string, string>;
  optimalSolutions: Record<string, string>;
  companies: string[];
}

export function mapDbProblemToFrontend(dbQ: any, userStatus: "Solved" | "Attempted" | "Todo" = "Todo"): FrontendCodingProblem {
  const complexity = (dbQ.complexity as any) || { time: "O(N)", space: "O(1)" };
  const boilerplates = (dbQ.starter_code as Record<string, string>) || {};
  const optimalSolutions = (dbQ.optimal_solutions as Record<string, string>) || {};
  const examples = (dbQ.examples as any[]) || [];
  
  return {
    id: dbQ.id,
    title: dbQ.title,
    topic: dbQ.coding_topics?.name || dbQ.topic_name || "Arrays",
    topic_id: dbQ.topic_id || "",
    slug: dbQ.slug || dbQ.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    difficulty: dbQ.difficulty as "Easy" | "Medium" | "Hard",
    acceptanceRate: dbQ.acceptance_rate || "50.0%",
    status: userStatus,
    tags: dbQ.coding_topics?.name ? [dbQ.coding_topics.name] : ["Arrays"],
    description: dbQ.description,
    constraints: dbQ.constraints || [],
    examples: examples,
    explanation: dbQ.explanation || "",
    complexity: {
      time: complexity.time || "O(N)",
      space: complexity.space || "O(1)"
    },
    boilerplates: boilerplates,
    optimalSolutions: optimalSolutions,
    companies: dbQ.companies || []
  };
}

export const codingService = {
  /**
   * Fetch all coding topics
   */
  async getTopics(): Promise<TopicRow[]> {
    const res = await apiFetch("/api/coding/topics");
    if (!res.ok) throw new Error("Failed to fetch topics");
    const data = await res.json();
    return data.topics || [];
  },

  /**
   * Fetch coding problems with filters
   */
  async getProblems(params: {
    userId?: string;
    difficulty?: string;
    topicName?: string;
    topicId?: string;
    search?: string;
    solvedStatus?: "all" | "solved" | "attempted" | "todo";
    companyName?: string;
    page?: number;
    limit?: number;
  }): Promise<FrontendCodingProblem[]> {
    const queryParts: string[] = [];
    if (params.difficulty) queryParts.push(`difficulty=${params.difficulty}`);
    if (params.topicId) queryParts.push(`topicId=${params.topicId}`);
    if (params.topicName) queryParts.push(`topicName=${encodeURIComponent(params.topicName)}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.companyName) queryParts.push(`companyName=${encodeURIComponent(params.companyName)}`);
    if (params.solvedStatus) queryParts.push(`solvedStatus=${params.solvedStatus}`);
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const res = await apiFetch(`/api/coding/problems${queryString}`);
    if (!res.ok) throw new Error("Failed to fetch problems");
    const data = await res.json();
    return data.problems || [];
  },

  /**
   * Fetch single coding problem by ID with fallback to dataset
   */
  async getProblem(id: string, userId?: string): Promise<FrontendCodingProblem> {
    try {
      const res = await apiFetch(`/api/coding/problems/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.problem) return data.problem;
      }
    } catch (e) {
      console.warn("Backend problem fetch failed, using fallback problem data", e);
    }
    
    // Import fallback dataset
    const { codingProblems } = require("@/data/coding/problems");
    const found = codingProblems.find((p: any) => p.id === id || p.slug === id || p.title.toLowerCase() === id.toLowerCase());
    
    if (found) return found as FrontendCodingProblem;
    
    // Default fallback problem if id not matched
    return {
      id: id || "kth-largest-element",
      title: id ? id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Kth Largest Element in Array",
      topic: "Arrays",
      topic_id: "arrays",
      slug: id || "kth-largest-element",
      difficulty: "Medium",
      acceptanceRate: "65.7%",
      status: "Todo",
      tags: ["Arrays", "Heap", "Sorting"],
      description: "Given an integer array `nums` and an integer `k`, return the `k-th` largest element in the array.\n\nNote that it is the k-th largest element in sorted order, not the k-th distinct element.\n\nCan you solve it without sorting in `O(N log K)` or `O(N)` average time complexity?",
      constraints: [
        "1 <= k <= nums.length <= 10^5",
        "-10^4 <= nums[i] <= 10^4"
      ],
      examples: [
        { input: "nums = [3,2,1,5,6,4], k = 2", output: "5", explanation: "The 2nd largest element is 5." },
        { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4", explanation: "The 4th largest element is 4." }
      ],
      explanation: "Use a Min-Heap of size K. Iterate over each element in `nums`. Push to heap, and if heap size exceeds K, pop the smallest element. The top of the heap will be the Kth largest element.",
      complexity: { time: "O(N log K)", space: "O(K)" },
      boilerplates: {
        "Python": "class Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        # Write your Python code here\n        import heapq font\n        return heapq.nlargest(k, nums)[-1]",
        "C++": "class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        // Write C++ code here\n    }\n};",
        "Java": "class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // Write Java code here\n    }\n}",
        "JavaScript": "var findKthLargest = function(nums, k) {\n    // Write JavaScript code here\n};"
      },
      optimalSolutions: {
        "Python": "class Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        import heapq\n        return heapq.nlargest(k, nums)[-1]"
      },
      companies: ["amazon", "google", "microsoft", "meta", "apple"]
    };
  },

  /**
   * Auto save draft code in Supabase
   */
  async saveDraft(
    userId: string,
    questionId: string,
    language: string,
    code: string
  ): Promise<DraftRow> {
    const res = await apiFetch("/api/coding/drafts", {
      method: "POST",
      body: JSON.stringify({ questionId, language, code }),
    });
    if (!res.ok) throw new Error("Failed to save draft");
    const data = await res.json();
    return data.draft;
  },

  /**
   * Retrieve saved draft code
   */
  async getDraft(
    userId: string,
    questionId: string,
    language: string
  ): Promise<DraftRow | null> {
    const res = await apiFetch(`/api/coding/drafts?questionId=${questionId}&language=${language}`);
    if (!res.ok) throw new Error("Failed to fetch draft");
    const data = await res.json();
    return data.draft;
  },

  /**
   * Submit coding solution
   */
  async submitCode(params: {
    userId: string;
    questionId: string;
    code: string;
    language: string;
    status: string;
    executionTime?: number;
    memoryUsed?: number;
    testCasesPassed?: number;
    totalTestCases?: number;
    errorMessage?: string;
  }): Promise<SubmissionRow> {
    const res = await apiFetch("/api/coding/submissions", {
      method: "POST",
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error || errData.message || "Failed to save solution submission";
      throw new Error(errMsg);
    }
    const data = await res.json();
    return data.submission;
  },

  /**
   * Fetch submission logs for a user, optionally filtered by question ID
   */
  async getSubmissions(userId: string, questionId?: string): Promise<any[]> {
    const query = questionId ? `?questionId=${questionId}` : "";
    const res = await apiFetch(`/api/coding/submissions${query}`);
    if (!res.ok) throw new Error("Failed to fetch user submissions");
    const data = await res.json();
    return data.submissions || [];
  },

  /**
   * Fetch all bookmarked problems for a user
   */
  async getBookmarks(userId: string): Promise<FrontendCodingProblem[]> {
    const res = await apiFetch("/api/coding/bookmarks");
    if (!res.ok) throw new Error("Failed to fetch bookmarks");
    const data = await res.json();
    return data.bookmarks || [];
  },

  /**
   * Add a bookmark
   */
  async addBookmark(userId: string, questionId: string): Promise<BookmarkRow> {
    const res = await apiFetch("/api/coding/bookmarks", {
      method: "POST",
      body: JSON.stringify({ problemId: questionId }),
    });
    if (!res.ok) throw new Error("Failed to add bookmark");
    const data = await res.json();
    return data.bookmark;
  },

  /**
   * Remove a bookmark
   */
  async removeBookmark(userId: string, questionId: string): Promise<void> {
    const res = await apiFetch(`/api/coding/bookmarks?problemId=${questionId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove bookmark");
  },

  /**
   * Fetch dashboard analytics metrics for a user
   */
  async getAnalytics(userId: string) {
    const res = await apiFetch("/api/coding/analytics");
    if (!res.ok) throw new Error("Failed to fetch coding analytics");
    return await res.json();
  },

  // Admin CMS Functions
  async adminAddQuestion(question: Omit<QuestionRow, "id" | "created_at">) {
    const res = await apiFetch("/api/admin/coding/problems", {
      method: "POST",
      body: JSON.stringify(question),
    });
    if (!res.ok) throw new Error("Failed to create admin coding problem");
    const data = await res.json();
    return data.problem;
  },

  async adminEditQuestion(id: string, updates: Partial<QuestionRow>) {
    const res = await apiFetch(`/api/admin/coding/problems/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update admin coding problem");
    const data = await res.json();
    return data.problem;
  },

  async adminDeleteQuestion(id: string) {
    const res = await apiFetch(`/api/admin/coding/problems/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete admin coding problem");
  },

  async adminBulkImport(questions: Array<Omit<QuestionRow, "id" | "created_at">>) {
    const imported = [];
    for (const q of questions) {
      const data = await this.adminAddQuestion(q);
      imported.push(data);
    }
    return imported;
  },

  // Keep admin coding problem bank fallback for complex join operations
  async getBankProblems() {
    const { data, error } = await (supabase.from("coding_problem_bank") as any)
      .select(`
        *,
        coding_problem_topics(coding_topics(id, name)),
        coding_problem_companies(companies(id, name))
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...row,
      topics: (row.coding_problem_topics || [])
        .map((t: any) => t.coding_topics?.name)
        .filter(Boolean),
      company_tags: (row.coding_problem_companies || [])
        .map((c: any) => c.companies?.name)
        .filter(Boolean)
    }));
  },

  async createBankProblem(problem: any) {
    const { topics = [], company_tags = [], ...rest } = problem;
    
    const { data: bankRow, error: bankErr } = await (supabase.from("coding_problem_bank") as any)
      .insert({
        ...rest,
        status: "draft",
        is_ai_generated: false,
        topic: topics[0] || "Arrays",
        companies: company_tags
      })
      .select()
      .single();

    if (bankErr) throw bankErr;

    for (const topicName of topics) {
      const { data: topicData } = await (supabase.from("coding_topics") as any)
        .select("id")
        .ilike("name", topicName.trim())
        .maybeSingle();

      if (topicData) {
        await (supabase.from("coding_problem_topics") as any).insert({
          problem_id: bankRow.id,
          topic_id: topicData.id
        });
      }
    }

    for (const companyName of company_tags) {
      const { data: companyData } = await (supabase.from("companies") as any)
        .select("id")
        .ilike("name", companyName.trim())
        .maybeSingle();

      if (companyData) {
        await (supabase.from("coding_problem_companies") as any).insert({
          problem_id: bankRow.id,
          company_id: companyData.id
        });
      }
    }

    return bankRow;
  },

  async updateBankProblem(id: string, updates: any) {
    const { topics, company_tags, ...rest } = updates;

    const { data: bankRow, error: bankErr } = await (supabase.from("coding_problem_bank") as any)
      .update({
        ...rest,
        ...(topics ? { topic: topics[0] || "Arrays" } : {}),
        ...(company_tags ? { companies: company_tags } : {})
      })
      .eq("id", id)
      .select()
      .single();

    if (bankErr) throw bankErr;

    if (topics) {
      await (supabase.from("coding_problem_topics") as any).delete().eq("problem_id", id);
      
      for (const topicName of topics) {
        const { data: topicData } = await (supabase.from("coding_topics") as any)
          .select("id")
          .ilike("name", topicName.trim())
          .maybeSingle();

        if (topicData) {
          await (supabase.from("coding_problem_topics") as any).insert({
            problem_id: id,
            topic_id: topicData.id
          });
        }
      }
    }

    if (company_tags) {
      await (supabase.from("coding_problem_companies") as any).delete().eq("problem_id", id);

      for (const companyName of company_tags) {
        const { data: companyData } = await (supabase.from("companies") as any)
          .select("id")
          .ilike("name", companyName.trim())
          .maybeSingle();

        if (companyData) {
          await (supabase.from("coding_problem_companies") as any).insert({
            problem_id: id,
            company_id: companyData.id
          });
        }
      }
    }

    return bankRow;
  },

  async deleteBankProblem(id: string) {
    const { error } = await (supabase.from("coding_problem_bank") as any)
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async publishBankProblem(id: string) {
    const { data: bankRow, error: fetchErr } = await (supabase.from("coding_problem_bank") as any)
      .select(`
        *,
        coding_problem_topics(coding_topics(id, name))
      `)
      .eq("id", id)
      .single();

    if (fetchErr || !bankRow) throw fetchErr || new Error("Draft problem not found");

    const topicsList = (bankRow.coding_problem_topics || []).map((t: any) => t.coding_topics?.id).filter(Boolean);
    const firstTopicId = topicsList[0] || null;

    const questionInsert = {
      title: bankRow.title,
      slug: bankRow.slug,
      description: bankRow.description,
      difficulty: bankRow.difficulty,
      constraints: bankRow.constraints,
      sample_input: bankRow.sample_input,
      sample_output: bankRow.sample_output,
      explanation: bankRow.explanation,
      companies: bankRow.companies,
      starter_code: bankRow.starter_code,
      optimal_solutions: bankRow.optimal_solutions || (bankRow.editorial?.approach ? { "Optimal": bankRow.editorial.approach } : {}),
      complexity: bankRow.complexity || (bankRow.editorial?.time_complexity ? { time: bankRow.editorial.time_complexity, space: bankRow.editorial.space_complexity } : {}),
      examples: bankRow.examples,
      topic_id: firstTopicId,
      acceptance_rate: bankRow.acceptance_rate || "50.0%"
    };

    const { data: existingQ } = await (supabase.from("coding_questions") as any)
      .select("id")
      .eq("slug", bankRow.slug)
      .maybeSingle();

    let activeRow;
    if (existingQ) {
      const { data, error } = await (supabase.from("coding_questions") as any)
        .update(questionInsert)
        .eq("id", existingQ.id)
        .select()
        .single();
      if (error) throw error;
      activeRow = data;
    } else {
      const { data, error } = await (supabase.from("coding_questions") as any)
        .insert(questionInsert)
        .select()
        .single();
      if (error) throw error;
      activeRow = data;
    }

    const { error: updateErr } = await (supabase.from("coding_problem_bank") as any)
      .update({ status: "published" })
      .eq("id", id);

    if (updateErr) throw updateErr;

    return {
      bankRow,
      activeRow
    };
  },

  /**
   * Run user code against test cases via AI sandbox
   */
  async runCode(
    id: string,
    code: string,
    language: string,
    customInput?: string
  ): Promise<any> {
    const res = await apiFetch(`/api/coding/problems/${id}/run`, {
      method: "POST",
      body: JSON.stringify({ code, language, customInput }),
    });
    if (!res.ok) throw new Error("Failed to execute code");
    const data = await res.json();
    return data.result;
  },

  /**
   * Fetch AI hint for a problem
   */
  async getHint(
    id: string,
    code: string,
    language: string
  ): Promise<string> {
    const res = await apiFetch(`/api/coding/problems/${id}/hint`, {
      method: "POST",
      body: JSON.stringify({ code, language }),
    });
    if (!res.ok) throw new Error("Failed to get hint");
    const data = await res.json();
    return data.hint;
  },

  /**
   * Fetch AI code review for a problem
   */
  async getCodeReview(
    id: string,
    code: string,
    language: string
  ): Promise<any> {
    const res = await apiFetch(`/api/coding/problems/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ code, language }),
    });
    if (!res.ok) throw new Error("Failed to get code review");
    const data = await res.json();
    return data.review;
  }
};
