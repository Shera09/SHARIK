'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="glass-card max-w-md p-6 text-center shadow-xl">
        <h2 className="mb-2 font-display text-xl font-bold text-destructive">Something went wrong!</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={() => reset()} className="rounded-xl">
          Try again
        </Button>
      </div>
    </div>
  );
}
