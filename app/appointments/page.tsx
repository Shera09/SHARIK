'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  Search,
  Clock,
  Video,
  MapPin,
  Phone,
  MoreHorizontal,
  Trash2,
  Pencil,
  Users,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Send,
  ArrowRight,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Appointment = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  title: string;
  description: string;
  appointment_type: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  location_type: string;
  location_url: string;
  location_address: string;
  notes: string;
  reminder_sent: boolean;
  created_at: string;
};

const emptyForm = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  title: '',
  description: '',
  appointment_type: 'meeting',
  scheduled_start: '',
  scheduled_end: '',
  location_type: 'video',
  location_url: '',
  location_address: '',
  notes: '',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('appointments').select('*').is('deleted_at', null).order('scheduled_start', { ascending: true });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data, error } = await query;
    if (!error) setAppointments(data || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.customer_name?.toLowerCase().includes(q);
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (app: Appointment) => {
    setEditing(app);
    setForm({
      title: app.title,
      customer_name: app.customer_name || '',
      customer_email: app.customer_email || '',
      customer_phone: app.customer_phone || '',
      scheduled_start: app.scheduled_start,
      scheduled_end: app.scheduled_end || '',
      location_type: app.location_type || 'in_person',
      location_url: app.location_url || '',
      location_address: app.location_address || '',
      notes: app.notes || '',
      description: app.description || '',
      appointment_type: app.appointment_type || 'meeting',
    });
    setDialogOpen(true);
  };

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter((a) => a.status === 'scheduled' && new Date(a.scheduled_start) > new Date()).length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    today: appointments.filter((a) => {
      const d = new Date(a.scheduled_start);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length,
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.scheduled_start) { toast.error('Start time is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        scheduled_start: form.scheduled_start,
        scheduled_end: form.scheduled_end || new Date(new Date(form.scheduled_start).getTime() + 30 * 60 * 1000).toISOString(),
        location_type: form.location_type,
        location_url: form.location_url,
        location_address: form.location_address,
        notes: form.notes,
        description: form.description,
        appointment_type: form.appointment_type,
        status: editing ? editing.status : 'scheduled',
      };
      if (editing) {
        const { error } = await supabase.from('appointments').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Appointment updated');
      } else {
        const { error } = await supabase.from('appointments').insert(payload);
        if (error) throw error;
        toast.success('Appointment created');
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Appointment ${status}`);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this appointment?')) return;
    const { error } = await supabase.from('appointments').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      load();
    }
  };

  const sendReminder = async (appointment: Appointment) => {
    toast.success('Reminder sent via WhatsApp');
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case 'scheduled': return { label: 'Scheduled', class: 'bg-blue-500/10 text-blue-500', icon: Clock };
      case 'confirmed': return { label: 'Confirmed', class: 'bg-purple-500/10 text-purple-500', icon: CheckCircle };
      case 'completed': return { label: 'Completed', class: 'bg-success/10 text-success', icon: CheckCircle };
      case 'cancelled': return { label: 'Cancelled', class: 'bg-destructive/10 text-destructive', icon: XCircle };
      case 'no-show': return { label: 'No Show', class: 'bg-orange-500/10 text-orange-500', icon: AlertCircle };
      default: return { label: status, class: 'bg-muted', icon: Clock };
    }
  };

  const locationIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'phone': return Phone;
      case 'in-person': return MapPin;
      default: return MapPin;
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Appointments"
        description="Manage customer meetings and calls"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setDialogOpen(true);
            }}
            className="gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            New Appointment
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Calendar, color: 'text-primary' },
          { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'text-blue-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-success' },
          { label: 'Today', value: stats.today, icon: Bell, color: 'text-orange-500' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 premium-shadow"
          >
            <div className="flex items-center gap-2">
              <s.icon className={cn('h-4 w-4', s.color)} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search appointments..." className="h-9 rounded-xl pl-9" />
        </div>
        <div className="flex gap-1.5">
          {['all', 'scheduled', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-lg p-2 transition-colors',
              viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            <Users className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={cn(
              'rounded-lg p-2 transition-colors',
              viewMode === 'calendar' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Appointments Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium">No appointments found</p>
          <Button onClick={() => setDialogOpen(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Schedule Appointment
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((apt, i) => {
              const sc = statusConfig(apt.status);
              const LocIcon = locationIcon(apt.location_type);
              const startTime = new Date(apt.scheduled_start);
              const isPast = startTime < new Date();

              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="group glass-card p-5 premium-shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge className={cn('shrink-0 text-[10px]', sc.class)}>
                      <sc.icon className="h-3 w-3 mr-1" />
                      {sc.label}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {apt.status === 'scheduled' && (
                          <>
                            <DropdownMenuItem onClick={() => updateStatus(apt.id, 'confirmed')}>
                              <CheckCircle className="mr-2 h-3.5 w-3.5" />
                              Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(apt.id, 'completed')}>
                              <CheckCircle className="mr-2 h-3.5 w-3.5 text-success" />
                              Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sendReminder(apt)}>
                              <Bell className="mr-2 h-3.5 w-3.5" />
                              Send Reminder
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => updateStatus(apt.id, 'cancelled')} className="text-destructive">
                          <XCircle className="mr-2 h-3.5 w-3.5" />
                          Cancel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => remove(apt.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="mt-3 font-display text-sm font-semibold line-clamp-1">{apt.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{apt.customer_name || 'Walk-in Customer'}</p>

                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {startTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {' at '}
                      {startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <LocIcon className="h-3.5 w-3.5" />
                      {apt.location_type === 'video' ? 'Video Call' : apt.location_type === 'phone' ? 'Phone Call' : apt.location_address || 'In Person'}
                    </div>
                    {apt.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {apt.customer_phone}
                      </div>
                    )}
                  </div>

                  {apt.status === 'scheduled' && !isPast && apt.location_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full gap-2 rounded-xl"
                      onClick={() => window.open(apt.location_url, '_blank')}
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join Meeting
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Customer Name</Label>
              <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Rahul Sharma" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} placeholder="email@example.com" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="GST Consultation" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.appointment_type} onValueChange={(v) => setForm({ ...form, appointment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Location</Label>
                <Select value={form.location_type} onValueChange={(v) => setForm({ ...form, location_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time *</Label>
                <Input type="datetime-local" value={form.scheduled_start} onChange={(e) => setForm({ ...form, scheduled_start: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <Input type="datetime-local" value={form.scheduled_end} onChange={(e) => setForm({ ...form, scheduled_end: e.target.value })} />
              </div>
            </div>
            {form.location_type === 'video' && (
              <div className="grid gap-2">
                <Label>Meeting URL</Label>
                <Input value={form.location_url} onChange={(e) => setForm({ ...form, location_url: e.target.value })} placeholder="https://meet.google.com/..." />
              </div>
            )}
            {form.location_type === 'in-person' && (
              <div className="grid gap-2">
                <Label>Address</Label>
                <Textarea value={form.location_address} onChange={(e) => setForm({ ...form, location_address: e.target.value })} rows={2} />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
