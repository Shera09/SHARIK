'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Phone,
  Mail,
  FileText,
  Wallet,
  CheckSquare,
  MessageSquare,
  UserPlus,
  Users,
  StickyNote,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Notification = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
};

const typeIcons: Record<string, typeof Bell> = {
  call: Phone,
  email: Mail,
  invoice: FileText,
  payment: Wallet,
  task: CheckSquare,
  whatsapp: MessageSquare,
  lead: UserPlus,
  meeting: Users,
  note: StickyNote,
  alert: AlertCircle,
};

const typeColors: Record<string, string> = {
  call: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  email: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  invoice: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  payment: 'bg-green-500/10 text-green-600 dark:text-green-400',
  task: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  whatsapp: 'bg-green-500/10 text-green-600 dark:text-green-400',
  lead: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  meeting: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  note: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  alert: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setNotifications(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unread.length === 0) return;
    const { error } = await supabase.from('notifications').update({ is_read: true }).in('id', unread);
    if (error) { toast.error(error.message); return; }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success('All marked as read');
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = async () => {
    if (!confirm('Delete all notifications?')) return;
    const { error } = await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) { toast.error(error.message); return; }
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <AppShell>
      <PageHeader
        title="Notifications"
        description="Stay updated on all business activity"
        action={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllRead} className="gap-2 rounded-xl">
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" onClick={clearAll} className="gap-2 rounded-xl text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>
        }
      />

      {/* Stats bar */}
      <div className="mb-4 flex items-center gap-4">
        <div className="glass-card flex items-center gap-3 px-4 py-3 premium-shadow">
          <Bell className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-display text-lg font-bold">{notifications.length}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 px-4 py-3 premium-shadow">
          <div className="relative">
            <Bell className="h-4 w-4 text-warning" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unread</p>
            <p className="font-display text-lg font-bold text-warning">{unreadCount}</p>
          </div>
        </div>

        <div className="ml-auto">
          <Select value={filter} onValueChange={(v: 'all' | 'unread' | 'read') => setFilter(v)}>
            <SelectTrigger className="h-9 w-36 rounded-xl">
              <Filter className="mr-2 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notification list */}
      <div className="glass-card overflow-hidden premium-shadow">
        {loading ? (
          <div className="space-y-0">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4">
                <div className="h-10 w-10 rounded-full shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-1/3 rounded shimmer" />
                  <div className="h-3 w-1/2 rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium">
              {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Notifications appear here as you use the app
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((n, i) => {
              const Icon = typeIcons[n.type] || Bell;
              const colorClass = typeColors[n.type] || typeColors.note;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    'group flex items-start gap-3 border-b border-border/40 p-4 transition-colors hover:bg-muted/30',
                    !n.is_read && 'bg-primary/[0.02]'
                  )}
                >
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm', !n.is_read && 'font-semibold')}>{n.title}</p>
                      {!n.is_read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    {n.body && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground/70">{formatTime(n.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!n.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => markRead(n.id)}
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5 text-success" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      onClick={() => remove(n.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  );
}
