import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";



export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateResumeFile(file: File): FileValidationResult {
  const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only PDF and DOCX files are supported." };
  }
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 5MB." };
  }
  return { valid: true };
}

export const resumeService = {
  async uploadResume(
    userId: string,
    file: File,
  ): Promise<any> {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filePath = `${userId}/${timestamp}_${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const payload: any = {
      user_id: userId,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
    };

    const { data, error } = await (supabase.from("resumes") as any)
      .insert(payload)
      .select()
      .single();

    if (error) {
      await supabase.storage.from("resumes").remove([filePath]);
      throw error;
    }

    return data;
  },

  async getResumes(userId: string): Promise<any[]> {
    const { data, error } = await (supabase.from("resumes") as any)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async deleteResume(resumeId: string, filePath: string): Promise<void> {
    const { error: dbError } = await (supabase.from("resumes") as any)
      .delete()
      .eq("id", resumeId);
    if (dbError) throw dbError;

    const { error: storageError } = await supabase.storage.from("resumes").remove([filePath]);
    if (storageError) {
      console.error("Warning: File could not be deleted from storage bucket:", storageError);
    }
  },

  async updateResumeScore(
    resumeId: string,
    score: number,
    feedback: any,
    parsedContent?: string
  ): Promise<any> {
    const { data, error } = await (supabase.from("resumes") as any)
      .update({
        score,
        feedback,
        parsed_content: parsedContent || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resumeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async analyzeResume(resumeId: string): Promise<any> {
    const response = await apiFetch("/api/resume/analyze", {
      method: "POST",
      body: JSON.stringify({ resumeId }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to analyze resume");
    }

    const { analysis } = await response.json();
    return analysis as any;
  },

  async getAnalysis(resumeId: string): Promise<any | null> {
    const { data, error } = await (supabase.from("resume_analysis") as any)
      .select("*")
      .eq("resume_id", resumeId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as any;
  },

  async getResumeById(resumeId: string): Promise<any> {
    const { data, error } = await (supabase.from("resumes") as any)
      .select("*")
      .eq("id", resumeId)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async updateResume(resumeId: string, updates: any): Promise<any> {
    const { data, error } = await (supabase.from("resumes") as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", resumeId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async duplicateResume(resumeId: string): Promise<any> {
    const original: any = await resumeService.getResumeById(resumeId);
    if (!original) throw new Error("Resume not found");

    const latestVersion = await resumeService.getLatestVersionNumber(original.user_id);
    const payload: any = {
      user_id: original.user_id,
      name: `${original.name || original.file_name || "Resume"} (Copy)`,
      file_name: original.file_name,
      file_path: original.file_path,
      file_size: original.file_size,
      content: original.content,
      parsed_content: original.parsed_content,
      ats_score: original.ats_score,
      score: original.score,
      improved_content: original.improved_content,
      feedback: original.feedback,
      target_company: original.target_company,
      is_ai_generated: original.is_ai_generated,
      version: latestVersion + 1,
    };
    const { data, error } = await (supabase.from("resumes") as any)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  async renameResume(resumeId: string, name: string): Promise<any> {
    return resumeService.updateResume(resumeId, { name } as any);
  },

  async restoreResume(resumeId: string): Promise<any> {
    const original: any = await resumeService.getResumeById(resumeId);
    if (!original) throw new Error("Resume not found");

    const latestVersion = await resumeService.getLatestVersionNumber(original.user_id);
    const newVersion = latestVersion + 1;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const payload: any = {
      user_id: original.user_id,
      name: original.name || original.file_name || "Restored Resume",
      file_name: original.file_name,
      file_path: original.file_path,
      file_size: original.file_size,
      content: original.content,
      parsed_content: original.parsed_content,
      ats_score: original.ats_score,
      score: original.ats_score || 0,
      improved_content: original.improved_content,
      feedback: original.feedback,
      target_company: original.target_company,
      is_ai_generated: original.is_ai_generated,
      version: newVersion,
    };

    const { data, error } = await (supabase.from("resumes") as any)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    await (supabase.from("user_analytics") as any)
      .update({ resume_score: original.ats_score || 0 })
      .eq("user_id", user.id);

    return data as any;
  },

  async getLatestVersionNumber(userId: string): Promise<number> {
    const { data, error } = await (supabase.from("resumes") as any)
      .select("version")
      .eq("user_id", userId)
      .order("version", { ascending: false })
      .limit(1);
    if (error) throw error;
    return (data && data.length > 0) ? (data[0].version || 0) : 0;
  },

  async matchWithJob(resumeId: string, jobDescription: string): Promise<any> {
    const response = await apiFetch("/api/resume/match-job", {
      method: "POST",
      body: JSON.stringify({ resumeId, jobDescription }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to match resume with job");
    }

    const { match } = await response.json();
    return match;
  },
};
