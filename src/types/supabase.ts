export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      ai_generation_logs: {
        Row: {
          admin_id: string
          created_at: string | null
          generated_content: Json | null
          generation_count: number | null
          generation_params: Json | null
          generation_prompt: string | null
          generation_status: string
          id: string
          module_type: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          generated_content?: Json | null
          generation_count?: number | null
          generation_params?: Json | null
          generation_prompt?: string | null
          generation_status?: string
          id?: string
          module_type: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          generated_content?: Json | null
          generation_count?: number | null
          generation_params?: Json | null
          generation_prompt?: string | null
          generation_status?: string
          id?: string
          module_type?: string
        }
        Relationships: []
      }
      ai_recommendations: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string | null
          id: string
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority: string
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_cache: {
        Row: {
          analysis_json: Json
          created_at: string | null
          id: string
          text_hash: string
        }
        Insert: {
          analysis_json: Json
          created_at?: string | null
          id?: string
          text_hash: string
        }
        Update: {
          analysis_json?: Json
          created_at?: string | null
          id?: string
          text_hash?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          listing_type: string
          resume_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          listing_type: string
          resume_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          listing_type?: string
          resume_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aptitude_attempts: {
        Row: {
          attempted_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          selected_answer: string
          time_taken: number
          user_id: string
        }
        Insert: {
          attempted_at?: string | null
          id?: string
          is_correct: boolean
          question_id: string
          selected_answer: string
          time_taken: number
          user_id: string
        }
        Update: {
          attempted_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_answer?: string
          time_taken?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "aptitude_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aptitude_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aptitude_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "aptitude_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aptitude_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aptitude_question_bank: {
        Row: {
          companies: string[] | null
          correct_answer: string
          created_at: string | null
          difficulty: string
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          subtopic: string | null
          topic: string
        }
        Insert: {
          companies?: string[] | null
          correct_answer: string
          created_at?: string | null
          difficulty: string
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          subtopic?: string | null
          topic: string
        }
        Update: {
          companies?: string[] | null
          correct_answer?: string
          created_at?: string | null
          difficulty?: string
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          subtopic?: string | null
          topic?: string
        }
        Relationships: []
      }
      aptitude_questions: {
        Row: {
          companies: string[] | null
          correct_answer: string
          created_at: string | null
          difficulty: string
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          topic_id: string | null
        }
        Insert: {
          companies?: string[] | null
          correct_answer: string
          created_at?: string | null
          difficulty: string
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          topic_id?: string | null
        }
        Update: {
          companies?: string[] | null
          correct_answer?: string
          created_at?: string | null
          difficulty?: string
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "aptitude_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      aptitude_tests: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string
          duration_minutes: number
          id: string
          target_company: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: string
          duration_minutes: number
          id?: string
          target_company?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          id?: string
          target_company?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      aptitude_topics: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          xp_required: number
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          xp_required?: number
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          xp_required?: number
        }
        Relationships: []
      }
      campus_drive_registrations: {
        Row: {
          created_at: string | null
          drive_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          drive_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          drive_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_drive_registrations_drive_id_fkey"
            columns: ["drive_id"]
            isOneToOne: false
            referencedRelation: "campus_drives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_drive_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_drives: {
        Row: {
          college_name: string
          company_name: string
          created_at: string | null
          drive_date: string
          eligibility: string
          id: string
          recruiter_id: string
          roles: string
        }
        Insert: {
          college_name: string
          company_name: string
          created_at?: string | null
          drive_date: string
          eligibility: string
          id?: string
          recruiter_id: string
          roles: string
        }
        Update: {
          college_name?: string
          company_name?: string
          created_at?: string | null
          drive_date?: string
          eligibility?: string
          id?: string
          recruiter_id?: string
          roles?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_drives_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coding_bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "coding_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_contests: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          id: string
          is_rated: boolean | null
          max_participants: number | null
          rules: string | null
          slug: string
          start_time: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_rated?: boolean | null
          max_participants?: number | null
          rules?: string | null
          slug: string
          start_time: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_rated?: boolean | null
          max_participants?: number | null
          rules?: string | null
          slug?: string
          start_time?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coding_contests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_daily_challenges: {
        Row: {
          bonus_xp: number | null
          challenge_date: string
          created_at: string | null
          id: string
          problem_id: string
          xp_reward: number | null
        }
        Insert: {
          bonus_xp?: number | null
          challenge_date: string
          created_at?: string | null
          id?: string
          problem_id: string
          xp_reward?: number | null
        }
        Update: {
          bonus_xp?: number | null
          challenge_date?: string
          created_at?: string | null
          id?: string
          problem_id?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coding_daily_challenges_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "coding_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_daily_completions: {
        Row: {
          completed_at: string | null
          daily_challenge_id: string
          id: string
          submission_id: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed_at?: string | null
          daily_challenge_id: string
          id?: string
          submission_id?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed_at?: string | null
          daily_challenge_id?: string
          id?: string
          submission_id?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coding_daily_completions_daily_challenge_id_fkey"
            columns: ["daily_challenge_id"]
            isOneToOne: false
            referencedRelation: "coding_daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_daily_completions_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "coding_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_daily_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_drafts: {
        Row: {
          code: string
          id: string
          language: string
          question_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          id?: string
          language: string
          question_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          id?: string
          language?: string
          question_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coding_drafts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "coding_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_problem_bank: {
        Row: {
          acceptance_rate: string | null
          approved_by: string | null
          companies: string[] | null
          complexity: Json | null
          constraints: string[] | null
          created_at: string | null
          created_by: string | null
          description: string
          difficulty: string
          editorial: Json | null
          examples: Json | null
          explanation: string | null
          hidden_testcases: Json | null
          id: string
          is_ai_generated: boolean | null
          optimal_solutions: Json | null
          sample_input: string | null
          sample_output: string | null
          slug: string
          starter_code: Json | null
          status: string | null
          test_cases: Json | null
          title: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          acceptance_rate?: string | null
          approved_by?: string | null
          companies?: string[] | null
          complexity?: Json | null
          constraints?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description: string
          difficulty: string
          editorial?: Json | null
          examples?: Json | null
          explanation?: string | null
          hidden_testcases?: Json | null
          id?: string
          is_ai_generated?: boolean | null
          optimal_solutions?: Json | null
          sample_input?: string | null
          sample_output?: string | null
          slug: string
          starter_code?: Json | null
          status?: string | null
          test_cases?: Json | null
          title: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          acceptance_rate?: string | null
          approved_by?: string | null
          companies?: string[] | null
          complexity?: Json | null
          constraints?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          difficulty?: string
          editorial?: Json | null
          examples?: Json | null
          explanation?: string | null
          hidden_testcases?: Json | null
          id?: string
          is_ai_generated?: boolean | null
          optimal_solutions?: Json | null
          sample_input?: string | null
          sample_output?: string | null
          slug?: string
          starter_code?: Json | null
          status?: string | null
          test_cases?: Json | null
          title?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coding_problem_bank_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_problem_bank_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_problem_companies: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          problem_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          problem_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coding_problem_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_problem_companies_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "coding_problem_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_problem_topics: {
        Row: {
          created_at: string | null
          id: string
          problem_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          problem_id: string
          topic_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          problem_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coding_problem_topics_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "coding_problem_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_problem_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "coding_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_questions: {
        Row: {
          acceptance_rate: string | null
          companies: string[] | null
          complexity: Json | null
          constraints: string[] | null
          created_at: string | null
          description: string
          difficulty: string
          examples: Json | null
          explanation: string | null
          id: string
          optimal_solutions: Json | null
          sample_input: string | null
          sample_output: string | null
          slug: string | null
          starter_code: Json | null
          tags: string[] | null
          test_cases: Json | null
          title: string
          topic_id: string | null
        }
        Insert: {
          acceptance_rate?: string | null
          companies?: string[] | null
          complexity?: Json | null
          constraints?: string[] | null
          created_at?: string | null
          description: string
          difficulty: string
          examples?: Json | null
          explanation?: string | null
          id?: string
          optimal_solutions?: Json | null
          sample_input?: string | null
          sample_output?: string | null
          slug?: string | null
          starter_code?: Json | null
          tags?: string[] | null
          test_cases?: Json | null
          title: string
          topic_id?: string | null
        }
        Update: {
          acceptance_rate?: string | null
          companies?: string[] | null
          complexity?: Json | null
          constraints?: string[] | null
          created_at?: string | null
          description?: string
          difficulty?: string
          examples?: Json | null
          explanation?: string | null
          id?: string
          optimal_solutions?: Json | null
          sample_input?: string | null
          sample_output?: string | null
          slug?: string | null
          starter_code?: Json | null
          tags?: string[] | null
          test_cases?: Json | null
          title?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coding_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "coding_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_submissions: {
        Row: {
          code: string
          error_message: string | null
          execution_time: number | null
          id: string
          language: string
          memory_used: number | null
          question_id: string
          status: string
          submitted_at: string | null
          test_cases_passed: number | null
          total_test_cases: number | null
          user_id: string
        }
        Insert: {
          code: string
          error_message?: string | null
          execution_time?: number | null
          id?: string
          language: string
          memory_used?: number | null
          question_id: string
          status: string
          submitted_at?: string | null
          test_cases_passed?: number | null
          total_test_cases?: number | null
          user_id: string
        }
        Update: {
          code?: string
          error_message?: string | null
          execution_time?: number | null
          id?: string
          language?: string
          memory_used?: number | null
          question_id?: string
          status?: string
          submitted_at?: string | null
          test_cases_passed?: number | null
          total_test_cases?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coding_submissions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "coding_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_topics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          hiring_process: Json | null
          id: string
          industry: string | null
          logo: string | null
          logo_url: string | null
          name: string
          package_range: string | null
          prep_materials: Json | null
          slug: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          hiring_process?: Json | null
          id?: string
          industry?: string | null
          logo?: string | null
          logo_url?: string | null
          name: string
          package_range?: string | null
          prep_materials?: Json | null
          slug?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          hiring_process?: Json | null
          id?: string
          industry?: string | null
          logo?: string | null
          logo_url?: string | null
          name?: string
          package_range?: string | null
          prep_materials?: Json | null
          slug?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_matches: {
        Row: {
          company_keywords: Json | null
          company_name: string
          created_at: string | null
          expected_questions: Json | null
          id: string
          interview_pattern: Json | null
          match_score: number | null
          missing_skills: Json | null
          preparation_roadmap: Json | null
          recommended_projects: Json | null
          resume_id: string
          user_id: string
        }
        Insert: {
          company_keywords?: Json | null
          company_name: string
          created_at?: string | null
          expected_questions?: Json | null
          id?: string
          interview_pattern?: Json | null
          match_score?: number | null
          missing_skills?: Json | null
          preparation_roadmap?: Json | null
          recommended_projects?: Json | null
          resume_id: string
          user_id: string
        }
        Update: {
          company_keywords?: Json | null
          company_name?: string
          created_at?: string | null
          expected_questions?: Json | null
          id?: string
          interview_pattern?: Json | null
          match_score?: number | null
          missing_skills?: Json | null
          preparation_roadmap?: Json | null
          recommended_projects?: Json | null
          resume_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_matches_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_readiness: {
        Row: {
          company_id: string
          id: string
          readiness_score: number | null
          selection_probability: number | null
          updated_at: string | null
          user_id: string
          weak_areas: string[] | null
        }
        Insert: {
          company_id: string
          id?: string
          readiness_score?: number | null
          selection_probability?: number | null
          updated_at?: string | null
          user_id: string
          weak_areas?: string[] | null
        }
        Update: {
          company_id?: string
          id?: string
          readiness_score?: number | null
          selection_probability?: number | null
          updated_at?: string | null
          user_id?: string
          weak_areas?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "company_readiness_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_readiness_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_roadmaps: {
        Row: {
          aptitude_tasks: string[]
          coding_tasks: string[]
          company_id: string
          created_at: string | null
          id: string
          interview_tasks: string[]
          topics: string[]
          week_number: number
        }
        Insert: {
          aptitude_tasks?: string[]
          coding_tasks?: string[]
          company_id: string
          created_at?: string | null
          id?: string
          interview_tasks?: string[]
          topics?: string[]
          week_number: number
        }
        Update: {
          aptitude_tasks?: string[]
          coding_tasks?: string[]
          company_id?: string
          created_at?: string | null
          id?: string
          interview_tasks?: string[]
          topics?: string[]
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_roadmaps_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_topics: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          reference_id: string
          topic_type: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          reference_id: string
          topic_type: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          reference_id?: string
          topic_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_topics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_participants: {
        Row: {
          contest_id: string
          id: string
          last_submission_at: string | null
          problems_solved: number | null
          rank: number | null
          registered_at: string | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          contest_id: string
          id?: string
          last_submission_at?: string | null
          problems_solved?: number | null
          rank?: number | null
          registered_at?: string | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          contest_id?: string
          id?: string
          last_submission_at?: string | null
          problems_solved?: number | null
          rank?: number | null
          registered_at?: string | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_participants_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "coding_contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_problems: {
        Row: {
          contest_id: string
          created_at: string | null
          id: string
          order_index: number | null
          points: number | null
          problem_id: string
        }
        Insert: {
          contest_id: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          points?: number | null
          problem_id: string
        }
        Update: {
          contest_id?: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          points?: number | null
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_problems_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "coding_contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_problems_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "coding_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_submissions: {
        Row: {
          code: string
          contest_id: string
          created_at: string | null
          execution_time: number | null
          id: string
          language: string
          memory_used: number | null
          problem_id: string | null
          score: number | null
          status: string
          submission_id: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          code?: string
          contest_id: string
          created_at?: string | null
          execution_time?: number | null
          id?: string
          language?: string
          memory_used?: number | null
          problem_id?: string | null
          score?: number | null
          status?: string
          submission_id: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          contest_id?: string
          created_at?: string | null
          execution_time?: number | null
          id?: string
          language?: string
          memory_used?: number | null
          problem_id?: string | null
          score?: number | null
          status?: string
          submission_id?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_submissions_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "coding_contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "coding_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_submissions_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "coding_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenge_completions: {
        Row: {
          completed_at: string | null
          daily_challenge_id: string
          id: string
          submission_id: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed_at?: string | null
          daily_challenge_id: string
          id?: string
          submission_id?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed_at?: string | null
          daily_challenge_id?: string
          id?: string
          submission_id?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenge_completions_daily_challenge_id_fkey"
            columns: ["daily_challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_challenge_completions_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "coding_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          target: number
          title: string
          type: string
          xp_reward: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          target?: number
          title: string
          type: string
          xp_reward?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          target?: number
          title?: string
          type?: string
          xp_reward?: number
        }
        Relationships: []
      }
      internship_listings: {
        Row: {
          application_deadline: string
          company_name: string
          created_at: string | null
          description: string
          duration: string
          id: string
          location: string
          recruiter_id: string
          skills_required: string[]
          stipend: string
          title: string
        }
        Insert: {
          application_deadline: string
          company_name: string
          created_at?: string | null
          description?: string
          duration: string
          id?: string
          location?: string
          recruiter_id: string
          skills_required?: string[]
          stipend: string
          title: string
        }
        Update: {
          application_deadline?: string
          company_name?: string
          created_at?: string | null
          description?: string
          duration?: string
          id?: string
          location?: string
          recruiter_id?: string
          skills_required?: string[]
          stipend?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_listings_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_answers: {
        Row: {
          ai_feedback: string | null
          created_at: string | null
          id: string
          question_id: string
          score: number | null
          session_id: string
          user_answer: string
        }
        Insert: {
          ai_feedback?: string | null
          created_at?: string | null
          id?: string
          question_id: string
          score?: number | null
          session_id: string
          user_answer: string
        }
        Update: {
          ai_feedback?: string | null
          created_at?: string | null
          id?: string
          question_id?: string
          score?: number | null
          session_id?: string
          user_answer?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_question_bank: {
        Row: {
          category: string
          company: string | null
          created_at: string | null
          difficulty: string
          expected_answer: string | null
          id: string
          question: string
          topic: string | null
        }
        Insert: {
          category: string
          company?: string | null
          created_at?: string | null
          difficulty: string
          expected_answer?: string | null
          id?: string
          question: string
          topic?: string | null
        }
        Update: {
          category?: string
          company?: string | null
          created_at?: string | null
          difficulty?: string
          expected_answer?: string | null
          id?: string
          question?: string
          topic?: string | null
        }
        Relationships: []
      }
      interview_questions: {
        Row: {
          created_at: string | null
          difficulty: string
          expected_answer: string | null
          id: string
          mode: string
          question: string
          topic: string
        }
        Insert: {
          created_at?: string | null
          difficulty: string
          expected_answer?: string | null
          id?: string
          mode: string
          question: string
          topic: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string
          expected_answer?: string | null
          id?: string
          mode?: string
          question?: string
          topic?: string
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          communication_score: number | null
          company: string | null
          confidence_score: number | null
          created_at: string | null
          difficulty: string | null
          duration: number | null
          id: string
          mode: string
          role: string | null
          score: number | null
          technical_score: number | null
          user_id: string
        }
        Insert: {
          communication_score?: number | null
          company?: string | null
          confidence_score?: number | null
          created_at?: string | null
          difficulty?: string | null
          duration?: number | null
          id?: string
          mode: string
          role?: string | null
          score?: number | null
          technical_score?: number | null
          user_id: string
        }
        Update: {
          communication_score?: number | null
          company?: string | null
          confidence_score?: number | null
          created_at?: string | null
          difficulty?: string | null
          duration?: number | null
          id?: string
          mode?: string
          role?: string | null
          score?: number | null
          technical_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          application_deadline: string
          company_name: string
          created_at: string | null
          description: string
          employment_type: string
          id: string
          location: string
          package_range: string
          recruiter_id: string
          skills_required: string[]
          title: string
        }
        Insert: {
          application_deadline: string
          company_name: string
          created_at?: string | null
          description: string
          employment_type: string
          id?: string
          location: string
          package_range: string
          recruiter_id: string
          skills_required?: string[]
          title: string
        }
        Update: {
          application_deadline?: string
          company_name?: string
          created_at?: string | null
          description?: string
          employment_type?: string
          id?: string
          location?: string
          package_range?: string
          recruiter_id?: string
          skills_required?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["id"]
          },
        ]
      }
      job_matches: {
        Row: {
          company_difficulty: string | null
          created_at: string | null
          expected_salary: string | null
          hiring_probability: string | null
          id: string
          interview_questions: Json | null
          job_description: string
          match_score: number | null
          missing_keywords: Json | null
          missing_skills: Json | null
          recommended_courses: Json | null
          resume_id: string
          suggested_improvements: Json | null
          user_id: string
        }
        Insert: {
          company_difficulty?: string | null
          created_at?: string | null
          expected_salary?: string | null
          hiring_probability?: string | null
          id?: string
          interview_questions?: Json | null
          job_description: string
          match_score?: number | null
          missing_keywords?: Json | null
          missing_skills?: Json | null
          recommended_courses?: Json | null
          resume_id: string
          suggested_improvements?: Json | null
          user_id: string
        }
        Update: {
          company_difficulty?: string | null
          created_at?: string | null
          expected_salary?: string | null
          hiring_probability?: string | null
          id?: string
          interview_questions?: Json | null
          job_description?: string
          match_score?: number | null
          missing_keywords?: Json | null
          missing_skills?: Json | null
          recommended_courses?: Json | null
          resume_id?: string
          suggested_improvements?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_matches_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_placements: {
        Row: {
          company_id: string
          created_at: string | null
          final_score: number | null
          id: string
          result: string | null
          status: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          final_score?: number | null
          id?: string
          result?: string | null
          status: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          final_score?: number | null
          id?: string
          result?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_placements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mock_placements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_results: {
        Row: {
          aptitude_score: number | null
          coding_score: number | null
          created_at: string | null
          feedback: string | null
          final_score: number | null
          id: string
          interview_score: number | null
          mock_id: string
          selected: boolean | null
        }
        Insert: {
          aptitude_score?: number | null
          coding_score?: number | null
          created_at?: string | null
          feedback?: string | null
          final_score?: number | null
          id?: string
          interview_score?: number | null
          mock_id: string
          selected?: boolean | null
        }
        Update: {
          aptitude_score?: number | null
          coding_score?: number | null
          created_at?: string | null
          feedback?: string | null
          final_score?: number | null
          id?: string
          interview_score?: number | null
          mock_id?: string
          selected?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_results_mock_id_fkey"
            columns: ["mock_id"]
            isOneToOne: true
            referencedRelation: "mock_placements"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_round_attempts: {
        Row: {
          answer: string | null
          created_at: string | null
          id: string
          is_correct: boolean | null
          question_id: string
          round_id: string
          score: number | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id: string
          round_id: string
          score?: number | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
          round_id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_round_attempts_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "mock_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_rounds: {
        Row: {
          completed_at: string | null
          id: string
          mock_id: string
          round_type: string
          score: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          mock_id: string
          round_type: string
          score?: number | null
          started_at?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          mock_id?: string
          round_type?: string
          score?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_rounds_mock_id_fkey"
            columns: ["mock_id"]
            isOneToOne: false
            referencedRelation: "mock_placements"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_test_templates: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string
          duration_minutes: number
          id: string
          questions: Json | null
          test_type: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: string
          duration_minutes?: number
          id?: string
          questions?: Json | null
          test_type: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          id?: string
          questions?: Json | null
          test_type?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_read: boolean
          message: string
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          priority?: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_cache: {
        Row: {
          created_at: string | null
          extracted_text: string
          file_hash: string
          id: string
        }
        Insert: {
          created_at?: string | null
          extracted_text: string
          file_hash: string
          id?: string
        }
        Update: {
          created_at?: string | null
          extracted_text?: string
          file_hash?: string
          id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          target_company: string | null
          target_role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          target_company?: string | null
          target_role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          target_company?: string | null
          target_role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recommendation_logs: {
        Row: {
          created_at: string | null
          id: string
          recommendation_text: string
          recommendation_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recommendation_text: string
          recommendation_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recommendation_text?: string
          recommendation_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiters: {
        Row: {
          company_name: string
          created_at: string | null
          designation: string
          id: string
          user_id: string
          verified: boolean
        }
        Insert: {
          company_name: string
          created_at?: string | null
          designation: string
          id?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          company_name?: string
          created_at?: string | null
          designation?: string
          id?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "recruiters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_analysis: {
        Row: {
          action_plan: Json | null
          ats_score: number | null
          created_at: string | null
          id: string
          missing_keywords: Json | null
          overall_feedback: string | null
          resume_id: string
          rewritten_bullet_points: Json | null
          rewritten_summary: string | null
          section_scores: Json | null
          strengths: Json | null
          strong_sections: Json | null
          suggestions: Json | null
          weak_sections: Json | null
          weaknesses: Json | null
        }
        Insert: {
          action_plan?: Json | null
          ats_score?: number | null
          created_at?: string | null
          id?: string
          missing_keywords?: Json | null
          overall_feedback?: string | null
          resume_id: string
          rewritten_bullet_points?: Json | null
          rewritten_summary?: string | null
          section_scores?: Json | null
          strengths?: Json | null
          strong_sections?: Json | null
          suggestions?: Json | null
          weak_sections?: Json | null
          weaknesses?: Json | null
        }
        Update: {
          action_plan?: Json | null
          ats_score?: number | null
          created_at?: string | null
          id?: string
          missing_keywords?: Json | null
          overall_feedback?: string | null
          resume_id?: string
          rewritten_bullet_points?: Json | null
          rewritten_summary?: string | null
          section_scores?: Json | null
          strengths?: Json | null
          strong_sections?: Json | null
          suggestions?: Json | null
          weak_sections?: Json | null
          weaknesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_analysis_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_analysis_logs: {
        Row: {
          created_at: string | null
          id: string
          resume_id: string
          score: number
          section_scores: Json | null
          strengths: string
          strong_sections: Json | null
          suggestions: string
          user_id: string
          weak_sections: Json | null
          weaknesses: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          resume_id: string
          score: number
          section_scores?: Json | null
          strengths: string
          strong_sections?: Json | null
          suggestions: string
          user_id: string
          weak_sections?: Json | null
          weaknesses: string
        }
        Update: {
          created_at?: string | null
          id?: string
          resume_id?: string
          score?: number
          section_scores?: Json | null
          strengths?: string
          strong_sections?: Json | null
          suggestions?: string
          user_id?: string
          weak_sections?: Json | null
          weaknesses?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_analysis_logs_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_analysis_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_history: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          resume_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          resume_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          resume_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_history_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_keywords: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          keyword: string
          resume_id: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          keyword: string
          resume_id: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          keyword?: string
          resume_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_keywords_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_keywords_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          log_type: string | null
          message: string
          resume_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          log_type?: string | null
          message: string
          resume_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          log_type?: string | null
          message?: string
          resume_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_templates: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          name: string
          thumbnail_url: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          name: string
          thumbnail_url?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      resume_versions: {
        Row: {
          ats_score: number | null
          content: Json | null
          created_at: string | null
          feedback: Json | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          improved_content: string | null
          name: string | null
          parsed_content: string | null
          resume_id: string
          user_id: string
          version: number
        }
        Insert: {
          ats_score?: number | null
          content?: Json | null
          created_at?: string | null
          feedback?: Json | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          improved_content?: string | null
          name?: string | null
          parsed_content?: string | null
          resume_id: string
          user_id: string
          version: number
        }
        Update: {
          ats_score?: number | null
          content?: Json | null
          created_at?: string | null
          feedback?: Json | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          improved_content?: string | null
          name?: string | null
          parsed_content?: string | null
          resume_id?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "resume_versions_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_versions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          ats_score: number | null
          content: Json | null
          created_at: string | null
          feedback: Json | null
          file_hash: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          improved_content: string | null
          is_ai_generated: boolean | null
          name: string | null
          parsed_content: string | null
          score: number | null
          target_company: string | null
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          ats_score?: number | null
          content?: Json | null
          created_at?: string | null
          feedback?: Json | null
          file_hash?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          improved_content?: string | null
          is_ai_generated?: boolean | null
          name?: string | null
          parsed_content?: string | null
          score?: number | null
          target_company?: string | null
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          ats_score?: number | null
          content?: Json | null
          created_at?: string | null
          feedback?: Json | null
          file_hash?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          improved_content?: string | null
          is_ai_generated?: boolean | null
          name?: string | null
          parsed_content?: string | null
          score?: number | null
          target_company?: string | null
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          listing_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          listing_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          listing_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_gap_reports: {
        Row: {
          created_at: string | null
          id: string
          report: Json
          strongest_skill: string
          user_id: string
          weakest_skill: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          report?: Json
          strongest_skill: string
          user_id: string
          weakest_skill: string
        }
        Update: {
          created_at?: string | null
          id?: string
          report?: Json
          strongest_skill?: string
          user_id?: string
          weakest_skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_gap_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      speakwise_sessions: {
        Row: {
          created_at: string | null
          duration: number | null
          feedback: Json | null
          id: string
          recording_url: string | null
          score: number | null
          topic: string | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          feedback?: Json | null
          id?: string
          recording_url?: string | null
          score?: number | null
          topic?: string | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          feedback?: Json | null
          id?: string
          recording_url?: string | null
          score?: number | null
          topic?: string | null
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "speakwise_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          created_at: string | null
          daily_plan: Json | null
          id: string
          monthly_plan: Json | null
          target_company: string | null
          title: string
          user_id: string
          weak_areas: string[] | null
          weekly_plan: Json | null
        }
        Insert: {
          created_at?: string | null
          daily_plan?: Json | null
          id?: string
          monthly_plan?: Json | null
          target_company?: string | null
          title: string
          user_id: string
          weak_areas?: string[] | null
          weekly_plan?: Json | null
        }
        Update: {
          created_at?: string | null
          daily_plan?: Json | null
          id?: string
          monthly_plan?: Json | null
          target_company?: string | null
          title?: string
          user_id?: string
          weak_areas?: string[] | null
          weekly_plan?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "study_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          correct_answers: number
          id: string
          score: number
          test_id: string
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          correct_answers: number
          id?: string
          score: number
          test_id: string
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          correct_answers?: number
          id?: string
          score?: number
          test_id?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "aptitude_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          id: string
          question_id: string
          test_id: string
        }
        Insert: {
          id?: string
          question_id: string
          test_id: string
        }
        Update: {
          id?: string
          question_id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "aptitude_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "aptitude_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          action: string
          category: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          module: string | null
          user_id: string
        }
        Insert: {
          action: string
          category?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          module?: string | null
          user_id: string
        }
        Update: {
          action?: string
          category?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          module?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          aptitude_score: number
          coding_score: number
          consistency_score: number | null
          engagement_score: number | null
          id: string
          interview_score: number
          overall_readiness: number
          placement_readiness: number | null
          resume_score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aptitude_score?: number
          coding_score?: number
          consistency_score?: number | null
          engagement_score?: number | null
          id?: string
          interview_score?: number
          overall_readiness?: number
          placement_readiness?: number | null
          resume_score?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aptitude_score?: number
          coding_score?: number
          consistency_score?: number | null
          engagement_score?: number | null
          id?: string
          interview_score?: number
          overall_readiness?: number
          placement_readiness?: number | null
          resume_score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics_raw_metrics: {
        Row: {
          category: string
          id: string
          metric_name: string
          metric_value: number
          recorded_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          id?: string
          metric_name: string
          metric_value: number
          recorded_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          id?: string
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed: boolean
          created_at: string | null
          id: string
          progress: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          created_at?: string | null
          id?: string
          progress?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          created_at?: string | null
          id?: string
          progress?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_company_progress: {
        Row: {
          aptitude_progress: number | null
          coding_progress: number | null
          company_id: string
          completed_tasks: Json | null
          id: string
          interview_progress: number | null
          readiness_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aptitude_progress?: number | null
          coding_progress?: number | null
          company_id: string
          completed_tasks?: Json | null
          id?: string
          interview_progress?: number | null
          readiness_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aptitude_progress?: number | null
          coding_progress?: number | null
          company_id?: string
          completed_tasks?: Json | null
          id?: string
          interview_progress?: number | null
          readiness_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_company_progress_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_company_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          aptitude_streak: number
          coding_streak: number
          created_at: string | null
          id: string
          interview_streak: number
          last_active_date: string | null
          last_aptitude_date: string | null
          last_coding_date: string | null
          last_interview_date: string | null
          level: number
          rank_position: number | null
          streak_days: number
          updated_at: string | null
          user_id: string
          xp: number
        }
        Insert: {
          aptitude_streak?: number
          coding_streak?: number
          created_at?: string | null
          id?: string
          interview_streak?: number
          last_active_date?: string | null
          last_aptitude_date?: string | null
          last_coding_date?: string | null
          last_interview_date?: string | null
          level?: number
          rank_position?: number | null
          streak_days?: number
          updated_at?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          aptitude_streak?: number
          coding_streak?: number
          created_at?: string | null
          id?: string
          interview_streak?: number
          last_active_date?: string | null
          last_aptitude_date?: string | null
          last_coding_date?: string | null
          last_interview_date?: string | null
          level?: number
          rank_position?: number | null
          streak_days?: number
          updated_at?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interview_progress: {
        Row: {
          avg_score: number | null
          id: string
          improvement_notes: string | null
          updated_at: string | null
          user_id: string
          weak_areas: string[] | null
        }
        Insert: {
          avg_score?: number | null
          id?: string
          improvement_notes?: string | null
          updated_at?: string | null
          user_id: string
          weak_areas?: string[] | null
        }
        Update: {
          avg_score?: number | null
          id?: string
          improvement_notes?: string | null
          updated_at?: string | null
          user_id?: string
          weak_areas?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interview_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          email_notifications: boolean
          id: string
          notifications_enabled: boolean
          push_notifications: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          user_id: string
        }
        Insert: {
          email_notifications?: boolean
          id?: string
          notifications_enabled?: boolean
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          user_id: string
        }
        Update: {
          email_notifications?: boolean
          id?: string
          notifications_enabled?: boolean
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_history: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          reason: string | null
          reference_id: string | null
          source: string | null
          user_id: string
          xp: number
          xp_amount: number | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          reference_id?: string | null
          source?: string | null
          user_id: string
          xp: number
          xp_amount?: number | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          reference_id?: string | null
          source?: string | null
          user_id?: string
          xp?: number
          xp_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "xp_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
