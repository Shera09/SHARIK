'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="mb-2 text-6xl font-bold text-blue-500">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-slate-200">Page Not Found</h2>
        <p className="mb-6 text-sm text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium hover:bg-blue-500">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
