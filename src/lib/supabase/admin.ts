import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  "https://iwpsckraxqrnkcfwdmgf.supabase.co"
)
  .trim()
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/+$/, "");

// Server-side service role key must NEVER use NEXT_PUBLIC_ prefix
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseServiceRoleKey && typeof window === "undefined") {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY is missing from environment variables. " +
    "Administrative actions will fallback to anon key and may fail RLS policies."
  );
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "placeholder-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
