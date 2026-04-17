import PropertyGrid from '@/components/biens/PropertyGrid';
import type { Bien } from '@/types/bien';
import { getSupabaseServerClient } from './supabaseServer';

export default async function BiensPage() {
  const supabase = await getSupabaseServerClient();
  const { data: biens } = await supabase.from('biens').select('*').order('score', { ascending: false });

  return (
    <main className="min-h-screen bg-sand px-4 py-8 sm:px-8">
      <PropertyGrid initialBiens={(biens ?? []) as Bien[]} />
    </main>
  );
}
