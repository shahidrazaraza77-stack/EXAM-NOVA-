"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { aptitudeQuestions, type AptitudeQuestion } from "../data/aptitude/questions";
import { codingProblems, type CodingProblem } from "../data/coding/problems";
import { technicalQuestions, type TechnicalQuestion } from "../data/technical/questions";
import { hrQuestions, type HRQuestion } from "../data/hr/questions";
import { getAllCompanies, type Company } from "../lib/company-data";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Content Manager" | "Student";
  status: "Active" | "Disabled";
  lastActive: string;
}

export interface MockTest {
  id: string;
  title: string;
  duration: number; // in minutes
  questionCount: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  type: "Aptitude" | "Coding" | "Company";
  targetCompany?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  category: "Articles" | "Preparation Guides" | "Interview Tips" | "Company Insights";
  author: string;
  lastUpdated: string;
  readTime: string;
  status: "Published" | "Draft";
  content?: string;
}

export interface RolePermission {
  role: "Admin" | "Content Manager" | "Student";
  dashboard: "Full" | "View" | "None";
  users: "Full" | "View" | "None";
  questions: "Full" | "View" | "None";
  companies: "Full" | "View" | "None";
  tests: "Full" | "View" | "None";
  content: "Full" | "View" | "None";
  settings: "Full" | "View" | "None";
}

export interface Roadmap {
  id: string;
  company: string;
  week: number;
  topics: string[];
  codingTasks: string[];
  aptitudeTasks: string[];
  interviewTasks: string[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetAudience: "All" | "Students" | "Admins" | "Premium";
  startDate: string;
  endDate: string;
  status: "Active" | "Scheduled" | "Expired";
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  user: string;
  timestamp: string;
  category: "user" | "question" | "company" | "roadmap" | "announcement" | "settings" | "system" | "import";
}

export interface PlatformSettings {
  siteName: string;
  tagline: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  branding: {
    primaryColor: string;
    logoText: string;
    darkThemeByDefault: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    weeklyDigest: boolean;
    slackIntegration: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number; // in minutes
    passwordExpiryDays: number;
  };
}

interface AdminContextType {
  // State
  users: MockUser[];
  aptitudeQs: AptitudeQuestion[];
  codingQs: CodingProblem[];
  technicalQs: TechnicalQuestion[];
  hrQs: HRQuestion[];
  companies: Company[];
  mockTests: MockTest[];
  contentItems: ContentItem[];
  rolePermissions: RolePermission[];
  settings: PlatformSettings;
  roadmaps: Roadmap[];
  announcements: Announcement[];
  activityLogs: ActivityLog[];
  isLoading: boolean;
  
  // Actions
  refreshData: () => Promise<void>;
  // Users
  addUser: (user: Omit<MockUser, "id" | "lastActive">) => Promise<void>;
  updateUser: (id: string, updates: Partial<MockUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Aptitude Questions
  addAptitudeQ: (q: Omit<AptitudeQuestion, "id">) => Promise<void>;
  editAptitudeQ: (id: number, updates: Partial<AptitudeQuestion>) => Promise<void>;
  deleteAptitudeQ: (id: number) => Promise<void>;
  
  // Coding Questions
  addCodingQ: (q: Omit<CodingProblem, "acceptanceRate" | "status">) => Promise<void>;
  editCodingQ: (id: string, updates: Partial<CodingProblem>) => Promise<void>;
  deleteCodingQ: (id: string) => Promise<void>;
  
  // Technical Questions
  addTechnicalQ: (q: Omit<TechnicalQuestion, "id">) => Promise<void>;
  editTechnicalQ: (id: number, updates: Partial<TechnicalQuestion>) => Promise<void>;
  deleteTechnicalQ: (id: number) => Promise<void>;
  
  // HR Questions
  addHRQ: (q: Omit<HRQuestion, "id">) => Promise<void>;
  editHRQ: (id: number, updates: Partial<HRQuestion>) => Promise<void>;
  deleteHRQ: (id: number) => Promise<void>;
  
  // Companies
  addCompany: (c: Omit<Company, "progress" | "readinessScore">) => Promise<void>;
  editCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  
  // Mock Tests
  addMockTest: (t: Omit<MockTest, "id">) => Promise<void>;
  editMockTest: (id: string, updates: Partial<MockTest>) => Promise<void>;
  deleteMockTest: (id: string) => Promise<void>;
  
  // Content Items
  addContentItem: (item: Omit<ContentItem, "id" | "lastUpdated">) => Promise<void>;
  editContentItem: (id: string, updates: Partial<ContentItem>) => Promise<void>;
  deleteContentItem: (id: string) => Promise<void>;
  
  // Role Permissions
  updateRolePermissions: (role: "Admin" | "Content Manager" | "Student", updates: Partial<RolePermission>) => Promise<void>;
  
  // Settings
  updateSettings: (updates: Partial<PlatformSettings>) => Promise<void>;
  
  // Activity Logs
  addActivityLog: (log: Omit<ActivityLog, "id" | "timestamp">) => Promise<void>;
  
  // Roadmaps
  addRoadmap: (r: Omit<Roadmap, "id">) => Promise<void>;
  editRoadmap: (id: string, updates: Partial<Roadmap>) => Promise<void>;
  deleteRoadmap: (id: string) => Promise<void>;
  
  // Announcements
  addAnnouncement: (a: Omit<Announcement, "id" | "createdAt">) => Promise<void>;
  editAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  // State variables
  const [users, setUsers] = useState<MockUser[]>([]);
  const [aptitudeQs, setAptitudeQs] = useState<AptitudeQuestion[]>([]);
  const [codingQs, setCodingQs] = useState<CodingProblem[]>([]);
  const [technicalQs, setTechnicalQs] = useState<TechnicalQuestion[]>([]);
  const [hrQs, setHRQs] = useState<HRQuestion[]>([]);
  const [companies, setCompanies] = useState<Company[]>(getAllCompanies());
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([
    { role: "Admin", dashboard: "Full", users: "Full", questions: "Full", companies: "Full", tests: "Full", content: "Full", settings: "Full" },
    { role: "Content Manager", dashboard: "View", users: "None", questions: "Full", companies: "Full", tests: "Full", content: "Full", settings: "None" },
    { role: "Student", dashboard: "View", users: "None", questions: "View", companies: "View", tests: "View", content: "View", settings: "None" },
  ]);
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: "ExamNova",
    tagline: "Your AI Placement Coach",
    maintenanceMode: false,
    allowRegistrations: true,
    branding: {
      primaryColor: "violet",
      logoText: "ExamNova",
      darkThemeByDefault: true,
    },
    notifications: {
      emailAlerts: true,
      weeklyDigest: true,
      slackIntegration: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 60,
      passwordExpiryDays: 90,
    },
  });
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // DB Sync / Loader
  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch Users from profiles
      const { data: dbUsers } = await (supabase as any).from("profiles").select("*");
      if (dbUsers) {
        setUsers(dbUsers.map((u: any) => ({
          id: u.id,
          name: u.full_name || "User",
          email: u.email || "",
          role: u.role === "admin" ? "Admin" : u.role === "content_manager" ? "Content Manager" : "Student",
          status: u.suspended ? "Disabled" : "Active",
          lastActive: "Recent",
        })));
      }

      // 2. Fetch Aptitude Questions
      const { data: dbAptitude } = await (supabase as any).from("aptitude_questions").select("*, aptitude_topics(name, category)");
      if (dbAptitude) {
        setAptitudeQs(dbAptitude.map((q: any) => ({
          id: q.id,
          category: q.aptitude_topics?.category || "quantitative",
          topic: q.aptitude_topics?.name || "Aptitude",
          question: q.question,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correctAnswer: q.correct_answer === "A" ? 0 : q.correct_answer === "B" ? 1 : q.correct_answer === "C" ? 2 : 3,
          explanation: q.explanation || "",
          difficulty: q.difficulty,
          companies: q.companies || [],
        })) as any);
      }

      // 3. Fetch Coding Problems
      const { data: dbCoding } = await (supabase as any).from("coding_questions").select("*");
      if (dbCoding) {
        setCodingQs(dbCoding.map((q: any) => ({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          acceptanceRate: q.acceptance_rate || "50.0%",
          status: "Todo",
          topic: q.topic || "General",
          description: q.description || "",
          constraints: q.constraints || [],
          boilerplates: q.starter_code || {},
          optimalSolutions: q.optimal_solutions || {},
          examples: q.examples || [],
        })) as any);
      }

      // 4. Fetch Technical & HR Questions
      const { data: dbInterview } = await (supabase as any).from("interview_questions").select("*");
      if (dbInterview) {
        const tech = dbInterview.filter((q: any) => q.mode === "technical").map((q: any) => ({
          id: q.id,
          subject: q.topic || "General",
          question: q.question,
          difficulty: q.difficulty === "easy" ? "Easy" : q.difficulty === "medium" ? "Medium" : "Hard",
          answer: q.expected_answer || "",
          companies: [],
        }));
        setTechnicalQs(tech as any);

        const hr = dbInterview.filter((q: any) => q.mode === "hr").map((q: any) => ({
          id: q.id,
          question: q.question,
          category: q.topic || "Introduction",
          tip: q.expected_answer || "",
          companies: [],
        }));
        setHRQs(hr as any);
      }

      // 5. Fetch Companies
      const { data: dbCompanies } = await (supabase as any).from("companies").select("*");
      if (dbCompanies && dbCompanies.length > 0) {
        setCompanies(dbCompanies.map((c: any) => ({
          id: c.slug || c.id,
          name: c.name,
          type: "Technology",
          difficulty: c.difficulty || "Medium",
          progress: 0,
          readinessScore: 0,
          logoColor: "from-blue-600 to-blue-800",
          logoBg: "bg-blue-100 dark:bg-blue-950",
        })));
      }

      // 6. Fetch Mock Tests
      const { data: dbTests } = await (supabase as any).from("aptitude_tests").select("*");
      if (dbTests) {
        setMockTests(dbTests.map((t: any) => ({
          id: t.id,
          title: t.title,
          duration: t.duration_minutes,
          questionCount: 20,
          difficulty: t.difficulty || "Medium",
          type: (t.type || "Aptitude") as any,
          targetCompany: t.target_company || undefined,
        })));
      }

      // 7. Fetch Announcements
      const { data: dbAnnouncements } = await (supabase as any).from("announcements").select("*").order("created_at", { ascending: false });
      if (dbAnnouncements) {
        setAnnouncements(dbAnnouncements.map((a: any) => ({
          id: a.id,
          title: a.title,
          message: a.message,
          targetAudience: a.target_audience,
          startDate: a.start_date,
          endDate: a.end_date,
          status: a.status,
          createdAt: a.created_at,
        })));
      }

      // 8. Fetch Content Library
      const { data: dbContent } = await (supabase as any).from("content_library").select("*").order("created_at", { ascending: false });
      if (dbContent) {
        setContentItems(dbContent.map((c: any) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          author: c.author,
          lastUpdated: c.last_updated,
          readTime: c.read_time,
          status: c.status,
          content: c.content || "",
        })));
      }

      // 9. Fetch Roadmaps
      const { data: dbRoadmaps } = await (supabase as any).from("company_roadmaps").select("*, companies(name)");
      if (dbRoadmaps) {
        setRoadmaps(dbRoadmaps.map((r: any) => ({
          id: r.id,
          company: r.companies?.name || "General",
          week: r.week_number,
          topics: r.topics || [],
          codingTasks: r.coding_tasks || [],
          aptitudeTasks: r.aptitude_tasks || [],
          interviewTasks: r.interview_tasks || [],
        })));
      }

      // 10. Fetch Settings
      const { data: dbSettings } = await (supabase as any).from("platform_settings").select("*");
      if (dbSettings) {
        const settingsMap: Record<string, any> = {};
        for (const row of dbSettings) {
          settingsMap[row.setting_key] = row.setting_value;
        }
        setSettings((prev) => ({
          ...prev,
          siteName: settingsMap.site_name || prev.siteName,
          tagline: settingsMap.tagline || prev.tagline,
          maintenanceMode: settingsMap.maintenance_mode === true || settingsMap.maintenance_mode === "true",
          allowRegistrations: settingsMap.allow_registrations === true || settingsMap.allow_registrations === "true",
          branding: {
            primaryColor: settingsMap.theme_default || prev.branding.primaryColor,
            logoText: settingsMap.site_name || prev.branding.logoText,
            darkThemeByDefault: true,
          },
        }));
      }

      // 11. Fetch Activity Logs
      const { data: dbLogs } = await (supabase as any).from("admin_logs").select("*, profiles(full_name)");
      if (dbLogs) {
        setActivityLogs(dbLogs.map((l: any) => ({
          id: l.id,
          action: l.action,
          description: l.metadata?.description || l.entity_type,
          user: l.profiles?.full_name || "Admin",
          timestamp: new Date(l.created_at).toLocaleString(),
          category: (l.entity_type || "system") as any,
        })));
      }

    } catch (err) {
      console.error("Error refreshing Admin Context data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // CRUD Actions
  // Users
  const addUser = async (user: Omit<MockUser, "id" | "lastActive">) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(user),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create user");
      }
      
      await refreshData();
      await addActivityLog({ action: "User Created", description: `Created user ${user.name}`, user: "Admin", category: "user" });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateUser = async (id: string, updates: Partial<MockUser>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update user");
      }

      await refreshData();
      await addActivityLog({ action: "User Updated", description: `Updated user profile ${id}`, user: "Admin", category: "user" });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete user");
      }

      await refreshData();
      await addActivityLog({ action: "User Deleted", description: `Deleted user account ${id}`, user: "Admin", category: "user" });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Aptitude Questions
  const addAptitudeQ = async (q: Omit<AptitudeQuestion, "id">) => {
    let topicId = null;
    const { data: existingTopic } = await (supabase as any).from("aptitude_topics").select("id").ilike("name", q.topic).maybeSingle();
    if (existingTopic) {
      topicId = existingTopic.id;
    } else {
      const { data: newTopic } = await (supabase as any).from("aptitude_topics").insert({ name: q.topic, category: q.category || "quantitative", description: `Topic ${q.topic}`, icon: "Brain" }).select("id").single();
      if (newTopic) topicId = newTopic.id;
    }

    await (supabase as any).from("aptitude_questions").insert({
      topic_id: topicId,
      question: q.question,
      option_a: q.options[0],
      option_b: q.options[1],
      option_c: q.options[2],
      option_d: q.options[3],
      correct_answer: q.correctAnswer === 0 ? "A" : q.correctAnswer === 1 ? "B" : q.correctAnswer === 2 ? "C" : "D",
      explanation: q.explanation,
      difficulty: q.difficulty,
      companies: q.companies || [],
    });
    
    await refreshData();
    await addActivityLog({ action: "Question Added", description: `Added aptitude question to topic ${q.topic}`, user: "Admin", category: "question" });
  };

  const editAptitudeQ = async (id: number, updates: Partial<AptitudeQuestion>) => {
    const updatesMapped: any = {};
    if (updates.question !== undefined) updatesMapped.question = updates.question;
    if (updates.options !== undefined) {
      updatesMapped.option_a = updates.options[0];
      updatesMapped.option_b = updates.options[1];
      updatesMapped.option_c = updates.options[2];
      updatesMapped.option_d = updates.options[3];
    }
    if (updates.correctAnswer !== undefined) {
      updatesMapped.correct_answer = updates.correctAnswer === 0 ? "A" : updates.correctAnswer === 1 ? "B" : updates.correctAnswer === 2 ? "C" : "D";
    }
    if (updates.explanation !== undefined) updatesMapped.explanation = updates.explanation;
    if (updates.difficulty !== undefined) updatesMapped.difficulty = updates.difficulty;
    if (updates.companies !== undefined) updatesMapped.companies = updates.companies;

    await (supabase as any).from("aptitude_questions").update(updatesMapped).eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Question Edited", description: `Edited aptitude question ${id}`, user: "Admin", category: "question" });
  };

  const deleteAptitudeQ = async (id: number) => {
    await (supabase as any).from("aptitude_questions").delete().eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Question Deleted", description: `Deleted aptitude question ${id}`, user: "Admin", category: "question" });
  };

  // Coding Questions
  const addCodingQ = async (q: Omit<CodingProblem, "acceptanceRate" | "status">) => {
    const slug = q.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await (supabase as any).from("coding_questions").insert({
      title: q.title,
      slug,
      description: q.description || "",
      difficulty: q.difficulty,
      constraints: q.constraints || [],
      starter_code: q.boilerplates || {},
      optimal_solutions: q.optimalSolutions || {},
      examples: q.examples || [],
      topic: q.topic || "General",
      acceptance_rate: "50.0%",
    });

    await refreshData();
    await addActivityLog({ action: "Coding Problem Added", description: `Added coding challenge: ${q.title}`, user: "Admin", category: "question" });
  };

  const editCodingQ = async (id: string, updates: Partial<CodingProblem>) => {
    const updatesMapped: any = {};
    if (updates.title !== undefined) updatesMapped.title = updates.title;
    if (updates.difficulty !== undefined) updatesMapped.difficulty = updates.difficulty;
    if (updates.topic !== undefined) updatesMapped.topic = updates.topic;
    if (updates.description !== undefined) updatesMapped.description = updates.description;
    if (updates.constraints !== undefined) updatesMapped.constraints = updates.constraints;

    await (supabase as any).from("coding_questions").update(updatesMapped).eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Coding Problem Edited", description: `Edited coding challenge ${id}`, user: "Admin", category: "question" });
  };

  const deleteCodingQ = async (id: string) => {
    await (supabase as any).from("coding_questions").delete().eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Coding Problem Deleted", description: `Deleted coding challenge ${id}`, user: "Admin", category: "question" });
  };

  // Technical Questions
  const addTechnicalQ = async (q: Omit<TechnicalQuestion, "id">) => {
    await (supabase as any).from("interview_questions").insert({
      mode: "technical",
      question: q.question,
      expected_answer: q.answer,
      difficulty: q.difficulty.toLowerCase() as any,
      topic: q.subject,
    });

    await refreshData();
    await addActivityLog({ action: "Question Added", description: `Added technical question on ${q.subject}`, user: "Admin", category: "question" });
  };

  const editTechnicalQ = async (id: number, updates: Partial<TechnicalQuestion>) => {
    const updatesMapped: any = {};
    if (updates.question !== undefined) updatesMapped.question = updates.question;
    if (updates.answer !== undefined) updatesMapped.expected_answer = updates.answer;
    if (updates.difficulty !== undefined) updatesMapped.difficulty = updates.difficulty.toLowerCase();
    if (updates.subject !== undefined) updatesMapped.topic = updates.subject;

    await (supabase as any).from("interview_questions").update(updatesMapped).eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Question Edited", description: `Edited technical question ${id}`, user: "Admin", category: "question" });
  };

  const deleteTechnicalQ = async (id: number) => {
    await (supabase as any).from("interview_questions").delete().eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Question Deleted", description: `Deleted technical question ${id}`, user: "Admin", category: "question" });
  };

  // HR Questions
  const addHRQ = async (q: Omit<HRQuestion, "id">) => {
    await (supabase as any).from("interview_questions").insert({
      mode: "hr",
      question: q.question,
      expected_answer: q.tip,
      difficulty: "medium",
      topic: q.category || "Introduction",
    });

    await refreshData();
    await addActivityLog({ action: "Question Added", description: `Added HR interview question`, user: "Admin", category: "question" });
  };

  const editHRQ = async (id: any, updates: Partial<HRQuestion>) => {
    const updatesMapped: any = {};
    if (updates.question !== undefined) updatesMapped.question = updates.question;
    if (updates.tip !== undefined) updatesMapped.expected_answer = updates.tip;
    if (updates.category !== undefined) updatesMapped.topic = updates.category;

    await (supabase as any).from("interview_questions").update(updatesMapped).eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Question Edited", description: `Edited HR question ${id}`, user: "Admin", category: "question" });
  };

  const deleteHRQ = async (id: number) => {
    await (supabase as any).from("interview_questions").delete().eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Question Deleted", description: `Deleted HR question ${id}`, user: "Admin", category: "question" });
  };

  // Companies
  const addCompany = async (c: Omit<Company, "progress" | "readinessScore">) => {
    await (supabase as any).from("companies").insert({
      name: c.name,
      slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      difficulty: c.difficulty,
    });
    await refreshData();
    await addActivityLog({ action: "Company Added", description: `Added company profile for ${c.name}`, user: "Admin", category: "company" });
  };

  const editCompany = async (id: string, updates: Partial<Company>) => {
    const { data: targetComp } = await (supabase as any).from("companies").select("id").eq("slug", id).maybeSingle();
    const targetId = targetComp?.id || id;
    
    const updatesMapped: any = {};
    if (updates.name !== undefined) updatesMapped.name = updates.name;
    if (updates.difficulty !== undefined) updatesMapped.difficulty = updates.difficulty;

    await (supabase as any).from("companies").update(updatesMapped).eq("id", targetId);
    await refreshData();
    await addActivityLog({ action: "Company Edited", description: `Edited company profile ${id}`, user: "Admin", category: "company" });
  };

  const deleteCompany = async (id: string) => {
    const { data: targetComp } = await (supabase as any).from("companies").select("id").eq("slug", id).maybeSingle();
    const targetId = targetComp?.id || id;

    await (supabase as any).from("companies").delete().eq("id", targetId);
    await refreshData();
    await addActivityLog({ action: "Company Deleted", description: `Deleted company profile ${id}`, user: "Admin", category: "company" });
  };

  // Mock Tests
  const addMockTest = async (t: Omit<MockTest, "id">) => {
    await (supabase as any).from("aptitude_tests").insert({
      title: t.title,
      duration_minutes: t.duration,
      difficulty: t.difficulty,
      type: t.type || "Aptitude",
      target_company: t.targetCompany || null,
    });
    await refreshData();
    await addActivityLog({ action: "Mock Test Added", description: `Created mock assessment ${t.title}`, user: "Admin", category: "settings" });
  };

  const editMockTest = async (id: string, updates: Partial<MockTest>) => {
    const updatesMapped: any = {};
    if (updates.title !== undefined) updatesMapped.title = updates.title;
    if (updates.duration !== undefined) updatesMapped.duration_minutes = updates.duration;
    if (updates.difficulty !== undefined) updatesMapped.difficulty = updates.difficulty;
    if (updates.type !== undefined) updatesMapped.type = updates.type;
    if (updates.targetCompany !== undefined) updatesMapped.target_company = updates.targetCompany;

    await (supabase as any).from("aptitude_tests").update(updatesMapped).eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Mock Test Edited", description: `Edited mock test ${id}`, user: "Admin", category: "settings" });
  };

  const deleteMockTest = async (id: string) => {
    await (supabase as any).from("aptitude_tests").delete().eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Mock Test Deleted", description: `Deleted mock test ${id}`, user: "Admin", category: "settings" });
  };

  // Content Items
  const addContentItem = async (item: Omit<ContentItem, "id" | "lastUpdated">) => {
    await (supabase as any).from("content_library").insert({
      title: item.title,
      category: item.category,
      author: item.author,
      read_time: item.readTime,
      status: item.status,
      content: item.content || "",
    });
    await refreshData();
    await addActivityLog({ action: "Content Created", description: `Published content resource: ${item.title}`, user: "Admin", category: "announcement" });
  };

  const editContentItem = async (id: string, updates: Partial<ContentItem>) => {
    const updatesMapped: any = {};
    if (updates.title !== undefined) updatesMapped.title = updates.title;
    if (updates.category !== undefined) updatesMapped.category = updates.category;
    if (updates.author !== undefined) updatesMapped.author = updates.author;
    if (updates.readTime !== undefined) updatesMapped.read_time = updates.readTime;
    if (updates.status !== undefined) updatesMapped.status = updates.status;
    if (updates.content !== undefined) updatesMapped.content = updates.content;
    updatesMapped.last_updated = new Date().toISOString().split("T")[0];

    await (supabase as any).from("content_library").update(updatesMapped).eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Content Edited", description: `Updated content resource ${id}`, user: "Admin", category: "announcement" });
  };

  const deleteContentItem = async (id: string) => {
    await (supabase as any).from("content_library").delete().eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Content Deleted", description: `Deleted content resource ${id}`, user: "Admin", category: "announcement" });
  };

  // Role Permissions
  const updateRolePermissions = async (
    role: "Admin" | "Content Manager" | "Student",
    updates: Partial<RolePermission>
  ) => {
    const updated = rolePermissions.map((rp) => (rp.role === role ? { ...rp, ...updates } : rp));
    setRolePermissions(updated);
    await addActivityLog({ action: "Permissions Changed", description: `Modified permissions for role ${role}`, user: "Admin", category: "settings" });
  };

  // Settings
  const updateSettings = async (updates: Partial<PlatformSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (updates.siteName) {
        await (supabase as any).from("platform_settings").upsert({ setting_key: "site_name", setting_value: updates.siteName, updated_by: userId }, { onConflict: "setting_key" });
      }
      if (updates.tagline) {
        await (supabase as any).from("platform_settings").upsert({ setting_key: "tagline", setting_value: updates.tagline, updated_by: userId }, { onConflict: "setting_key" });
      }
      if (updates.maintenanceMode !== undefined) {
        await (supabase as any).from("platform_settings").upsert({ setting_key: "maintenance_mode", setting_value: updates.maintenanceMode, updated_by: userId }, { onConflict: "setting_key" });
      }
      if (updates.allowRegistrations !== undefined) {
        await (supabase as any).from("platform_settings").upsert({ setting_key: "allow_registrations", setting_value: updates.allowRegistrations, updated_by: userId }, { onConflict: "setting_key" });
      }
      if (updates.branding?.primaryColor) {
        await (supabase as any).from("platform_settings").upsert({ setting_key: "theme_default", setting_value: updates.branding.primaryColor, updated_by: userId }, { onConflict: "setting_key" });
      }

      await refreshData();
      await addActivityLog({ action: "Settings Saved", description: `Updated platform configurations`, user: "Admin", category: "settings" });
    } catch (err) {
      console.error(err);
    }
  };

  // Activity Log
  const addActivityLog = async (log: Omit<ActivityLog, "id" | "timestamp">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any).from("admin_logs").insert({
          admin_id: user.id,
          action: log.action,
          entity_type: log.category || "system",
          metadata: { description: log.description },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Roadmaps
  const addRoadmap = async (r: Omit<Roadmap, "id">) => {
    const { data: comp } = await (supabase as any).from("companies").select("id").ilike("name", r.company).maybeSingle();
    if (comp) {
      await (supabase as any).from("company_roadmaps").insert({
        company_id: comp.id,
        week_number: r.week,
        topics: r.topics,
        coding_tasks: r.codingTasks,
        aptitude_tasks: r.aptitudeTasks,
        interview_tasks: r.interviewTasks,
      });
      await refreshData();
      await addActivityLog({ action: "Roadmap Created", description: `Created preparation roadmap week ${r.week} for ${r.company}`, user: "Admin", category: "roadmap" });
    }
  };

  const editRoadmap = async (id: string, updates: Partial<Roadmap>) => {
    const updatesMapped: any = {};
    if (updates.week !== undefined) updatesMapped.week_number = updates.week;
    if (updates.topics !== undefined) updatesMapped.topics = updates.topics;
    if (updates.codingTasks !== undefined) updatesMapped.coding_tasks = updates.codingTasks;
    if (updates.aptitudeTasks !== undefined) updatesMapped.aptitude_tasks = updates.aptitudeTasks;
    if (updates.interviewTasks !== undefined) updatesMapped.interview_tasks = updates.interviewTasks;

    await (supabase as any).from("company_roadmaps").update(updatesMapped).eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Roadmap Edited", description: `Edited preparation roadmap week ${id}`, user: "Admin", category: "roadmap" });
  };

  const deleteRoadmap = async (id: string) => {
    await (supabase as any).from("company_roadmaps").delete().eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Roadmap Deleted", description: `Deleted roadmap node ${id}`, user: "Admin", category: "roadmap" });
  };

  // Announcements
  const addAnnouncement = async (a: Omit<Announcement, "id" | "createdAt">) => {
    await (supabase as any).from("announcements").insert({
      title: a.title,
      message: a.message,
      target_audience: a.targetAudience,
      start_date: a.startDate,
      end_date: a.endDate,
      status: a.status,
    });
    await refreshData();
    await addActivityLog({ action: "Announcement Added", description: `Created site-wide announcement: ${a.title}`, user: "Admin", category: "announcement" });
  };

  const editAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    const updatesMapped: any = {};
    if (updates.title !== undefined) updatesMapped.title = updates.title;
    if (updates.message !== undefined) updatesMapped.message = updates.message;
    if (updates.targetAudience !== undefined) updatesMapped.target_audience = updates.targetAudience;
    if (updates.startDate !== undefined) updatesMapped.start_date = updates.startDate;
    if (updates.endDate !== undefined) updatesMapped.end_date = updates.endDate;
    if (updates.status !== undefined) updatesMapped.status = updates.status;

    await (supabase as any).from("announcements").update(updatesMapped).eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Announcement Edited", description: `Edited announcement ${id}`, user: "Admin", category: "announcement" });
  };

  const deleteAnnouncement = async (id: string) => {
    await (supabase as any).from("announcements").delete().eq("id", id);
    await refreshData();
    await addActivityLog({ action: "Announcement Deleted", description: `Deleted announcement ${id}`, user: "Admin", category: "announcement" });
  };

  return (
    <AdminContext.Provider
      value={{
        users,
        aptitudeQs,
        codingQs,
        technicalQs,
        hrQs,
        companies,
        mockTests,
        contentItems,
        rolePermissions,
        settings,
        roadmaps,
        announcements,
        activityLogs,
        isLoading,
        
        refreshData,
        addUser,
        updateUser,
        deleteUser,
        
        addAptitudeQ,
        editAptitudeQ,
        deleteAptitudeQ,
        
        addCodingQ,
        editCodingQ,
        deleteCodingQ,
        
        addTechnicalQ,
        editTechnicalQ,
        deleteTechnicalQ,
        
        addHRQ,
        editHRQ,
        deleteHRQ,
        
        addCompany,
        editCompany,
        deleteCompany,
        
        addMockTest,
        editMockTest,
        deleteMockTest,
        
        addContentItem,
        editContentItem,
        deleteContentItem,
        
        updateRolePermissions,
        updateSettings,
        
        addActivityLog,
        addRoadmap,
        editRoadmap,
        deleteRoadmap,
        addAnnouncement,
        editAnnouncement,
        deleteAnnouncement,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
