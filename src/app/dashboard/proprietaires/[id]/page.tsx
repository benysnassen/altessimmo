'use client';

import { formatPhoneDisplay, phoneInternationalDigits } from '@/lib/formatPhoneDisplay';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Calendar,
  ChevronRight,
  Mail,
  Phone,
  StickyNote,
  User,
} from 'lucide-react';

type SellerVisit = {
  id: string;
  date: string;
  status: string;
  notes?: string | null;
};

type SellerNote = {
  id: string;
  content: string;
  type: string;
  createdAt: string;
};

type SellerProperty = {
  id: string;
  title: string;
  location: string;
  neighborhood?: string | null;
  price: string;
  status: string;
  listingType: string;
  updatedAt: string;
};

type SellerDetail = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  status: string;
  personalNote?: string | null;
  rating?: number | null;
  message?: string | null;
  location?: string | null;
  propertyType?: string | null;
  surface?: number | null;
  rooms?: number | null;
  price?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  properties: SellerProperty[];
  visits: SellerVisit[];
  notes: SellerNote[];
};

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nouveau',
  CONTACTED: 'Contacté',
  EVALUATED: 'Évalué',
  LISTED: 'En annonce',
  VIEWING: 'Visite',
  OFFER_RECEIVED: 'Offre reçue',
  NEGOTIATING: 'Négociation',
  SOLD: 'Vendu',
  ARCHIVED: 'Archivé',
};

export default function ProprietaireDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [seller, setSeller] = useState<SellerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const authResponse = await fetch('/api/auth/verify/');
        if (!authResponse.ok) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/sellers/${params.id}/`);
        if (!response.ok) {
          router.push('/dashboard/proprietaires');
          return;
        }
        const data = (await response.json()) as SellerDetail;
        setSeller(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="admin-light flex min-h-screen items-center justify-center bg-[var(--color-sand)] text-[var(--color-sand-dark)]/70">
        Chargement du propriétaire…
      </div>
    );
  }

  if (!seller) return null;

  const statusFr = STATUS_LABELS[seller.status] ?? seller.status;

  return (
    <div className="admin-light min-h-screen bg-[var(--color-sand)] text-[var(--color-sand-dark)]">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <Link
          href="/dashboard/proprietaires/"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-sand-dark)]/55 transition-colors hover:text-[var(--color-sand-dark)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux propriétaires
        </Link>

        <article className="overflow-hidden rounded-2xl border border-[var(--color-cream-border)] bg-[var(--color-cream)] shadow-sm">
          <div className="border-b border-[var(--color-cream-border)] px-5 py-6 md:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage-light)] text-[var(--color-sage)]">
                  <User className="h-7 w-7" aria-hidden />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-[var(--color-sand-dark)] md:text-3xl">{seller.name}</h1>
                  <p className="mt-2 text-sm text-[var(--color-sand-dark)]/55">Propriétaire · {statusFr}</p>
                </div>
              </div>
              <span className="rounded-full border border-[var(--color-cream-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--color-sand-dark)]/75">
                Fiche vendeur
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <a
                href={
                  phoneInternationalDigits(seller.phone)
                    ? `tel:+${phoneInternationalDigits(seller.phone)}`
                    : `tel:${seller.phone.replace(/\s/g, '')}`
                }
                className="flex items-center gap-3 rounded-xl border border-[var(--color-cream-border)] bg-[var(--color-sand)]/40 px-4 py-3 text-[var(--color-sand-dark)] transition hover:bg-[var(--color-sand)]/70"
              >
                <Phone className="h-5 w-5 shrink-0 text-[var(--color-accent)]" aria-hidden />
                <div>
                  <p className="text-xs text-[var(--color-sand-dark)]/50">Téléphone</p>
                  <p className="font-medium">{formatPhoneDisplay(seller.phone)}</p>
                </div>
              </a>
              {seller.email ? (
                <a
                  href={`mailto:${seller.email}`}
                  className="flex items-center gap-3 rounded-xl border border-[var(--color-cream-border)] bg-[var(--color-sand)]/40 px-4 py-3 text-[var(--color-sand-dark)] transition hover:bg-[var(--color-sand)]/70"
                >
                  <Mail className="h-5 w-5 shrink-0 text-[var(--color-accent)]" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--color-sand-dark)]/50">E-mail</p>
                    <p className="truncate font-medium">{seller.email}</p>
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--color-cream-border)] bg-[var(--color-sand)]/25 px-4 py-3 text-[var(--color-sand-dark)]/45">
                  <Mail className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="text-sm">E-mail non renseigné</span>
                </div>
              )}
            </div>

            {seller.personalNote ? (
              <div className="mt-6 rounded-xl border border-[var(--color-cream-border)] bg-[var(--color-peach-light)]/40 px-4 py-3">
                <p className="mb-1 inline-flex items-center gap-2 text-xs font-medium text-[var(--color-sand-dark)]/55">
                  <StickyNote className="h-3.5 w-3.5" />
                  Note interne
                </p>
                <p className="text-sm leading-relaxed text-[var(--color-sand-dark)]/85">{seller.personalNote}</p>
              </div>
            ) : null}

            {seller.message ? (
              <div className="mt-4 text-sm leading-relaxed text-[var(--color-sand-dark)]/75">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-sand-dark)]/45">Message initial</p>
                <p>{seller.message}</p>
              </div>
            ) : null}
          </div>

          <div className="border-b border-[var(--color-cream-border)] px-5 py-5 md:px-8">
            <h2 className="font-display flex items-center gap-2 text-lg text-[var(--color-sand-dark)]">
              <Building2 className="h-5 w-5 text-[var(--color-sand-dark)]/55" />
              Biens associés ({seller.properties.length})
            </h2>
            {seller.properties.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-sand-dark)]/50">Aucun bien lié pour le moment.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {seller.properties.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/properties/${p.id}/`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-cream-border)] bg-white px-4 py-3 text-left shadow-sm transition hover:border-[var(--color-accent)]/35 hover:bg-[var(--color-sand)]/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--color-sand-dark)]">{p.title}</p>
                        <p className="truncate text-xs text-[var(--color-sand-dark)]/55">
                          {p.location}
                          {p.neighborhood ? ` · ${p.neighborhood}` : ''} · {p.price}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-sand-dark)]/35" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {seller.visits.length > 0 ? (
            <div className="border-b border-[var(--color-cream-border)] px-5 py-5 md:px-8">
              <h2 className="font-display mb-3 flex items-center gap-2 text-lg text-[var(--color-sand-dark)]">
                <Calendar className="h-5 w-5 text-[var(--color-sand-dark)]/55" />
                Visites récentes
              </h2>
              <ul className="space-y-2 text-sm">
                {seller.visits.map((v) => (
                  <li
                    key={v.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-[var(--color-cream-border)] bg-[var(--color-sand)]/25 px-3 py-2"
                  >
                    <span className="text-[var(--color-sand-dark)]">
                      {new Date(v.date).toLocaleString('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span className="text-xs text-[var(--color-sand-dark)]/55">{v.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {seller.notes.length > 0 ? (
            <div className="px-5 py-5 md:px-8">
              <h2 className="font-display mb-3 flex items-center gap-2 text-lg text-[var(--color-sand-dark)]">
                <StickyNote className="h-5 w-5 text-[var(--color-sand-dark)]/55" />
                Notes ({seller.notes.length})
              </h2>
              <ul className="space-y-3">
                {seller.notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-[var(--color-cream-border)] bg-[var(--color-sand)]/20 px-3 py-2 text-sm text-[var(--color-sand-dark)]/85">
                    <p className="mb-1 text-xs text-[var(--color-sand-dark)]/45">
                      {new Date(n.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {n.content}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      </div>
    </div>
  );
}
