import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("⚠️  Missing NEXT_PUBLIC_SUPABASE_URL - using placeholder. Add your Supabase keys to .env.local");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("⚠️  Missing NEXT_PUBLIC_SUPABASE_ANON_KEY - using placeholder. Add your Supabase keys to .env.local");
}

// Client-side Supabase client with RLS
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Server-side service role client (bypasses RLS, use with caution)
let serviceClientInstance: SupabaseClient<Database> | null = null;

export const getServiceClient = (): SupabaseClient<Database> => {
  if (serviceClientInstance) {
    return serviceClientInstance;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY || "placeholder-service-key";

  if (!process.env.SUPABASE_SERVICE_KEY) {
    console.warn("⚠️  Missing SUPABASE_SERVICE_KEY - using placeholder. Database operations will fail.");
  }

  serviceClientInstance = createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceClientInstance;
};

// Legacy export for backward compatibility (will be removed)
export const supabaseClient = supabase;
