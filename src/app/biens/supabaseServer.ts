import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

function getEnv(...names: string[]) {
  for (const name of names) {
    if (process.env[name]) return process.env[name];
  }
  return undefined;
}

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
  // Supabase nomme desormais cette cle « publishable » ; les projets plus
  // anciens l'appellent « anon ». On accepte les deux.
  const supabaseAnonKey = getEnv(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY'
  );

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

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
