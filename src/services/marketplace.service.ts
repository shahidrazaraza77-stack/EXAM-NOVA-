import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/types/supabase";

type RecruiterRow = Database["public"]["Tables"]["recruiters"]["Row"];
type JobListingRow = Database["public"]["Tables"]["job_listings"]["Row"];
type InternshipListingRow = Database["public"]["Tables"]["internship_listings"]["Row"];
type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
type SavedJobRow = Database["public"]["Tables"]["saved_jobs"]["Row"];
type CampusDriveRow = Database["public"]["Tables"]["campus_drives"]["Row"];
type CampusDriveRegistrationRow = Database["public"]["Tables"]["campus_drive_registrations"]["Row"];

const db = supabase as any;

export const marketplaceService = {
  /**
   * Retrieves recruiter profile associated with a user
   */
  async getRecruiterByUserId(userId: string): Promise<RecruiterRow | null> {
    try {
      const { data, error } = await db
        .from("recruiters")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching recruiter by user id:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  /**
   * Updates or inserts a recruiter profile
   */
  async updateRecruiter(userId: string, companyName: string, designation: string): Promise<RecruiterRow | null> {
    try {
      const { data, error } = await db
        .from("recruiters")
        .upsert({
          user_id: userId,
          company_name: companyName,
          designation,
          verified: false
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (error) {
        console.error("Error updating recruiter profile:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  /**
   * Retrieves job listings with optional filtering
   */
  async getJobListings(filters?: {
    search?: string;
    location?: string;
    type?: string;
    package?: string;
  }): Promise<JobListingRow[]> {
    try {
      let query = db.from("job_listings").select("*");

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }
      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }
      if (filters?.type && filters.type !== "all") {
        query = query.eq("employment_type", filters.type);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching job listings:", error);
        return [];
      }

      let results = data || [];

      if (filters?.package && filters.package !== "all") {
        // Simple filter logic for package
        if (filters.package === "high") {
          // Assume package contains text with digits like "12 LPA", filter higher packages
          results = results.filter((j: any) => {
            const num = parseInt(j.package_range.replace(/\D/g, ""), 10);
            return isNaN(num) || num >= 10;
          });
        } else if (filters.package === "mid") {
          results = results.filter((j: any) => {
            const num = parseInt(j.package_range.replace(/\D/g, ""), 10);
            return isNaN(num) || (num >= 5 && num < 10);
          });
        }
      }

      return results;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * Retrieves a job listing by ID
   */
  async getJobListingById(id: string): Promise<JobListingRow | null> {
    try {
      const { data, error } = await db
        .from("job_listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching job listing:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  /**
   * Creates a new job listing
   */
  async createJobListing(userId: string, listing: Omit<Database["public"]["Tables"]["job_listings"]["Insert"], "recruiter_id">): Promise<JobListingRow | null> {
    try {
      const recruiter = await this.getRecruiterByUserId(userId);
      if (!recruiter) {
        throw new Error("User is not registered as a recruiter.");
      }

      const { data, error } = await db
        .from("job_listings")
        .insert({
          ...listing,
          recruiter_id: recruiter.id,
          company_name: recruiter.company_name
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating job listing:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  /**
   * Retrieves internship listings with optional filtering
   */
  async getInternshipListings(filters?: {
    search?: string;
    location?: string;
    stipend?: string;
  }): Promise<InternshipListingRow[]> {
    try {
      let query = db.from("internship_listings").select("*");

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }
      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching internships:", error);
        return [];
      }

      let results = data || [];

      if (filters?.stipend && filters.stipend !== "all") {
        if (filters.stipend === "paid") {
          results = results.filter((i: any) => !i.stipend.toLowerCase().includes("unpaid") && !i.stipend.toLowerCase().includes("free"));
        } else if (filters.stipend === "high") {
          results = results.filter((i: any) => {
            const num = parseInt(i.stipend.replace(/\D/g, ""), 10);
            return isNaN(num) || num >= 15000;
          });
        }
      }

      return results;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * Retrieves an internship listing by ID
   */
  async getInternshipListingById(id: string): Promise<InternshipListingRow | null> {
    try {
      const { data, error } = await db
        .from("internship_listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching internship listing:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  /**
   * Creates a new internship listing
   */
  async createInternshipListing(userId: string, listing: Omit<Database["public"]["Tables"]["internship_listings"]["Insert"], "recruiter_id">): Promise<InternshipListingRow | null> {
    try {
      const recruiter = await this.getRecruiterByUserId(userId);
      if (!recruiter) {
        throw new Error("User is not registered as a recruiter.");
      }

      const { data, error } = await db
        .from("internship_listings")
        .insert({
          ...listing,
          recruiter_id: recruiter.id,
          company_name: recruiter.company_name
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating internship listing:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  /**
   * Submit application for a listing
   */
  async applyToListing(params: {
    userId: string;
    listingId: string;
    listingType: "job" | "internship";
    resumeId: string | null;
  }): Promise<ApplicationRow | null> {
    try {
      const { userId, listingId, listingType, resumeId } = params;

      const { data, error } = await db
        .from("applications")
        .insert({
          user_id: userId,
          listing_id: listingId,
          listing_type: listingType,
          resume_id: resumeId,
          status: "applied"
        })
        .select()
        .single();

      if (error) {
        console.error("Error submitting application:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  /**
   * Get single application status for a listing
   */
  async getApplicationStatus(userId: string, listingId: string): Promise<ApplicationRow | null> {
    try {
      const { data, error } = await db
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .eq("listing_id", listingId)
        .maybeSingle();

      if (error) {
        console.error("Error getting application status:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  /**
   * Retrieves student's applied listings with title and company details
   */
  async getUserApplications(userId: string): Promise<any[]> {
    try {
      const { data: apps, error } = await db
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user applications:", error);
        return [];
      }

      const detailedApps = await Promise.all((apps || []).map(async (app: any) => {
        let details = null;
        if (app.listing_type === "job") {
          details = await this.getJobListingById(app.listing_id);
        } else {
          details = await this.getInternshipListingById(app.listing_id);
        }
        return {
          ...app,
          details
        };
      }));

      return detailedApps;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * Retrieves all candidate applications for recruiter's listings
   */
  async getRecruiterApplications(recruiterUserId: string): Promise<any[]> {
    try {
      const recruiter = await this.getRecruiterByUserId(recruiterUserId);
      if (!recruiter) return [];

      const [jobs, internships] = await Promise.all([
        db.from("job_listings").select("id, title").eq("recruiter_id", recruiter.id),
        db.from("internship_listings").select("id, title").eq("recruiter_id", recruiter.id)
      ]);

      const listingIds = [
        ...(jobs.data || []).map((j: any) => j.id),
        ...(internships.data || []).map((i: any) => i.id)
      ];

      if (listingIds.length === 0) return [];

      const { data: apps, error } = await db
        .from("applications")
        .select(`
          id,
          user_id,
          listing_id,
          listing_type,
          resume_id,
          status,
          created_at,
          profiles (full_name, email)
        `)
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching recruiter applications:", error);
        return [];
      }

      const mappedApps = (apps || []).map((app: any) => {
        const matchingJob = (jobs.data || []).find((j: any) => j.id === app.listing_id);
        const matchingIntern = (internships.data || []).find((i: any) => i.id === app.listing_id);
        return {
          ...app,
          listing_title: matchingJob?.title || matchingIntern?.title || "Unknown Role",
          candidate_name: app.profiles?.full_name || "Applicant",
          candidate_email: app.profiles?.email || ""
        };
      });

      return mappedApps;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * Updates applicant's status
   */
  async updateApplicationStatus(applicationId: string, status: string): Promise<boolean> {
    try {
      const { error } = await db
        .from("applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) {
        console.error("Error updating application status:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * Bookmark listing
   */
  async saveJob(userId: string, listingId: string, listingType: "job" | "internship"): Promise<boolean> {
    try {
      const { error } = await db
        .from("saved_jobs")
        .insert({ user_id: userId, listing_id: listingId, listing_type: listingType });

      if (error) {
        console.error("Error saving job:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * Remove Bookmark
   */
  async unsaveJob(userId: string, listingId: string): Promise<boolean> {
    try {
      const { error } = await db
        .from("saved_jobs")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", listingId);

      if (error) {
        console.error("Error unsaving job:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * Get student's bookmarked listings
   */
  async getUserSavedJobs(userId: string): Promise<any[]> {
    try {
      const { data: saved, error } = await db
        .from("saved_jobs")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error getting saved jobs:", error);
        return [];
      }

      const detailedSaved = await Promise.all((saved || []).map(async (s: any) => {
        let details = null;
        if (s.listing_type === "job") {
          details = await this.getJobListingById(s.listing_id);
        } else {
          details = await this.getInternshipListingById(s.listing_id);
        }
        return {
          ...s,
          details
        };
      }));

      return detailedSaved.filter(s => s.details !== null);
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * Retrieve active campus hiring drives
   */
  async getCampusDrives(): Promise<CampusDriveRow[]> {
    try {
      const { data, error } = await db
        .from("campus_drives")
        .select("*")
        .order("drive_date", { ascending: true });

      if (error) {
        console.error("Error getting campus drives:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * Retrieve recruiter's posted drives
   */
  async getRecruiterCampusDrives(recruiterUserId: string): Promise<CampusDriveRow[]> {
    try {
      const recruiter = await this.getRecruiterByUserId(recruiterUserId);
      if (!recruiter) return [];

      const { data, error } = await db
        .from("campus_drives")
        .select("*")
        .eq("recruiter_id", recruiter.id)
        .order("drive_date", { ascending: true });

      if (error) {
        console.error("Error getting recruiter drives:", error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * Creates a campus hiring drive
   */
  async createCampusDrive(userId: string, drive: Omit<Database["public"]["Tables"]["campus_drives"]["Insert"], "recruiter_id">): Promise<CampusDriveRow | null> {
    try {
      const recruiter = await this.getRecruiterByUserId(userId);
      if (!recruiter) throw new Error("User is not registered as recruiter.");

      const { data, error } = await db
        .from("campus_drives")
        .insert({
          ...drive,
          recruiter_id: recruiter.id,
          company_name: recruiter.company_name
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating campus drive:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  /**
   * Register a student for a campus drive
   */
  async registerForCampusDrive(userId: string, driveId: string): Promise<boolean> {
    try {
      const { error } = await db
        .from("campus_drive_registrations")
        .insert({ user_id: userId, drive_id: driveId });

      if (error) {
        console.error("Error registering for drive:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  /**
   * Retrieve drives registered by user
   */
  async getUserCampusDrives(userId: string): Promise<any[]> {
    try {
      const { data: regs, error } = await db
        .from("campus_drive_registrations")
        .select("drive_id")
        .eq("user_id", userId);

      if (error) {
        console.error("Error getting user registered drives:", error);
        return [];
      }

      const driveIds = (regs || []).map((r: any) => r.drive_id);
      if (driveIds.length === 0) return [];

      const { data: drives, error: drivesError } = await db
        .from("campus_drives")
        .select("*")
        .in("id", driveIds);

      if (drivesError) {
        console.error("Error loading drive list:", drivesError);
        return [];
      }

      return drives || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * Get candidates registered for a drive
   */
  async getRecruiterDriveRegistrations(driveId: string): Promise<any[]> {
    try {
      const { data, error } = await db
        .from("campus_drive_registrations")
        .select(`
          id,
          created_at,
          profiles (full_name, email)
        `)
        .eq("drive_id", driveId);

      if (error) {
        console.error("Error getting drive registrations:", error);
        return [];
      }

      return (data || []).map((reg: any) => ({
        id: reg.id,
        created_at: reg.created_at,
        student_name: reg.profiles?.full_name || "Student",
        student_email: reg.profiles?.email || ""
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  /**
   * Recruiter stats metrics
   */
  async getRecruiterStats(recruiterUserId: string): Promise<{
    totalApplicants: number;
    shortlisted: number;
    selected: number;
    conversionRate: number;
    listings: any[];
  }> {
    try {
      const recruiter = await this.getRecruiterByUserId(recruiterUserId);
      if (!recruiter) {
        return { totalApplicants: 0, shortlisted: 0, selected: 0, conversionRate: 0, listings: [] };
      }

      // Fetch active posted listings
      const [jobs, interns] = await Promise.all([
        db.from("job_listings").select("*").eq("recruiter_id", recruiter.id),
        db.from("internship_listings").select("*").eq("recruiter_id", recruiter.id)
      ]);

      const activeListings = [
        ...(jobs.data || []).map((j: any) => ({ ...j, type: "job" })),
        ...(interns.data || []).map((i: any) => ({ ...i, type: "internship" }))
      ];

      const listingIds = activeListings.map(l => l.id);
      if (listingIds.length === 0) {
        return { totalApplicants: 0, shortlisted: 0, selected: 0, conversionRate: 0, listings: [] };
      }

      // Fetch applications counts
      const { data: apps, error } = await db
        .from("applications")
        .select("status")
        .in("listing_id", listingIds);

      if (error) throw error;

      const totalApplicants = apps?.length || 0;
      const shortlisted = apps?.filter((a: any) => a.status === "shortlisted" || a.status === "interview scheduled").length || 0;
      const selected = apps?.filter((a: any) => a.status === "selected").length || 0;
      const conversionRate = totalApplicants > 0 ? Math.round((selected / totalApplicants) * 100) : 0;

      return {
        totalApplicants,
        shortlisted,
        selected,
        conversionRate,
        listings: activeListings
      };
    } catch (e) {
      console.error(e);
      return { totalApplicants: 0, shortlisted: 0, selected: 0, conversionRate: 0, listings: [] };
    }
  }
};
