'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Sparkles,
  LayoutDashboard,
  Users,
  FileText,
  Plus,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { navSections } from '@/lib/navigation';
import { cn } from '@/lib/utils';

type CommandEntry = {
  label: string;
  href: string;
  group: string;
  icon: React.ElementType;
  badge?: string;
  keywords?: string;
};

const quickActions: CommandEntry[] = [
  { label: 'New Customer', href: '/customers?action=new', group: 'Quick Actions', icon: Plus, keywords: 'add create customer client' },
  { label: 'New Lead', href: '/leads?action=new', group: 'Quick Actions', icon: Plus, keywords: 'add create lead prospect' },
  { label: 'New Invoice', href: '/invoices?action=new', group: 'Quick Actions', icon: Plus, keywords: 'add create invoice bill gst' },
  { label: 'New Task', href: '/tasks?action=new', group: 'Quick Actions', icon: Plus, keywords: 'add create task todo' },
  { label: 'Ask AI Assistant', href: '/assistant', group: 'Quick Actions', icon: Sparkles, keywords: 'ai chat help ask question' },
  { label: 'Go to Dashboard', href: '/dashboard', group: 'Quick Actions', icon: LayoutDashboard, keywords: 'home overview main' },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const navEntries = useMemo<CommandEntry[]>(() => {
    return navSections.flatMap((section) =>
      section.items.map((item) => ({
        label: item.label,
        href: item.href,
        group: section.title,
        icon: item.icon,
        badge: item.badge,
      }))
    );
  }, []);

  const allEntries = useMemo(() => {
    return [...quickActions, ...navEntries];
  }, [navEntries]);

  // Group entries by their group label, preserving first-seen order.
  const grouped = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, CommandEntry[]>();
    for (const entry of allEntries) {
      if (!map.has(entry.group)) {
        order.push(entry.group);
        map.set(entry.group, []);
      }
      map.get(entry.group)!.push(entry);
    }
    return order.map((g) => ({ group: g, items: map.get(g)! }));
  }, [allEntries]);

  const run = useCallback(
    (href: string) => {
      onOpenChange(false);
      setSearch('');
      router.push(href);
    },
    [onOpenChange, router]
  );

  // Reset search each time the palette closes so it opens fresh.
  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={search}
        onValueChange={setSearch}
        placeholder="Type a command or search across all modules..."
      />
      <CommandList>
        <CommandEmpty>No results found for &quot;{search}&quot;.</CommandEmpty>

        {grouped.map(({ group, items }, idx) => (
          <div key={group}>
            {idx === 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {items.map((entry) => {
                const Icon = entry.icon;
                return (
                  <CommandItem
                    key={`${group}-${entry.label}`}
                    value={`${entry.label} ${entry.group} ${entry.keywords || ''}`}
                    onSelect={() => run(entry.href)}
                    className="gap-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">
                        {entry.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {entry.href}
                      </span>
                    </span>
                    {entry.badge && (
                      <span className="ml-1 rounded-md bg-gradient-to-r from-primary to-accent px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {entry.badge}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {idx < grouped.length - 1 && <CommandSeparator />}
          </div>
        ))}

        <CommandSeparator />
        <CommandGroup heading="Tips">
          <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
            <kbd className="flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 text-[10px] font-medium">
              <ArrowUp className="h-3 w-3" />
            </kbd>
            <kbd className="flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 text-[10px] font-medium">
              <ArrowDown className="h-3 w-3" />
            </kbd>
            <span>to navigate</span>
            <kbd className="ml-2 flex h-5 items-center justify-center gap-0.5 rounded border border-border bg-muted px-1 text-[10px] font-medium">
              <CornerDownLeft className="h-3 w-3" />
            </kbd>
            <span>to select</span>
            <kbd className="ml-2 flex h-5 items-center justify-center rounded border border-border bg-muted px-1 text-[10px] font-medium">
              esc
            </kbd>
            <span>to close</span>
          </div>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
