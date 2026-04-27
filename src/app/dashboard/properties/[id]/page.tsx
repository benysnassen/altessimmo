'use client';

import { formatPhoneDisplay } from '@/lib/formatPhoneDisplay';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Bath,
  Building2,
  Camera,
  Car,
  ChevronRight,
  Copy,
  Eye,
  Heart,
  MapPin,
  Phone,
  Ruler,
  Share2,
  Sparkles,
  User,
} from 'lucide-react';

type PropertyDetail = {
  id: string;
  title: string;
  propertyType: string;
  status: string;
  listingType: string;
  location: string;
  neighborhood?: string | null;
  address?: string | null;
  price: string;
  surface?: number | null;
  landSurface?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  garages?: number | null;
  floor?: number | null;
  yearBuilt?: number | null;
  description?: string | null;
  hasGarden: boolean;
  hasPool: boolean;
  hasSeaView: boolean;
  isFeatured: boolean;
  seller: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    status?: string;
  };
  images: Array<{ id: string; url: string; alt?: string | null; isPrimary: boolean }>;
  matches: Array<{
    id: string;
    score: number;
    reasons?: string | null;
    buyer: { name: string; phone: string; budget?: string | null; location?: string | null };
  }>;
};

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Appartement',
  VILLA: 'Villa',
  HOUSE: 'Maison',
  RIAD: 'Riad',
  LAND: 'Terrain',
  COMMERCIAL: 'Commerce',
  OFFICE: 'Bureau',
  PENTHOUSE: 'Penthouse',
  DUPLEX: 'Duplex',
  OTHER: 'Bien',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  AVAILABLE: 'Disponible',
  RESERVED: 'Réservé',
  SOLD: 'Vendu',
  ARCHIVED: 'Archivé',
};

const LISTING_LABELS: Record<string, string> = {
  SALE: 'Vente',
  RENT: 'Location',
};

/** Prix lisible type annonce (ex. 960 000 DH) */
const formatListingPrice = (value: string) => {
  const numeric = Number(value.replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return value.trim() || '—';
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(numeric))} DH`;
};

const formatCompactPrice = (value: string) => {
  const numeric = Number(value.replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return value;

  if (numeric >= 1_000_000) {
    const millions = numeric / 1_000_000;
    return `${millions.toFixed(2).replace(/\.?0+$/, '')}M`;
  }

  if (numeric >= 1_000) {
    const thousands = numeric / 1_000;
    return `${thousands.toFixed(0)}K`;
  }

  return `${Math.round(numeric)}`;
};

function PhotoBadge({ count }: { count: number }) {
  return (
    <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/65 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm">
      <Camera className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
      <span>{count}</span>
    </div>
  );
}

/** Indicateurs sous le prix : icône, libellé, valeur */
function HeaderStat({
  Icon,
  label,
  value,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-[4.25rem] flex-col items-center gap-0.5 px-1 text-center sm:min-w-[5rem]">
      <Icon className="mx-auto h-5 w-5 shrink-0 text-[var(--color-accent)]/85" strokeWidth={1.35} aria-hidden />
      <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-sand-dark)]/48">{label}</span>
      <span className="text-sm font-semibold tabular-nums leading-tight text-[var(--color-sand-dark)]">{value}</span>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyDone, setCopyDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const authResponse = await fetch('/api/auth/verify/');
        if (!authResponse.ok) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/properties/${params.id}/`);
        if (!response.ok) {
          router.push('/dashboard/properties');
          return;
        }
        const data = (await response.json()) as PropertyDetail;
        setProperty(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, router]);

  const copyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setCopyDone(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-light flex min-h-screen items-center justify-center bg-[var(--color-sand)] text-[var(--color-sand-dark)]/70">
        Chargement du détail du bien...
      </div>
    );
  }

  if (!property) return null;

  const images = property.images;
  const typeFr = TYPE_LABELS[property.propertyType] ?? property.propertyType;
  const statusFr = STATUS_LABELS[property.status] ?? property.status;
  const listingFr = LISTING_LABELS[property.listingType] ?? property.listingType;

  const locationLine = [property.location, property.neighborhood].filter(Boolean).join(' · ');

  const descTitle =
    `${typeFr} ${property.listingType === 'RENT' ? 'à louer' : 'à vendre'}${property.location ? ` — ${property.location}` : ''}${
      property.surface ? `. ${property.surface} m²` : ''
    }`.trim();

  /** Dernière vignette visible de la grille (index 0–3) qui affiche le badge “nb total de photos”. */
  const badgeIndex = images.length <= 1 ? -1 : Math.min(3, images.length - 1);

  return (
    <div className="admin-light min-h-screen bg-[var(--color-sand)] text-[var(--color-sand-dark)]">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-sand-dark)]/55 transition-colors hover:text-[var(--color-sand-dark)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste des biens
        </Link>

        <article className="overflow-hidden rounded-2xl border border-[var(--color-cream-border)] bg-[var(--color-cream)] shadow-sm">
          {/* Grille photos : hauteur plafonnée pour ne pas écraser la fiche */}
          <div className="p-3 md:p-4">
            {images.length === 0 ? (
              <div className="flex aspect-[21/9] max-h-[280px] min-h-[200px] items-center justify-center rounded-xl border border-dashed border-[var(--color-cream-border)] bg-[var(--color-sand)]/80 text-[var(--color-sand-dark)]/40">
                <Building2 className="h-10 w-10" aria-hidden />
              </div>
            ) : images.length === 1 ? (
              <div className="relative mx-auto max-h-[min(420px,52vh)] overflow-hidden rounded-xl bg-[var(--color-sand-mid)]/25">
                <img
                  src={images[0].url}
                  alt={images[0].alt || property.title}
                  className="max-h-[min(420px,52vh)] w-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="grid max-h-[min(440px,52vh)] grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-3">
                <div className="relative min-h-[180px] overflow-hidden rounded-xl bg-[var(--color-sand-mid)]/20 lg:min-h-0">
                  <img
                    src={images[0].url}
                    alt={images[0].alt || property.title}
                    className="h-full max-h-[min(220px,40vh)] w-full object-cover object-center lg:max-h-none lg:min-h-[260px]"
                  />
                  {badgeIndex === 0 ? <PhotoBadge count={images.length} /> : null}
                </div>

                <div className="grid min-h-[180px] grid-rows-2 gap-3 lg:min-h-0">
                  <div className="relative min-h-[88px] overflow-hidden rounded-xl bg-[var(--color-sand-mid)]/20">
                    <img
                      src={images[1].url}
                      alt={images[1].alt || property.title}
                      className="h-full w-full max-h-[min(200px,28vh)] object-cover object-center lg:max-h-[calc((min(440px,52vh)-0.75rem)/2)]"
                    />
                    {badgeIndex === 1 ? <PhotoBadge count={images.length} /> : null}
                  </div>

                  <div className="grid min-h-[88px] grid-cols-2 gap-3">
                    <div className="relative overflow-hidden rounded-xl bg-[var(--color-sand-mid)]/20">
                      {images[2] ? (
                        <>
                          <img
                            src={images[2].url}
                            alt={images[2].alt || property.title}
                            className="h-full w-full max-h-[min(200px,26vh)] object-cover object-center lg:max-h-[calc((min(440px,52vh)-0.75rem)/2)]"
                          />
                          {badgeIndex === 2 ? <PhotoBadge count={images.length} /> : null}
                        </>
                      ) : (
                        <div className="flex aspect-[4/3] min-h-[80px] items-center justify-center bg-[var(--color-sand)]/60 text-[var(--color-sand-dark)]/25">
                          <Camera className="h-8 w-8" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="relative overflow-hidden rounded-xl bg-[var(--color-sand-mid)]/20">
                      {images[3] ? (
                        <>
                          <img
                            src={images[3].url}
                            alt={images[3].alt || property.title}
                            className="h-full w-full max-h-[min(200px,26vh)] object-cover object-center lg:max-h-[calc((min(440px,52vh)-0.75rem)/2)]"
                          />
                          {badgeIndex === 3 ? <PhotoBadge count={images.length} /> : null}
                        </>
                      ) : (
                        <div className="flex aspect-[4/3] min-h-[80px] items-center justify-center bg-[var(--color-sand)]/60 text-[var(--color-sand-dark)]/25">
                          <Camera className="h-8 w-8" aria-hidden />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prix · indicateurs (centre) · actions */}
          <div className="flex flex-col gap-4 border-t border-[var(--color-cream-border)] px-4 py-3 md:flex-row md:items-center md:gap-5 md:px-5 lg:gap-8">
            <div className="shrink-0 md:max-w-[220px]">
              <p className="text-2xl font-bold tracking-tight text-[var(--color-accent)] md:text-3xl">{formatListingPrice(property.price)}</p>
              <button
                type="button"
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-lavender)] hover:underline"
              >
                M&apos;avertir d&apos;une baisse de prix
                <span className="text-xs opacity-70">(bientôt)</span>
              </button>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-center border-y border-[var(--color-cream-border)]/70 py-3 md:border-x md:border-y-0 md:px-4 lg:px-6">
              <div className="grid w-full max-w-lg grid-cols-4 gap-x-2 gap-y-1 sm:gap-x-6 md:max-w-none md:justify-items-center">
                <HeaderStat
                  Icon={Ruler}
                  label="Surface"
                  value={property.surface != null ? `${property.surface} m²` : '—'}
                />
                <HeaderStat Icon={Building2} label="Pièces" value={property.rooms != null ? `${property.rooms}` : '—'} />
                <HeaderStat Icon={Car} label="Garages" value={property.garages != null ? `${property.garages}` : '—'} />
                <HeaderStat
                  Icon={Bath}
                  label="Salles de bain"
                  value={property.bathrooms != null ? `${property.bathrooms}` : '—'}
                />
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
              <span
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-[var(--color-cream-border)] bg-[var(--color-sand)]/40 px-3 py-2 text-sm text-[var(--color-sand-dark)]/50"
                title="Bientôt disponible"
              >
                <Heart className="h-4 w-4" aria-hidden />
                Favori
              </span>
              <button
                type="button"
                onClick={copyPageLink}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-cream-border)] bg-white px-3 py-2 text-sm text-[var(--color-sand-dark)] shadow-sm transition hover:bg-[var(--color-sand)]/30"
              >
                {copyDone ? <Copy className="h-4 w-4 text-[var(--color-success)]" /> : <Share2 className="h-4 w-4" />}
                {copyDone ? 'Lien copié' : 'Partager'}
              </button>
            </div>
          </div>

          {/* Description à gauche · critères + lieu + badges + propriétaire resserrés à droite */}
          <div className="border-t border-[var(--color-cream-border)] px-4 py-4 md:px-5 md:py-5">
            <h1 className="font-display text-xl font-semibold leading-snug text-[var(--color-sand-dark)] md:text-2xl">
              {property.title}
            </h1>
            <p className="mt-1 text-base font-medium text-[var(--color-sand-dark)]/85 md:text-lg">{descTitle}</p>

            <div className="mt-4 grid gap-5 lg:mt-5 lg:grid-cols-[minmax(0,1fr)_min(280px,32%)] lg:items-start lg:gap-6 xl:gap-8">
              <div className="min-w-0">
                <div className="space-y-2.5 text-sm leading-relaxed text-[var(--color-sand-dark)]/80">
                  {property.description ? (
                    property.description.split(/\n+/).map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))
                  ) : (
                    <p className="italic text-[var(--color-sand-dark)]/45">Aucune description renseignée.</p>
                  )}
                </div>

                <div className="mt-4 space-y-2 rounded-lg border border-[var(--color-cream-border)] bg-[var(--color-sand)]/30 p-3 text-sm">
                  <p className="inline-flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sand-dark)]/55" />
                    <span>{property.address || locationLine || '—'}</span>
                  </p>
                  <p className="text-[var(--color-sand-dark)]/65">
                    Résumé : <span className="font-semibold text-[var(--color-sand-dark)]">{formatCompactPrice(property.price)}</span>
                    {property.garages != null ? ` · ${property.garages} garage(s)` : ''}
                    {property.floor != null ? ` · Étage ${property.floor}` : ''}
                    {property.yearBuilt != null ? ` · ${property.yearBuilt}` : ''}
                  </p>
                </div>
              </div>

              <aside className="min-w-0 space-y-3 lg:sticky lg:top-24 lg:self-start">
                {locationLine ? (
                  <p className="text-xs leading-snug text-[var(--color-sand-dark)]/55">{locationLine}</p>
                ) : null}

                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-[var(--color-cream-border)] bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-sand-dark)]/75">
                    {property.propertyType}
                  </span>
                  <span className="rounded-full border border-[var(--color-cream-border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--color-sand-dark)]/75">
                    {statusFr}
                  </span>
                  <span className="rounded-full border border-[var(--color-cream-border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--color-sand-dark)]/75">
                    {listingFr}
                  </span>
                  {property.isFeatured ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-success)]/35 bg-[var(--color-success-light)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-success)]">
                      <Sparkles className="h-2.5 w-2.5" aria-hidden />
                      À la une
                    </span>
                  ) : null}
                </div>

                <div className="pt-1">
                <Link
                  href={`/dashboard/proprietaires/${property.seller.id}/`}
                  className="group relative block overflow-hidden rounded-xl border border-[var(--color-cream-border)] bg-white p-4 shadow-[0_6px_22px_-10px_rgba(26,26,26,0.14)] ring-1 ring-black/5 transition hover:border-[var(--color-accent)]/40 hover:shadow-[0_10px_28px_-12px_rgba(26,26,26,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-accent)]/80 via-[var(--color-gold)]/70 to-[var(--color-sage)]/60"
                    aria-hidden
                  />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-sand-dark)]/40">
                      Propriétaire
                    </p>
                    <ChevronRight
                      className="h-5 w-5 shrink-0 text-[var(--color-sand-dark)]/25 transition group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]"
                      aria-hidden
                    />
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage-light)] text-[var(--color-sage)] shadow-inner">
                      <User className="h-6 w-6" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base font-semibold leading-tight text-[var(--color-sand-dark)] group-hover:text-[var(--color-accent)]">
                        {property.seller.name}
                      </p>
                      {property.seller.email ? (
                        <p className="mt-1 truncate text-xs text-[var(--color-sand-dark)]/45">{property.seller.email}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-[var(--color-cream-border)] bg-[var(--color-sand)]/40 px-2.5 py-2.5 text-[var(--color-sand-dark)] group-hover:border-[var(--color-accent)]/25 group-hover:bg-[var(--color-sage-light)]/35">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-accent)] shadow-sm ring-1 ring-[var(--color-cream-border)]">
                      <Phone className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-medium uppercase tracking-wide text-[var(--color-sand-dark)]/45">Téléphone</span>
                      <span className="font-semibold tracking-tight">{formatPhoneDisplay(property.seller.phone)}</span>
                    </span>
                  </div>

                  <p className="mt-3 text-center text-[11px] leading-snug text-[var(--color-sand-dark)]/38">
                    Biens liés, notes et visites
                  </p>
                </Link>
                </div>
              </aside>
            </div>
          </div>

          {/* Matches */}
          <div className="border-t border-[var(--color-cream-border)] px-4 py-5 md:px-5">
            <h2 className="font-display inline-flex items-center gap-2 text-xl text-[var(--color-sand-dark)]">
              <Eye className="h-5 w-5 text-[var(--color-sand-dark)]/55" />
              Matches acheteurs
            </h2>
            {property.matches.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-sand-dark)]/50">Aucun match pour le moment.</p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {property.matches.map((match) => (
                  <div key={match.id} className="rounded-xl border border-[var(--color-cream-border)] bg-[var(--color-sand)]/40 p-4">
                    <p className="font-medium text-[var(--color-sand-dark)]">
                      {match.buyer.name} — {match.score}%
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-sand-dark)]/60">
                      {formatPhoneDisplay(match.buyer.phone)} · {match.buyer.budget || 'budget n/a'}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-sand-dark)]/75">{match.reasons || 'Compatibilité globale.'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
