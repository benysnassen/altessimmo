'use server';

import { getSupabaseServerClient } from './supabaseServer';

export async function deleteBien(id: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from('biens').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleFavori(id: string, favori: boolean) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from('biens').update({ favori }).eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}
