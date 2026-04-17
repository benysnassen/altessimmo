export default function ScoreBar({ score }: { score: number }) {
  const scoreColor = score >= 85 ? 'bg-sage' : score >= 70 ? 'bg-warning' : 'bg-danger';

  return (
    <div className="inline-flex items-center gap-2">
      <div className="h-[3px] w-12 rounded-full bg-cream-border">
        <div className={`h-[3px] rounded-full ${scoreColor}`} style={{ width: `${Math.max(8, Math.min(100, score))}%` }} />
      </div>
      <span className="text-xs font-medium text-sand-dark">{score}</span>
    </div>
  );
}
