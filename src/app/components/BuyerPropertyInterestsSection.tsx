'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, ExternalLink, Loader2, MapPin, Trash2 } from 'lucide-react';

const PROPERTY_LABELS: Record<string, string> = {
  APARTMENT: 'Appartement',
  VILLA: 'Villa',
  HOUSE: 'Maison',
  RIAD: 'Riad',
  LAND: 'Terrain',
  COMMERCIAL: 'Commerce',
  OFFICE: 'Bureau',
  PENTHOUSE: 'Penthouse',
  DUPLEX: 'Duplex',
  OTHER: 'Autre',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  AVAILABLE: 'Dispo',
  RESERVED: 'Reserve',
  SOLD: 'Vendu',
  ARCHIVED: 'Archive',
};

type PropertyMini = {
  id: string;
  title: string;
  location: string;
  neighborhood?: string | null;
  propertyType: string;
  price: string;
  rooms?: number | null;
  surface?: number | null;
  status: string;
};

export type BuyerInterestRow = {
  id: string;
  buyerId: string;
  propertyId: string;
  note: string | null;
  snapshotPrice: string | null;
  snapshotRooms: number | null;
  snapshotLocation: string | null;
  snapshotNeighborhood: string | null;
  snapshotPropertyType: string | null;
  snapshotSurface: number | null;
  createdAt: string;
  property: PropertyMini;
};

type PropertyListItem = {
  id: string;
  title: string;
  location: string;
  neighborhood?: string | null;
};

interface BuyerPropertyInterestsSectionProps {
  buyerId: string;
}

export default function BuyerPropertyInterestsSection({ buyerId }: BuyerPropertyInterestsSectionProps) {
  const [interests, setInterests] = useState<BuyerInterestRow[]>([]);
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [associateNote, setAssociateNote] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [intRes, propRes] = await Promise.all([
        fetch(`/api/buyers/${buyerId}/property-interests/`),
        fetch(`/api/properties/`),
      ]);
      if (!intRes.ok) throw new Error('interests');
      if (!propRes.ok) throw new Error('properties');
      const intData = (await intRes.json()) as BuyerInterestRow[];
      const propData = (await propRes.json()) as Array<{
        id: string;
        title: string;
        location: string;
        neighborhood?: string | null;
      }>;
      setInterests(intData);
      setProperties(
        propData.map((p) => ({
          id: p.id,
          title: p.title,
          location: p.location,
          neighborhood: p.neighborhood,
        }))
      );
    } catch {
      setError('Impossible de charger les biens.');
    } finally {
      setLoading(false);
    }
  }, [buyerId]);

  useEffect(() => {
    load();
  }, [load]);

  const linkedIds = useMemo(() => new Set(interests.map((i) => i.propertyId)), [interests]);

  const selectable = useMemo(
    () => properties.filter((p) => !linkedIds.has(p.id)),
    [properties, linkedIds]
  );

  const handleAdd = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setError('');
    try {
      const noteTrim = associateNote.trim();
      const res = await fetch(`/api/buyers/${buyerId}/property-interests/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedId,
          ...(noteTrim ? { note: noteTrim } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Association impossible.');
        return;
      }
      const created = (await res.json()) as BuyerInterestRow;
      setInterests((prev) => [created, ...prev]);
      setSelectedId('');
      setAssociateNote('');
    } catch {
      setError('Association impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (interestId: string) => {
    if (!confirm('Retirer ce bien de la fiche prospect ?')) return;
    try {
      const res = await fetch(`/api/buyers/${buyerId}/property-interests/${interestId}/`, {
        method: 'DELETE',
      });
      if (!res.ok) return;
      setInterests((prev) => prev.filter((i) => i.id !== interestId));
    } catch {
      /* ignore */
    }
  };

  const formatRefLine = (row: BuyerInterestRow) => {
    const parts: string[] = [];
    if (row.snapshotPrice) parts.push(`ref. ${row.snapshotPrice}`);
    if (row.snapshotRooms != null) parts.push(`${row.snapshotRooms} p.`);
    if (row.snapshotSurface != null) parts.push(`${row.snapshotSurface} m²`);
    const zone = [row.snapshotLocation, row.snapshotNeighborhood].filter(Boolean).join(' · ');
    if (zone) parts.push(zone);
    const typ = row.snapshotPropertyType ? PROPERTY_LABELS[row.snapshotPropertyType] || row.snapshotPropertyType : '';
    if (typ) parts.push(typ);
    return parts.join(' · ');
  };

  return (
    <div className="border-t border-white/10 pt-3 md:pt-4">
      <h4 className="text-xs md:text-sm font-light text-white/60 mb-2 md:mb-3 uppercase tracking-wider">
        Biens d&apos;interet (listing)
      </h4>
      <p className="text-[11px] md:text-xs text-white/45 mb-3 leading-relaxed">
        Lie ce prospect a un bien pour garder une reference budget / secteur / typologie au moment du contact.
      </p>

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={loading || selectable.length === 0}
            className="flex-1 min-w-0 px-3 py-2 bg-black/30 border border-white/15 rounded-sm text-white text-xs md:text-sm focus:outline-none focus:border-white/40 disabled:opacity-50"
            aria-label="Choisir un bien a associer"
          >
            <option value="">— Choisir un bien dans le listing —</option>
            {selectable.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} · {p.location}
                {p.neighborhood ? ` (${p.neighborhood})` : ''}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedId || submitting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm border border-white/20 text-xs md:text-sm text-white/90 hover:bg-white/10 disabled:opacity-40 transition-colors sm:self-stretch sm:min-h-[42px]"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
            Associer
          </button>
        </div>
        <div>
          <label htmlFor={`buyer-interest-note-${buyerId}`} className="sr-only">
            Note optionnelle pour cette association
          </label>
          <textarea
            id={`buyer-interest-note-${buyerId}`}
            value={associateNote}
            onChange={(e) => setAssociateNote(e.target.value)}
            disabled={loading || selectable.length === 0}
            rows={2}
            placeholder="Note (optionnel) — contexte, visite, objection…"
            className="w-full px-3 py-2 bg-black/25 border border-white/12 rounded-sm text-white text-xs md:text-sm placeholder:text-white/35 focus:outline-none focus:border-white/35 resize-y min-h-[2.75rem] disabled:opacity-50"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-white/50 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
        </div>
      ) : interests.length === 0 ? (
        <p className="text-xs text-white/45">Aucun bien lie pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {interests.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link
                      href={`/dashboard/properties/${row.property.id}/`}
                      className="text-sm font-medium text-white hover:text-white/90 truncate inline-flex items-center gap-1"
                    >
                      {row.property.title}
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-60" aria-hidden />
                    </Link>
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border border-white/15 text-white/55">
                      {STATUS_LABELS[row.property.status] || row.property.status}
                    </span>
                  </div>
                  <p className="text-[11px] md:text-xs text-emerald-300/90 font-mono mb-1">{formatRefLine(row)}</p>
                  <p className="text-[11px] text-white/50 flex items-start gap-1">
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" aria-hidden />
                    <span>
                      Actuellement : {row.property.location}
                      {row.property.neighborhood ? ` · ${row.property.neighborhood}` : ''}
                    </span>
                  </p>
                  {row.note ? (
                    <p className="text-[11px] text-white/55 mt-2 italic">{row.note}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(row.id)}
                  className="shrink-0 p-2 rounded-md text-red-400/90 hover:bg-red-500/10 transition-colors"
                  aria-label="Retirer ce lien"
                  title="Retirer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
