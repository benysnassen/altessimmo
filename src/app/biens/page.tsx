import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import PropertyGrid from '@/components/biens/PropertyGrid';
import type { Bien } from '@/types/bien';

export default async function BiensPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: biens } = await supabase.from('biens').select('*').order('score', { ascending: false });

  return (
    <main className="min-h-screen bg-sand px-4 py-8 sm:px-8">
      <PropertyGrid initialBiens={(biens ?? []) as Bien[]} />
    </main>
  );
}
