import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    // Return only scheme + host (no path, no trailing slash)
    return `${url.protocol}//${url.host}`;
  } catch {
    // Not a valid URL — strip trailing slashes and return as-is
    return trimmed.replace(/\/+$/, '');
  }
}

const supabaseUrl = normalizeSupabaseUrl((import.meta.env.VITE_SUPABASE_URL as string) || '');
const supabaseAnonKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
