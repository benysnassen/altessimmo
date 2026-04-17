'use server';

import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';

export async function deleteBien(id: string) {
  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.from('biens').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleFavori(id: string, favori: boolean) {
  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.from('biens').update({ favori }).eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}
