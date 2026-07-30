import { Crosshair, Infinity, Play, Target, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Select } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { JetPunkItem } from '@/types';

const TIMED_DURATION_OPTIONS = [
  { label: '15 s', value: 15 },
  { label: '30 s', value: 30 },
  { label: '1 min', value: 60 },
  { label: '1 min 30', value: 90 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '4 min', value: 240 },
  { label: '5 min', value: 300 },
  { label: '6 min', value: 360 },
  { label: '7 min', value: 420 },
  { label: '8 min', value: 480 },
  { label: '9 min', value: 540 },
  { label: '10 min', value: 600 },
];

export const DEFAULT_TIMED_DURATION = 90;

interface QuizLaunchBarProps {
  durationSec: number;
  items: JetPunkItem[];
  focusCount: number;
  previousBest: number | null;
  lastScore: number;
  historyTotalFallback: number;
  onDurationChange: (durationSec: number) => void;
  onStartFull: () => void;
  onStartFocus: () => void;
}

export function QuizLaunchBar({
  durationSec,
  items,
  focusCount,
  previousBest,
  lastScore,
  historyTotalFallback,
  onDurationChange,
  onStartFull,
  onStartFocus,
}: QuizLaunchBarProps) {
  const playableCount = items.filter((item) => item.answer.trim()).length;
  const focusDisabled = focusCount === 0;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Mode</span>
        <div className="inline-flex rounded-xl border border-border p-0.5">
          <button
            type="button"
            onClick={() =>
              onDurationChange(durationSec > 0 ? durationSec : DEFAULT_TIMED_DURATION)
            }
            title="Chronométré"
            aria-label="Mode chronométré"
            aria-pressed={durationSec > 0}
            className={cn(
              'rounded-lg p-2 transition-colors',
              durationSec > 0
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Timer className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDurationChange(0)}
            title="Sans chrono"
            aria-label="Mode sans chrono"
            aria-pressed={durationSec <= 0}
            className={cn(
              'rounded-lg p-2 transition-colors',
              durationSec <= 0
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Infinity className="h-4 w-4" />
          </button>
        </div>
        {durationSec > 0 ? (
          <Select
            value={String(durationSec)}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            className="h-9 w-[130px]"
            aria-label="Durée du quiz"
          >
            {TIMED_DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ) : (
          <span className="text-xs text-muted-foreground">Sans limite</span>
        )}
      </div>
      <Button
        type="button"
        onClick={() => {
          if (playableCount === 0) {
            toast.error('Ajoute au moins une réponse.');
            return;
          }
          onStartFull();
        }}
      >
        <Play className="h-4 w-4" />
        Démarrer
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={focusDisabled}
        title={
          focusDisabled
            ? 'Joue quelques parties pour débloquer le focus sur les manques.'
            : `Relancer les ${focusCount} items souvent manqués`
        }
        onClick={() => {
          if (focusDisabled) return;
          onStartFocus();
        }}
      >
        <Crosshair className="h-4 w-4" />
        Focus ({focusCount})
      </Button>
      {previousBest !== null ? (
        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
          <span className="tabular-nums" title="Meilleur score sur cette liste">
            Record {previousBest}/{historyTotalFallback}
          </span>
          <span
            className="inline-flex items-center gap-1.5 tabular-nums"
            title="Dernière partie : score / total"
          >
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>
              Dernière {lastScore}/{historyTotalFallback}
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
