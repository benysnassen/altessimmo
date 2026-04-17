type Status = 'Disponible' | 'Loué' | 'Option';

const statusStyles: Record<Status, string> = {
  Disponible: 'bg-success-light text-success',
  Loué: 'bg-danger-light text-danger',
  Option: 'bg-warning-light text-warning',
};

export default function StatusBadge({ statut }: { statut: Status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[statut]}`}>
      {statut}
    </span>
  );
}
