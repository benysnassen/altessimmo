'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Bien } from '@/types/bien';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';
import ScoreBar from './ScoreBar';

type PropertyCardProps = {
  bien: Bien;
  isDeleting?: boolean;
  onToggleFavori: (id: string, value: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (bien: Bien) => void;
};

const gradientByType: Record<Bien['type'], string> = {
  Appartement: 'from-sage-light to-sage-mid',
  Maison: 'from-lavender-light to-lavender-mid',
  Villa: 'from-peach-light to-peach-mid',
  Loft: 'from-rose-light to-rose-mid',
  Studio: 'from-sand to-sand-mid',
};

const stateStyles: Record<Bien['etat'], string> = {
  Neuf: 'bg-lavender-light text-lavender',
  Rénové: 'bg-sage-light text-sage',
  Ancien: 'bg-sand text-sand-dark',
  Luxe: 'bg-rose-light text-rose',
};

function PropertyIcon({ type }: { type: Bien['type'] }) {
  const icon = useMemo(() => {
    if (type === 'Villa') {
      return (
        <path d="M3 14l9-9 9 9M6 13v7h12v-7M9 20v-5h6v5M16 8V5h2v5" />
      );
    }
    return <path d="M3 10.5L12 3l9 7.5M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" />;
  }, [type]);

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-10 w-10 text-sand-dark/70">
      {icon}
    </svg>
  );
}

export default function PropertyCard({
  bien,
  isDeleting = false,
  onToggleFavori,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  const router = useRouter();

  const pricePerM2 = bien.surface > 0 ? Math.round(bien.prix / bien.surface) : 0;
  const metaValues = [
    `${bien.surface} m²`,
    `${bien.chambres} ch`,
    bien.caracteristiques?.includes('Jardin') ? 'Jardin' : bien.etage ? `Étage ${bien.etage}` : 'Rez',
  ];

  return (
    <article
      className={`rounded-2xl border border-cream-border bg-cream transition-colors duration-150 hover:border-sage-mid ${
        isDeleting ? 'opacity-0 pointer-events-none transition-opacity duration-200' : ''
      }`}
    >
      <div className={`relative flex h-36 items-center justify-center rounded-t-2xl bg-gradient-to-br ${gradientByType[bien.type]}`}>
        <button
          type="button"
          onClick={() => onToggleFavori(bien.id, !bien.favori)}
          aria-label="Basculer favori"
          className="absolute left-3 top-3 rounded-xl border border-cream-border bg-cream p-1.5 transition-colors duration-100 hover:bg-sand active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill={bien.favori ? '#D85A30' : 'none'} stroke={bien.favori ? '#D85A30' : 'currentColor'} strokeWidth="1.8" className="h-4 w-4 text-sand-dark">
            <path d="M12 20.5s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10.5c0 5.5-7 10-7 10Z" />
          </svg>
        </button>

        <PropertyIcon type={bien.type} />

        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <StatusBadge statut={bien.statut} />
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${stateStyles[bien.etat]}`}>{bien.etat}</span>
        </div>
      </div>

      <div className="p-3">
        <TypeBadge type={bien.type} />
        <h3 className="mt-2 text-sm font-semibold text-sand-dark">{bien.adresse}</h3>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-sand-dark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
            <path d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z" />
            <circle cx="12" cy="10" r="2.2" />
          </svg>
          {bien.quartier}
        </p>

        <p className="mt-2 text-base font-bold text-sand-dark">{new Intl.NumberFormat('fr-MA').format(bien.prix)} MAD</p>
        <p className="text-xs text-sand-mid">{new Intl.NumberFormat('fr-MA').format(pricePerM2)} MAD / m²</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {metaValues.map((meta) => (
            <span key={meta} className="rounded-full border border-cream-border bg-sand px-2.5 py-1 text-[10px] text-sand-dark">
              {meta}
            </span>
          ))}
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-cream-border p-3">
        <ScoreBar score={bien.score} />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => router.push(`/biens/${bien.id}`)}
            className="rounded-xl border border-cream-border p-2 text-sand-dark transition-all duration-100 hover:bg-sand active:scale-95"
            aria-label="Voir"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onEdit(bien.id)}
            className="rounded-xl border border-cream-border p-2 text-sand-dark transition-all duration-100 hover:bg-sand active:scale-95"
            aria-label="Éditer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="m4 20 4.5-1 9.2-9.2a1.7 1.7 0 0 0 0-2.4l-1.1-1.1a1.7 1.7 0 0 0-2.4 0L5 15.5 4 20Z" />
              <path d="m12.8 7.2 4 4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(bien)}
            className="rounded-xl border border-danger-mid p-2 text-danger transition-all duration-100 hover:bg-danger-light active:scale-95"
            aria-label="Supprimer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M4 7h16" />
              <path d="M9 7V5h6v2" />
              <path d="M7 7l1 12h8l1-12" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </footer>
    </article>
  );
}
