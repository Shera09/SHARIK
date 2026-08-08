'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-500">System Error</h2>
          <p className="mb-6 text-sm text-slate-400">
            {error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
