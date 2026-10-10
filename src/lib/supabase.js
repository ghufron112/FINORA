// Supabase Client Configuration for FINORA
import { createClient } from "@supabase/supabase-js";

// Default credentials for deployment fallback (Vercel)
const DEFAULT_SUPABASE_URL = "https://ecxeirvomtkhbdwgjjul.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjeGVpcnZvbXRraGJkd2dqanVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1OTcyMDksImV4cCI6MjEwNzE3MzIwOX0.AqAAm86JsSKZnLg7S1Kb_HjNyitLsaQXcDgdkhzX49U";

// Read from environment variables, with optional fallback from localStorage for interactive setup
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const localUrl = typeof window !== "undefined" ? localStorage.getItem("finora_supabase_url") : null;
const localAnonKey = typeof window !== "undefined" ? localStorage.getItem("finora_supabase_anon_key") : null;

const cleanUrl = (raw) => {
  if (!raw) return "";
  let u = raw.trim();
  u = u.replace(/\/rest\/v1\/?$/, "");
  u = u.replace(/\/+$/, "");
  return u;
};

export const supabaseUrl = cleanUrl(envUrl || localUrl || DEFAULT_SUPABASE_URL);
export const supabaseAnonKey = (envAnonKey || localAnonKey || DEFAULT_SUPABASE_ANON_KEY).trim();

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project-id")
  );
};

// Resilient fetch wrapper with exponential backoff for mobile WebKit & unstable cellular connections
const resilientFetch = async (url, options = {}) => {
  let attempts = 0;
  while (attempts < 3) {
    try {
      return await fetch(url, options);
    } catch (err) {
      attempts++;
      if (attempts >= 3) throw err;
      await new Promise((resolve) => setTimeout(resolve, 600 * attempts));
    }
  }
};

// Create client or null dummy client if not configured yet
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: resilientFetch,
      },
    })
  : createClient(
      "https://placeholder-finora.supabase.co",
      "placeholder-anon-key-finora",
      {
        auth: { persistSession: false },
      }
    );

// Helper to save credentials interactively from UI modal
export const updateSupabaseCredentials = (url, anonKey) => {
  if (url && anonKey) {
    localStorage.setItem("finora_supabase_url", url.trim());
    localStorage.setItem("finora_supabase_anon_key", anonKey.trim());
    window.location.reload();
  }
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem("finora_supabase_url");
  localStorage.removeItem("finora_supabase_anon_key");
  window.location.reload();
};
