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
        ) : null}
      </div>
      <Button
        type="button"
        onClick={() => {
          if (playableCount === 0) {
            toast.error('Ajoutez au moins une réponse.');
            return;
          }
          onStartFull();
        }}
      >
        <Play className="h-4 w-4" />
        Démarrer le quiz
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          if (focusCount === 0) {
            toast.message(
              'Pas encore assez de données : joue quelques parties pour cibler les manques.'
            );
            return;
          }
          onStartFocus();
        }}
      >
        <Crosshair className="h-4 w-4" />
        Focus manquées ({focusCount})
      </Button>
      <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
        {previousBest !== null ? (
          <span className="tabular-nums">
            Record {previousBest}/{historyTotalFallback}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-2 tabular-nums">
          <Target className="h-4 w-4" />
          {lastScore} / {playableCount}
        </span>
      </div>
    </div>
  );
}
