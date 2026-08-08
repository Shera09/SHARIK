'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type CalEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: string;
  attendees: string | null;
  location: string | null;
  created_at: string;
};

const eventColors: Record<string, string> = {
  meeting: 'hsl(221 83% 53%)',
  call: 'hsl(199 89% 48%)',
  deadline: 'hsl(0 72% 51%)',
  follow_up: 'hsl(38 92% 50%)',
  demo: 'hsl(142 71% 45%)',
  other: 'hsl(280 65% 60%)',
};

const eventBgColors: Record<string, string> = {
  meeting: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400',
  call: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-400',
  deadline: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400',
  follow_up: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400',
  demo: 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400',
  other: 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400',
};

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const emptyForm = {
  title: '',
  description: '',
  event_date: '',
  start_time: '',
  end_time: '',
  event_type: 'meeting',
  attendees: '',
  location: '',
};

export default function CalendarPage() {
  const [today] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'month' | 'list'>('month');

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .is('deleted_at', null)
      .order('event_date', { ascending: true });
    if (!error) setEvents(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const calDays: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getDateStr = (day: number) => {
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentMonth.getFullYear()}-${m}-${d}`;
  };

  const eventsOnDate = (dateStr: string) =>
    events.filter((e) => e.event_date === dateStr);

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const openAdd = (dateStr?: string) => {
    setForm({ ...emptyForm, event_date: dateStr || '' });
    setDialogOpen(true);
  };

  const openAddForDay = (day: number) => {
    const dateStr = getDateStr(day);
    setSelectedDate(dateStr);
    setForm({ ...emptyForm, event_date: dateStr });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('calendar_events').insert({
        title: form.title.trim(),
        event_date: form.event_date,
        event_type: form.event_type,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        attendees: form.attendees || null,
        location: form.location || null,
      });
      if (error) throw error;
      toast.success('Event added');
      setDialogOpen(false);
      loadEvents();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    const { error } = await supabase.from('calendar_events').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Event deleted');
    loadEvents();
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const upcomingEvents = events
    .filter((e) => e.event_date >= todayStr)
    .slice(0, 20);

  return (
    <AppShell>
      <PageHeader
        title="Calendar"
        description="Schedule meetings, follow-ups and deadlines"
        action={
          <Button onClick={() => openAdd()} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        }
      />

      {/* View toggle + month nav */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-9 w-9 rounded-xl">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[160px] text-center font-display text-lg font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="ml-2 rounded-xl text-xs"
            onClick={() => setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
          >
            Today
          </Button>
        </div>
        <div className="flex rounded-xl border border-border bg-muted/30 p-1">
          <Button variant={view === 'month' ? 'default' : 'ghost'} size="sm" onClick={() => setView('month')} className="gap-1.5">
            <CalendarIcon className="h-4 w-4" />
            Month
          </Button>
          <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')} className="gap-1.5">
            <Clock className="h-4 w-4" />
            Agenda
          </Button>
        </div>
      </div>

      {/* Month View */}
      {view === 'month' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden premium-shadow">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {daysOfWeek.map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calDays.map((day, idx) => {
              const dateStr = day ? getDateStr(day) : '';
              const dayEvents = day ? eventsOnDate(dateStr) : [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              return (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDate(isSelected ? null : dateStr)}
                  className={cn(
                    'min-h-[90px] cursor-pointer border-b border-r border-border/50 p-1.5 transition-colors last:border-r-0',
                    day ? 'hover:bg-muted/30' : 'opacity-0 pointer-events-none',
                    isSelected && 'bg-primary/5'
                  )}
                >
                  {day && (
                    <>
                      <div className={cn(
                        'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                        isToday && 'bg-primary text-primary-foreground font-bold'
                      )}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <div
                            key={e.id}
                            onClick={(ev) => { ev.stopPropagation(); }}
                            className={cn(
                              'truncate rounded border px-1 py-0.5 text-[10px] font-medium leading-tight',
                              eventBgColors[e.event_type] || eventBgColors.other
                            )}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected date events panel */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-display text-sm font-semibold">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h4>
                    <Button size="sm" variant="outline" onClick={() => openAdd(selectedDate)} className="h-7 gap-1 rounded-xl text-xs">
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                  {eventsOnDate(selectedDate).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events — click Add to schedule one.</p>
                  ) : (
                    <div className="space-y-2">
                      {eventsOnDate(selectedDate).map((e) => (
                        <div key={e.id} className={cn('flex items-start gap-3 rounded-xl border p-3', eventBgColors[e.event_type] || eventBgColors.other)}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{e.title}</p>
                            {e.description && <p className="mt-0.5 text-xs opacity-80">{e.description}</p>}
                            <div className="mt-1.5 flex flex-wrap gap-3">
                              {(e.start_time || e.end_time) && (
                                <span className="flex items-center gap-1 text-xs opacity-80">
                                  <Clock className="h-3 w-3" />
                                  {e.start_time}{e.end_time ? ` – ${e.end_time}` : ''}
                                </span>
                              )}
                              {e.location && (
                                <span className="flex items-center gap-1 text-xs opacity-80">
                                  <MapPin className="h-3 w-3" />
                                  {e.location}
                                </span>
                              )}
                              {e.attendees && (
                                <span className="flex items-center gap-1 text-xs opacity-80">
                                  <Users className="h-3 w-3" />
                                  {e.attendees}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0 capitalize text-[10px]">
                            {e.event_type.replace('_', ' ')}
                          </Badge>
                          <button onClick={() => remove(e.id)} className="shrink-0 opacity-60 hover:opacity-100">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Agenda / List View */}
      {view === 'list' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden premium-shadow">
          {loading ? (
            <div className="space-y-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 border-b border-border/40 shimmer" />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <CalendarIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium">No upcoming events</p>
              <p className="mt-1 text-xs text-muted-foreground">Add your first event to get started</p>
              <Button onClick={() => openAdd()} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>
          ) : (
            <div>
              {upcomingEvents.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 border-b border-border/40 p-4 transition-colors hover:bg-muted/30"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-white"
                    style={{ background: eventColors[e.event_type] || eventColors.other }}
                  >
                    <span className="text-[10px] font-semibold leading-none">
                      {new Date(e.event_date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-sm font-bold leading-none">
                      {new Date(e.event_date + 'T00:00:00').getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{e.title}</p>
                    <div className="mt-0.5 flex flex-wrap gap-3">
                      {(e.start_time || e.end_time) && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {e.start_time}{e.end_time ? ` – ${e.end_time}` : ''}
                        </span>
                      )}
                      {e.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {e.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 capitalize text-xs">
                    {e.event_type.replace('_', ' ')}
                  </Badge>
                  <button onClick={() => remove(e.id)} className="shrink-0 text-muted-foreground/50 hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Add Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date *</Label>
                <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Office, Zoom, etc." />
            </div>
            <div className="grid gap-2">
              <Label>Attendees</Label>
              <Input value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} placeholder="Names or emails" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Notes about this event..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Add Event'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
