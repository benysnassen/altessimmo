'use client';

const typeChips = ['Tous', 'Appartements', 'Maisons', 'Villas', 'Studios', 'Lofts'] as const;
const statusChips = ['Tous', 'Disponible', 'Option', 'Loué'] as const;

const chipBase = 'rounded-full border px-3 py-1 text-xs transition-colors duration-150';

type FilterToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statutFilter: string;
  onStatutFilterChange: (value: string) => void;
  sortBy: 'prix_asc' | 'prix_desc' | 'surface_asc' | 'surface_desc' | 'score_desc';
  onSortByChange: (value: 'prix_asc' | 'prix_desc' | 'surface_asc' | 'surface_desc' | 'score_desc') => void;
};

export default function FilterToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statutFilter,
  onStatutFilterChange,
  sortBy,
  onSortByChange,
}: FilterToolbarProps) {
  return (
    <section className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:max-w-lg">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-dark"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Rechercher par quartier, type…"
          className="w-full rounded-xl border border-cream-border bg-cream py-2 pl-9 pr-3 text-sm text-sand-dark placeholder:text-sand-dark/60 focus:outline-none focus:ring-2 focus:ring-sage-mid"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {typeChips.map((chip) => {
          const active = chip === typeFilter;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onTypeFilterChange(chip)}
              className={
                active
                  ? `${chipBase} bg-sage-light border-sage-mid text-sage`
                  : `${chipBase} bg-cream border-cream-border text-sand-dark`
              }
            >
              {chip}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statusChips.map((chip) => {
          const active = chip === statutFilter;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onStatutFilterChange(chip)}
              className={
                active
                  ? `${chipBase} bg-sage-light border-sage-mid text-sage`
                  : `${chipBase} bg-cream border-cream-border text-sand-dark`
              }
            >
              {chip}
            </button>
          );
        })}
      </div>

      <div className="ml-auto">
        <select
          value={sortBy}
          onChange={(event) =>
            onSortByChange(event.target.value as 'prix_asc' | 'prix_desc' | 'surface_asc' | 'surface_desc' | 'score_desc')
          }
          className="rounded-lg border border-cream-border bg-cream px-3 py-2 text-xs text-sand-dark focus:outline-none focus:ring-2 focus:ring-sage-mid"
        >
          <option value="prix_asc">Prix ↑</option>
          <option value="prix_desc">Prix ↓</option>
          <option value="surface_asc">Surface ↑</option>
          <option value="surface_desc">Surface ↓</option>
          <option value="score_desc">Score ↓</option>
        </select>
      </div>
    </section>
  );
}
