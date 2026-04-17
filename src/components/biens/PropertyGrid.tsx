'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Bien } from '@/types/bien';
import { deleteBien, toggleFavori } from '@/app/biens/actions';
import StatsBar from './StatsBar';
import FilterToolbar from './FilterToolbar';
import PropertyCard from './PropertyCard';
import DeleteConfirmModal from './DeleteConfirmModal';

type PropertyGridProps = {
  initialBiens: Bien[];
};

const typeMap: Record<string, Bien['type'] | 'Tous'> = {
  Tous: 'Tous',
  Appartements: 'Appartement',
  Maisons: 'Maison',
  Villas: 'Villa',
  Studios: 'Studio',
  Lofts: 'Loft',
};

export default function PropertyGrid({ initialBiens }: PropertyGridProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('Tous');
  const [statutFilter, setStatutFilter] = useState<string>('Tous');
  const [sortBy, setSortBy] = useState<'prix_asc' | 'prix_desc' | 'surface_asc' | 'surface_desc' | 'score_desc'>('score_desc');
  const [biens, setBiens] = useState<Bien[]>(initialBiens);
  const [pendingDelete, setPendingDelete] = useState<Bien | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const filteredBiens = useMemo(() => {
    const query = search.trim().toLowerCase();
    const wantedType = typeMap[typeFilter] || 'Tous';

    const filtered = biens.filter((bien) => {
      const matchesSearch =
        !query ||
        bien.quartier.toLowerCase().includes(query) ||
        bien.type.toLowerCase().includes(query) ||
        bien.adresse.toLowerCase().includes(query);

      const matchesType = wantedType === 'Tous' || bien.type === wantedType;
      const matchesStatus = statutFilter === 'Tous' || bien.statut === statutFilter;

      return matchesSearch && matchesType && matchesStatus;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case 'prix_asc':
        sorted.sort((a, b) => a.prix - b.prix);
        break;
      case 'prix_desc':
        sorted.sort((a, b) => b.prix - a.prix);
        break;
      case 'surface_asc':
        sorted.sort((a, b) => a.surface - b.surface);
        break;
      case 'surface_desc':
        sorted.sort((a, b) => b.surface - a.surface);
        break;
      case 'score_desc':
        sorted.sort((a, b) => b.score - a.score);
        break;
      default:
        break;
    }

    return sorted;
  }, [biens, search, sortBy, statutFilter, typeFilter]);

  const updatedTodayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return biens.filter((bien) => bien.created_at?.slice(0, 10) === today).length;
  }, [biens]);

  const handleToggleFavori = (id: string, value: boolean) => {
    setBiens((prev) => prev.map((bien) => (bien.id === id ? { ...bien, favori: value } : bien)));
    startTransition(async () => {
      try {
        await toggleFavori(id, value);
      } catch {
        setBiens((prev) => prev.map((bien) => (bien.id === id ? { ...bien, favori: !value } : bien)));
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const removedBien = pendingDelete;
    const deletingId = pendingDelete.id;
    setDeletingIds((prev) => new Set(prev).add(deletingId));
    setPendingDelete(null);
    setBiens((prev) => prev.filter((bien) => bien.id !== deletingId));

    startTransition(async () => {
      try {
        await deleteBien(deletingId);
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(deletingId);
          return next;
        });
      } catch {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(deletingId);
          return next;
        });
        setBiens((prev) => [removedBien, ...prev]);
      }
    });
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-sand-dark">Mes biens</h1>
          <p className="text-sm text-sand-dark/80">
            {biens.length} biens · {updatedTodayCount} mise à jour aujourd&apos;hui
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/biens/nouveau')}
          className="inline-flex items-center gap-2 rounded-xl bg-sage px-4 py-2 text-sm text-white transition-colors duration-150 hover:bg-sage/90"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter un bien
        </button>
      </header>

      <StatsBar biens={filteredBiens} />

      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statutFilter={statutFilter}
        onStatutFilterChange={setStatutFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBiens.map((bien) => (
          <PropertyCard
            key={bien.id}
            bien={bien}
            isDeleting={deletingIds.has(bien.id)}
            onToggleFavori={handleToggleFavori}
            onEdit={(id) => router.push(`/biens/${id}?edit=1`)}
            onDelete={setPendingDelete}
          />
        ))}
      </section>

      <DeleteConfirmModal
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={isPending}
        adresse={pendingDelete?.adresse}
      />
    </div>
  );
}
