import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/primitives';

interface SyncButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SyncButton({ onClick, loading = false, disabled = false }: SyncButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      Rafraîchir
    </Button>
  );
}
