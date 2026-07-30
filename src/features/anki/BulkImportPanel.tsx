import { Upload } from 'lucide-react';
import { Button, Textarea } from '@/components/ui/primitives';

interface BulkImportPanelProps {
  value: string;
  onChange: (value: string) => void;
  onImport: () => void;
}

export function BulkImportPanel({ value, onChange, onImport }: BulkImportPanelProps) {
  return (
    <aside className="flex w-full flex-col border-t border-border bg-background p-4 lg:w-[320px] lg:border-l lg:border-t-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Import rapide
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold">Coller en masse</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Une carte par ligne — voir{' '}
        <span className="font-medium text-foreground">Comment ça marche ?</span> pour le
        format complet.
      </p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-4 min-h-[220px] flex-1 font-mono text-xs"
        placeholder={
          'Capitale du Japon;Tokyo;Géo;To-kyo comme ticket;asie,capitales\nRoi dit le Saint;Louis IX;Histoire'
        }
      />
      <Button type="button" className="mt-4 w-full" onClick={onImport}>
        <Upload className="h-4 w-4" />
        Ajouter les cartes
      </Button>
    </aside>
  );
}
