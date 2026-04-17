type BienType = 'Appartement' | 'Maison' | 'Villa' | 'Loft' | 'Studio';

const typeStyles: Record<BienType, string> = {
  Appartement: 'bg-lavender-light text-lavender',
  Maison: 'bg-sage-light text-sage',
  Villa: 'bg-peach-light text-peach',
  Loft: 'bg-rose-light text-rose',
  Studio: 'bg-sand text-sand-dark',
};

export default function TypeBadge({ type }: { type: BienType }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium ${typeStyles[type]}`}>
      {type}
    </span>
  );
}
