import type { Bien } from '@/types/bien';

const iconClass = 'h-4 w-4 text-sand-dark';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5l3.5 2" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
      <path d="M4 19.5h16" />
      <path d="M6.5 16V11" />
      <path d="M11.5 16V8" />
      <path d="M16.5 16V5.5" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </svg>
  );
}

const mad = new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 });

export default function StatsBar({ biens }: { biens: Bien[] }) {
  const listed = biens.length;
  const available = biens.filter((b) => b.statut === 'Disponible').length;
  const avgPrice = listed ? Math.round(biens.reduce((sum, b) => sum + b.prix, 0) / listed) : 0;
  const avgSurface = listed ? Math.round(biens.reduce((sum, b) => sum + b.surface, 0) / listed) : 0;

  const cards = [
    { label: 'Biens listés', value: listed.toString(), icon: <HomeIcon />, iconBg: 'bg-success-light', valueClass: 'text-sand-dark' },
    { label: 'Disponibles', value: available.toString(), icon: <ClockIcon />, iconBg: 'bg-lavender-light', valueClass: 'text-sage' },
    { label: 'Prix moyen', value: `${mad.format(avgPrice)} MAD`, icon: <ChartIcon />, iconBg: 'bg-peach-light', valueClass: 'text-sand-dark' },
    { label: 'Surface moy.', value: `${avgSurface} m²`, icon: <GridIcon />, iconBg: 'bg-sand-mid', valueClass: 'text-sand-dark' },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-2xl border border-cream-border bg-cream p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${card.iconBg}`}>{card.icon}</span>
            <p className="text-xs text-sand-dark">{card.label}</p>
          </div>
          <p className={`text-base font-semibold ${card.valueClass}`}>{card.value}</p>
        </article>
      ))}
    </section>
  );
}
