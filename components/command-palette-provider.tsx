'use client';

import { useEffect, useState, useCallback } from 'react';
import { CommandPalette } from '@/components/command-palette';

export function CommandPaletteProvider() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback((e: KeyboardEvent) => {
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', toggle);
    return () => window.removeEventListener('keydown', toggle);
  }, [toggle]);

  return <CommandPalette open={open} onOpenChange={setOpen} />;
}
