// Supabase Client Configuration for FINORA
import { createClient } from "@supabase/supabase-js";

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

export const supabaseUrl = cleanUrl(envUrl || localUrl || "");
export const supabaseAnonKey = (envAnonKey || localAnonKey || "").trim();

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project-id")
  );
};

// Create client or null dummy client if not configured yet
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
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
