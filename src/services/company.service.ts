import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];
type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];
type TopicRow = Database["public"]["Tables"]["company_topics"]["Row"];

export interface FrontendCompany {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  difficulty: string | null;
  package_range: string | null;
  hiring_process: HiringProcessStep[];
  eligibility: string | null;
  required_skills: string[];
  preparation_tips: string[];
  recommendations: Array<{ title: string; description: string; priority: "High" | "Medium" | "Low" }>;
  created_at: string | null;
}

export interface HiringProcessStep {
  round: number;
  title: string;
  description: string;
}

export interface RoadmapWeek {
  id: string;
  company_id: string;
  week_number: number;
  topics: string[];
  coding_tasks: string[];
  aptitude_tasks: string[];
  interview_tasks: string[];
  created_at: string | null;
}

export function mapDbCompanyToFrontend(db: CompanyRow): FrontendCompany {
  const hiringProcess: HiringProcessStep[] = Array.isArray(db.hiring_process)
    ? (db.hiring_process as unknown as HiringProcessStep[])
    : [];

  // Parse prep_materials JSON
  let prepMaterials: any = null;
  if (db.prep_materials) {
    try {
      prepMaterials = typeof db.prep_materials === "string"
        ? JSON.parse(db.prep_materials)
        : db.prep_materials;
    } catch (e) {
      console.error("Error parsing prep_materials JSON:", e);
    }
  }

  return {
    id: db.id,
    name: db.name,
    slug: db.slug || "",
    logo_url: db.logo_url,
    description: db.description,
    difficulty: db.difficulty,
    package_range: db.package_range,
    hiring_process: hiringProcess,
    eligibility: prepMaterials?.eligibility || null,
    required_skills: prepMaterials?.required_skills || [],
    preparation_tips: prepMaterials?.preparation_tips || [],
    recommendations: prepMaterials?.recommendations || [],
    created_at: db.created_at,
  };
}

export const companyService = {
  async getCompanies(): Promise<FrontendCompany[]> {
    const { data, error } = await (supabase.from("companies") as any)
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapDbCompanyToFrontend);
  },

  async getCompany(slug: string): Promise<{
    company: FrontendCompany;
    roadmap: RoadmapWeek[];
  }> {
    const { data: company, error: companyError } = await (supabase.from("companies") as any)
      .select("*")
      .eq("slug", slug)
      .single();

    if (companyError) {
      if (companyError.code === "PGRST116") throw new Error("Company not found");
      throw companyError;
    }

    const { data: roadmap, error: roadmapError } = await (supabase.from("company_roadmaps") as any)
      .select("*")
      .eq("company_id", company.id)
      .order("week_number", { ascending: true });

    if (roadmapError) throw roadmapError;

    return {
      company: mapDbCompanyToFrontend(company),
      roadmap: roadmap || [],
    };
  },

  async getRoadmap(companyId: string): Promise<RoadmapWeek[]> {
    const { data: roadmap, error } = await (supabase.from("company_roadmaps") as any)
      .select("*")
      .eq("company_id", companyId)
      .order("week_number", { ascending: true });

    if (error) throw error;
    return roadmap || [];
  },

  async getReadiness(userId: string, companyId: string): Promise<number> {
    const { data, error } = await (supabase.from("user_company_progress") as any)
      .select("readiness_score")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .maybeSingle();

    if (error) throw error;
    if (data) return data.readiness_score || 0;

    // Fallback to backward compatible table if new progress is missing
    const { data: readinessData } = await (supabase.from("company_readiness") as any)
      .select("readiness_score")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .maybeSingle();

    return readinessData?.readiness_score || 0;
  },

  async getProgress(userId: string, companyId: string): Promise<any | null> {
    const { data, error } = await (supabase.from("user_company_progress") as any)
      .select("*")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllProgress(userId: string): Promise<any[]> {
    const { data, error } = await (supabase.from("user_company_progress") as any)
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data || [];
  },

  async updateTaskCompletion(
    userId: string,
    companyId: string,
    taskText: string,
    isCompleted: boolean
  ): Promise<any> {
    // 1. Fetch current progress record
    let { data: progress, error: fetchErr } = await (supabase.from("user_company_progress") as any)
      .select("*")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    let completedTasks: string[] = [];
    if (progress && progress.completed_tasks) {
      completedTasks = Array.isArray(progress.completed_tasks)
        ? progress.completed_tasks
        : [];
    }

    // Update list
    if (isCompleted) {
      if (!completedTasks.includes(taskText)) {
        completedTasks.push(taskText);
      }
    } else {
      completedTasks = completedTasks.filter(t => t !== taskText);
    }

    // 2. Fetch all roadmap weeks to map categories
    const { data: roadmaps, error: rError } = await (supabase.from("company_roadmaps") as any)
      .select("*")
      .eq("company_id", companyId);

    if (rError) throw rError;

    // Group all roadmap tasks by category
    let allAptitudeTasks: string[] = [];
    let allCodingTasks: string[] = [];
    let allInterviewTasks: string[] = [];

    (roadmaps || []).forEach((r: any) => {
      if (r.aptitude_tasks) allAptitudeTasks.push(...r.aptitude_tasks);
      if (r.coding_tasks) allCodingTasks.push(...r.coding_tasks);
      if (r.interview_tasks) allInterviewTasks.push(...r.interview_tasks);
    });

    // Count completed tasks per category
    const compAptitude = completedTasks.filter(t => allAptitudeTasks.includes(t)).length;
    const compCoding = completedTasks.filter(t => allCodingTasks.includes(t)).length;
    const compInterview = completedTasks.filter(t => allInterviewTasks.includes(t)).length;

    // Calculate percentages
    const aptitudeProgress = allAptitudeTasks.length > 0 ? Math.round((compAptitude / allAptitudeTasks.length) * 100) : 0;
    const codingProgress = allCodingTasks.length > 0 ? Math.round((compCoding / allCodingTasks.length) * 100) : 0;
    const interviewProgress = allInterviewTasks.length > 0 ? Math.round((compInterview / allInterviewTasks.length) * 100) : 0;

    // Fetch global resume score from user_analytics
    const { data: analytics } = await (supabase.from("user_analytics") as any)
      .select("resume_score")
      .eq("user_id", userId)
      .maybeSingle();

    const resumeScore = analytics?.resume_score || 0;

    // Calculate company readiness score using the formula:
    // readiness = aptitude (25%) + coding (35%) + interview (25%) + resume (15%)
    const readinessScore = Math.round(
      (aptitudeProgress * 0.25) +
      (codingProgress * 0.35) +
      (interviewProgress * 0.25) +
      (resumeScore * 0.15)
    );

    // 3. Upsert progress record
    const { data: updatedProgress, error: upsertErr } = await (supabase.from("user_company_progress") as any)
      .upsert({
        user_id: userId,
        company_id: companyId,
        readiness_score: readinessScore,
        aptitude_progress: aptitudeProgress,
        coding_progress: codingProgress,
        interview_progress: interviewProgress,
        completed_tasks: completedTasks,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,company_id" })
      .select()
      .single();

    if (upsertErr) throw upsertErr;

    // Maintain fallback compatibility table
    await (supabase.from("company_readiness") as any)
      .upsert({
        user_id: userId,
        company_id: companyId,
        readiness_score: readinessScore,
        last_updated: new Date().toISOString()
      }, { onConflict: "user_id,company_id" });

    return updatedProgress;
  },

  async getCompanyQuestions(companyId: string, companyName: string): Promise<{
    aptitude: any[];
    coding: any[];
    hr: any[];
  }> {
    // 1. Fetch aptitude questions that have companyName in their companies array
    const { data: aptitude } = await (supabase.from("aptitude_questions") as any)
      .select("*, aptitude_topics(name)")
      .contains("companies", [companyName]);

    // 2. Fetch coding questions that have companyName in their companies array
    const { data: coding } = await (supabase.from("coding_questions") as any)
      .select("*, coding_topics(name)")
      .contains("companies", [companyName]);

    // 3. Provide standard HR behavioral questions for that company
    const hrQuestions = [
      { id: 1, question: `Why do you want to join ${companyName}?`, category: "HR", tip: `Emphasize ${companyName}'s current achievements, technology focus, and cultural alignment. Connect it with your own career goals.` },
      { id: 2, question: "Tell me about a time you had to learn a complex new technology in a short timeframe.", category: "Technical/Behavioral", tip: "Use the STAR method. Describe the situation, the task you had to perform, the actions you took to learn, and the successful outcome." },
      { id: 3, question: "Explain a situation where you had a disagreement with a team member. How did you resolve it?", category: "Behavioral", tip: "Focus on communication, active listening, and reaching a professional consensus. Keep it positive and outcome-oriented." },
      { id: 4, question: "Where do you see yourself in five years?", category: "HR", tip: "Highlight your commitment to continuous learning, growing technically, and stepping into mentoring or architectural roles." }
    ];

    return {
      aptitude: aptitude || [],
      coding: coding || [],
      hr: hrQuestions
    };
  },

  async getCompaniesByDifficulty(difficulty: string): Promise<FrontendCompany[]> {
    let query = (supabase.from("companies") as any).select("*");

    if (difficulty && difficulty !== "All") {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error } = await query.order("name", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapDbCompanyToFrontend);
  },

  async adminAddCompany(data: Omit<CompanyInsert, "id" | "created_at">): Promise<CompanyRow> {
    const { data: result, error } = await (supabase.from("companies") as any)
      .insert(data as any)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async adminEditCompany(id: string, updates: CompanyUpdate): Promise<CompanyRow> {
    const { data, error } = await (supabase.from("companies") as any)
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async adminDeleteCompany(id: string): Promise<void> {
    const { error } = await (supabase.from("companies") as any)
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async adminUpdateRoadmap(
    companyId: string,
    weekNumber: number,
    topics: string[],
    aptitudeTasks: string[],
    codingTasks: string[],
    interviewTasks: string[]
  ): Promise<any> {
    const { data, error } = await (supabase.from("company_roadmaps") as any)
      .upsert(
        {
          company_id: companyId,
          week_number: weekNumber,
          topics,
          aptitude_tasks: aptitudeTasks,
          coding_tasks: codingTasks,
          interview_tasks: interviewTasks,
        },
        { onConflict: "company_id,week_number" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async adminMapTopic(
    companyId: string,
    topicType: "aptitude" | "coding" | "technical" | "hr",
    referenceId: string
  ): Promise<TopicRow> {
    const { data, error } = await (supabase.from("company_topics") as any)
      .upsert(
        {
          company_id: companyId,
          topic_type: topicType,
          reference_id: referenceId,
        },
        { onConflict: "company_id,topic_type,reference_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async adminUnmapTopic(id: string): Promise<void> {
    const { error } = await (supabase.from("company_topics") as any)
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async adminGetTopics(companyId: string): Promise<TopicRow[]> {
    const { data, error } = await (supabase.from("company_topics") as any)
      .select("*")
      .eq("company_id", companyId);

    if (error) throw error;
    return data || [];
  },
};
