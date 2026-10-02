import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://iwpsckraxqrnkcfwdmgf.supabase.co";

// Sanitize URL to strip trailing slashes and /rest/v1/ suffix if configured incorrectly
supabaseUrl = supabaseUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-anon-key";

// Ensure that we warn if environment variables are missing, but don't break static build step
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
  if (typeof window !== "undefined") {
    console.warn("Supabase credentials missing from environment variables. Next.js server may need to be restarted.");
  }
}

// Client-side and standard server instance uses anon key to respect Row Level Security (RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
  },
});

/**
 * Standard client factory for server routes to support RLS and service role actions.
 */
export function getSupabaseServerClient(authHeader?: string | null) {
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "").trim();
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  // Admin client fallback for authorized server tasks
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

