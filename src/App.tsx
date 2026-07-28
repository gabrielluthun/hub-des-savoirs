import { Toaster } from 'sonner';
import { AppShell } from '@/app/AppShell';
import { StoreProvider } from '@/store/StoreProvider';

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'bg-card border-border text-foreground',
          },
        }}
      />
    </StoreProvider>
  );
}
