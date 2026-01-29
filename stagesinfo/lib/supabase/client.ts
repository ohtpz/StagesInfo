import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Singleton instance
let clientInstance: SupabaseClient | null = null;

export const createClient = () => {
  // Return cached instance if it exists
  if (clientInstance) {
    return clientInstance;
  }

  // Create new instance only if it doesn't exist
  clientInstance = createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

  return clientInstance;
};
