import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

function getEnv(name: string, fallback?: string) {
  const value = process.env[name] || (fallback ? process.env[fallback] : undefined);
  if (!value) {
    throw new Error(`Missing environment variable: ${name}${fallback ? ` (or ${fallback})` : ''}`);
  }
  return value;
}

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
  const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });
}
