import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Reject placeholder or malformed URLs so the client never calls a bad host (ERR_NAME_NOT_RESOLVED). */
function isValidSupabaseUrl(candidate: string): boolean {
  if (!candidate || candidate.includes('your-project')) return false;
  try {
    const u = new URL(candidate);
    if (u.protocol !== 'https:') return false;
    // Default hosted projects: https://<ref>.supabase.co
    return /^[a-z0-9-]+\.supabase\.co$/i.test(u.hostname);
  } catch {
    return false;
  }
}

const urlOk = url && isValidSupabaseUrl(url);
const keyOk = anonKey && anonKey.length > 20 && !anonKey.includes('your-anon-key');

export const supabase: SupabaseClient | null =
  urlOk && keyOk ? createClient(url!, anonKey!) : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

const FINGERPRINT_KEY = 'blog-fingerprint';

export function getOrCreateFingerprint(): string {
  if (typeof window === 'undefined') return '';
  try {
    let fp = localStorage.getItem(FINGERPRINT_KEY);
    if (!fp) {
      fp = crypto.randomUUID();
      localStorage.setItem(FINGERPRINT_KEY, fp);
    }
    return fp;
  } catch {
    return '';
  }
}
