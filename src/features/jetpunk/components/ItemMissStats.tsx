import type { ItemMissStat } from '@/features/jetpunk/lib/item-stats';

interface ItemMissStatsProps {
  stats: ItemMissStat[];
  limit?: number;
}

export function ItemMissStats({ stats, limit = 8 }: ItemMissStatsProps) {
  const rows = stats.slice(0, limit);
  if (rows.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Souvent manquées
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[280px] border-collapse text-sm">
          <thead>
            <tr className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2.5">Indice</th>
              <th className="px-3 py-2.5">Réponse</th>
              <th className="w-24 px-3 py-2.5">Manques</th>
              <th className="w-20 px-3 py-2.5">Taux</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((stat) => (
              <tr key={stat.itemId} className="border-t border-border even:bg-card/40">
                <td className="px-3 py-2">{stat.prompt.trim() || '—'}</td>
                <td className="px-3 py-2 font-medium">{stat.answer}</td>
                <td className="px-3 py-2 tabular-nums text-muted-foreground">
                  {stat.misses}/{stat.attempts}
                </td>
                <td className="px-3 py-2 tabular-nums font-medium text-destructive">
                  {Math.round(stat.missRate * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
