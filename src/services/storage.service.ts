import { supabase } from "@/lib/supabase";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_AVATAR_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_RESUME_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export const storageService = {
  /**
   * Upload an avatar image and return its public URL
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      throw new Error("Unauthorized: Cannot upload avatars for another user account.");
    }

    // 2. Validate File Size
    if (file.size > MAX_AVATAR_SIZE) {
      throw new Error("Avatar file size must be less than 2MB.");
    }

    // 3. Validate MIME Type & Extension
    const ext = getFileExtension(file.name);
    if (!["jpg", "jpeg", "png", "webp"].includes(ext) || !ALLOWED_AVATAR_MIMES.has(file.type)) {
      throw new Error("Invalid image format. Only JPEG, PNG, or WEBP images are supported.");
    }

    // 4. Generate Safe UUID-based filename (Eliminates Path Traversal & File Spoofing)
    const safeUUID = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const filePath = `${userId}/${safeUUID}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Upload a resume file and return its storage file path
   */
  async uploadResume(userId: string, file: File): Promise<string> {
    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      throw new Error("Unauthorized: Cannot upload resumes for another user account.");
    }

    // 2. Validate File Size
    if (file.size > MAX_RESUME_SIZE) {
      throw new Error("Resume file size must be less than 5MB.");
    }

    // 3. Validate MIME Type & Extension
    const ext = getFileExtension(file.name);
    if (!["pdf", "docx", "doc"].includes(ext) || (!ALLOWED_RESUME_MIMES.has(file.type) && file.type !== "")) {
      throw new Error("Invalid resume format. Only PDF or DOCX documents are permitted.");
    }

    // 4. Generate Safe UUID-based filename (Prevent Path Traversal)
    const safeUUID = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const filePath = `${userId}/${safeUUID}.${ext}`;

    const { error } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;
    return filePath;
  },

  /**
   * Delete an avatar from the bucket using its public URL
   */
  async deleteAvatar(avatarUrl: string): Promise<void> {
    try {
      const pathPart = avatarUrl.split("/storage/v1/object/public/avatars/");
      if (pathPart.length < 2) return;
      const filePath = pathPart[1];
      
      const { error } = await supabase.storage.from("avatars").remove([filePath]);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to delete avatar from storage bucket:", e);
    }
  },
};
