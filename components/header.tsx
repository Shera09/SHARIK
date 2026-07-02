'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

function openCommandPalette() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
}

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/customers': 'Customers',
  '/invoices': 'Invoices',
  '/payments': 'Payments',
  '/tasks': 'Tasks',
  '/employees': 'Employees',
  '/assistant': 'AI Assistant',
  '/knowledge': 'Knowledge Base',
  '/whatsapp': 'WhatsApp',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/analytics': 'Analytics',
  '/calendar': 'Calendar',
};

type Notification = {
  id: string;
  title: string;
  message: string | null;
  type: string;
  read: boolean;
  created_at: string;
};

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    supabase
      .from('notifications')
      .select('id, title, message, type, read, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setNotifications(data);
      });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentPage = pageNames[pathname] || 'Dashboard';

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).neq('read', true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb */}
      <div className="hidden items-center gap-1.5 text-sm md:flex">
        <span className="text-muted-foreground">WebHoster</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="font-medium">{currentPage}</span>
      </div>

      {/* Search — opens global command palette */}
      <button
        onClick={openCommandPalette}
        className="ml-auto flex h-9 w-full max-w-md items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/60 md:max-w-sm"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search or jump to...</span>
        <kbd className="hidden select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-flex">
          ⌘K
        </kbd>
      </button>

      {/* Notifications */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setNotifOpen(!notifOpen)}
        >
          <Bell className="h-[1.15rem] w-[1.15rem]" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>

        <AnimatePresence>
          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className="glass-card absolute right-0 top-12 z-50 w-80 sm:w-96 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'flex gap-3 border-b border-border/40 px-4 py-3 transition-colors hover:bg-muted/40',
                          !n.read && 'bg-primary/5'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                            n.read ? 'bg-muted-foreground/30' : 'bg-primary'
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight">{n.title}</p>
                          {n.message && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                              {n.message}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <ThemeToggle />

      {/* Profile */}
      <div className="flex items-center gap-2.5">
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white">
            WH
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left lg:block">
          <p className="text-xs font-semibold leading-tight">Admin User</p>
          <p className="text-[10px] text-muted-foreground">Administrator</p>
        </div>
      </div>
    </header>
  );
}
