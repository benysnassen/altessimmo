'use server';

import { getSupabaseServerClient } from './supabaseServer';

export async function deleteBien(id: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  const { error } = await supabase.from('biens').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleFavori(id: string, favori: boolean) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  const { error } = await supabase.from('biens').update({ favori }).eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}
