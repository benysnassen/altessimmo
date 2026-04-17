import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Bien } from '@/types/bien';
import StatusBadge from '@/components/biens/StatusBadge';
import TypeBadge from '@/components/biens/TypeBadge';
import ScoreBar from '@/components/biens/ScoreBar';

export default async function BienDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('biens').select('*').eq('id', id).single();

  if (!data) notFound();
  const bien = data as Bien;

  return (
    <main className="min-h-screen bg-sand px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <Link href="/biens" className="inline-flex rounded-xl border border-cream-border bg-cream px-3 py-2 text-xs text-sand-dark">
          Retour à mes biens
        </Link>

        <article className="rounded-2xl border border-cream-border bg-cream">
          <div className="flex h-52 items-center justify-center rounded-t-2xl bg-gradient-to-br from-sage-light to-sage-mid">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-12 w-12 text-sand-dark/70">
              <path d="M3 10.5L12 3l9 7.5M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" />
            </svg>
          </div>
          <div className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={bien.type} />
              <StatusBadge statut={bien.statut} />
              <span className="rounded-full bg-sand px-2.5 py-1 text-[10px] text-sand-dark">{bien.etat}</span>
            </div>
            <h1 className="text-xl font-semibold text-sand-dark">{bien.adresse}</h1>
            <p className="text-sm text-sand-dark/80">{bien.quartier}</p>
            <p className="text-base font-bold text-sand-dark">{new Intl.NumberFormat('fr-MA').format(bien.prix)} MAD</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cream-border bg-sand px-2.5 py-1 text-xs text-sand-dark">{bien.surface} m²</span>
              <span className="rounded-full border border-cream-border bg-sand px-2.5 py-1 text-xs text-sand-dark">{bien.chambres} chambres</span>
              {bien.etage ? (
                <span className="rounded-full border border-cream-border bg-sand px-2.5 py-1 text-xs text-sand-dark">Étage {bien.etage}</span>
              ) : null}
            </div>
            <ScoreBar score={bien.score} />
          </div>
        </article>
      </div>
    </main>
  );
}
