'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Phone,
  Users,
  Plus,
  Search,
  Clock,
  Check,
  CheckCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  Image,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type WaMessage = {
  id: string;
  contact_name: string;
  phone: string;
  message: string;
  direction: 'inbound' | 'outbound';
  status: string;
  message_type: string;
  created_at: string;
};

type Template = {
  id: string;
  name: string;
  content: string;
  category: string;
};

const templates: Template[] = [
  { id: '1', name: 'Welcome Message', category: 'Onboarding', content: 'Hi {name}! Welcome to WebHoster. We\'re excited to have you on board. Let us know if you need any help getting started.' },
  { id: '2', name: 'Payment Reminder', category: 'Finance', content: 'Hi {name}, this is a friendly reminder that your invoice #{invoice} of ₹{amount} is due on {date}. Please make the payment to avoid any service interruption.' },
  { id: '3', name: 'Follow-up', category: 'Sales', content: 'Hi {name}, following up on our conversation about {topic}. Would you like to proceed? I can arrange a quick call at your convenience.' },
  { id: '4', name: 'Proposal Sent', category: 'Sales', content: 'Hi {name}, I\'ve sent you a detailed proposal for {service}. Please review it at your convenience and let me know if you have any questions.' },
  { id: '5', name: 'Support Reply', category: 'Support', content: 'Hi {name}, thank you for reaching out. We\'ve received your message and our team will get back to you within 24 hours.' },
  { id: '6', name: 'Invoice Ready', category: 'Finance', content: 'Hi {name}, your invoice for {month} is ready. Total amount: ₹{amount}. You can download it from the client portal or reply to request a copy.' },
];

const statusColors: Record<string, string> = {
  sent: 'text-muted-foreground',
  delivered: 'text-accent',
  read: 'text-success',
  failed: 'text-destructive',
};

const emptyForm = {
  contact_name: '',
  phone: '',
  message: '',
};

export default function WhatsAppPage() {
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateFilter, setTemplateFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (!error) setMessages(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.contact_name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const applyTemplate = (id: string) => {
    const t = templates.find((t) => t.id === id);
    if (t) {
      setForm((f) => ({ ...f, message: t.content }));
      setSelectedTemplate(id);
    }
  };

  const send = async () => {
    if (!form.contact_name.trim()) { toast.error('Contact name is required'); return; }
    if (!form.phone.trim()) { toast.error('Phone number is required'); return; }
    if (!form.message.trim()) { toast.error('Message is required'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('whatsapp_messages').insert({
        contact_name: form.contact_name,
        phone: form.phone,
        message: form.message,
        direction: 'outbound',
        status: 'sent',
      });
      if (error) throw error;
      toast.success('Message sent');
      setComposeOpen(false);
      setForm(emptyForm);
      setSelectedTemplate('');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to send');
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    const { error } = await supabase.from('whatsapp_messages').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted');
    load();
  };

  const stats = {
    total: messages.length,
    sent: messages.filter((m) => m.direction === 'outbound').length,
    received: messages.filter((m) => m.direction === 'inbound').length,
    read: messages.filter((m) => m.status === 'read').length,
  };

  const categoryOptions = ['all', ...Array.from(new Set(templates.map((t) => t.category)))];
  const filteredTemplates = templateFilter === 'all'
    ? templates
    : templates.filter((t) => t.category === templateFilter);

  return (
    <AppShell>
      <PageHeader
        title="WhatsApp"
        description="Send messages and manage WhatsApp conversations"
        action={
          <Button onClick={() => setComposeOpen(true)} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            New Message
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Messages', value: stats.total, icon: MessageSquare, color: 'text-primary' },
          { label: 'Sent', value: stats.sent, icon: Send, color: 'text-accent' },
          { label: 'Received', value: stats.received, icon: Phone, color: 'text-success' },
          { label: 'Read', value: stats.read, icon: CheckCheck, color: 'text-warning' },
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Message log */}
        <div className="lg:col-span-2">
          <div className="mb-3 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." className="h-9 rounded-xl pl-9" />
          </div>
          <div className="glass-card overflow-hidden premium-shadow">
            {loading ? (
              <div className="space-y-0">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4">
                    <div className="h-10 w-10 rounded-full shimmer" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-1/4 rounded shimmer" />
                      <div className="h-3 w-1/2 rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <MessageSquare className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium">No messages yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Send your first WhatsApp message</p>
                <Button onClick={() => setComposeOpen(true)} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  New Message
                </Button>
              </div>
            ) : (
              <div>
                {filtered.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group flex items-start gap-3 border-b border-border/40 p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      m.direction === 'inbound' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                    )}>
                      {m.contact_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{m.contact_name}</p>
                        <span className="text-xs text-muted-foreground">{m.phone}</span>
                        <Badge variant="outline" className={cn('ml-auto shrink-0 text-[10px]', m.direction === 'inbound' ? 'border-success/40 text-success' : 'border-primary/40 text-primary')}>
                          {m.direction}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{m.message}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(m.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {m.direction === 'outbound' && (
                          <span className={cn('flex items-center gap-1 ml-1', statusColors[m.status] || statusColors.sent)}>
                            <CheckCheck className="h-3 w-3" />
                            {m.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => remove(m.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Templates panel */}
        <div>
          <h3 className="mb-3 font-display text-sm font-semibold">Message Templates</h3>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => setTemplateFilter(cat)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs transition-colors capitalize',
                  templateFilter === cat
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredTemplates.map((t) => (
              <div
                key={t.id}
                className="glass-card cursor-pointer p-3 premium-shadow transition-shadow hover:shadow-md"
                onClick={() => {
                  setForm((f) => ({ ...f, message: t.content }));
                  setComposeOpen(true);
                  setSelectedTemplate(t.id);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">{t.name}</p>
                  <Badge variant="outline" className="text-[9px]">{t.category}</Badge>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{t.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New WhatsApp Message</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Contact Name *</Label>
                <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} placeholder="Name" />
              </div>
              <div className="grid gap-2">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Template (optional)</Label>
              <Select value={selectedTemplate} onValueChange={applyTemplate}>
                <SelectTrigger><SelectValue placeholder="Choose a template..." /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Message *</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Type your message..." />
              <p className="text-xs text-muted-foreground">{form.message.length} characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button onClick={send} disabled={saving} className="gap-2">
              <Send className="h-3.5 w-3.5" />
              {saving ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
