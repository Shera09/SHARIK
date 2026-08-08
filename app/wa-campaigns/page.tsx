'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Users,
  Eye,
  CheckCheck,
  Clock,
  MoreHorizontal,
  Trash2,
  Copy,
  Calendar,
  Phone,
  XCircle,
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

type WACampaign = {
  id: string;
  name: string;
  message: string;
  campaign_type: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  scheduled_at: string;
  sent_at: string;
  created_at: string;
};

const campaignTypes = ['promotional', 'transactional', 'reminder', 'festival', 'follow_up', 'renewal'];

const emptyForm = {
  name: '',
  message: '',
  campaign_type: 'promotional',
  recipients: '',
  scheduled_at: '',
};

export default function WACampaignsPage() {
  const [campaigns, setCampaigns] = useState<WACampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WACampaign | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('whatsapp_campaigns')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (!error) setCampaigns(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = campaigns.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(q) || c.message.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter((c) => c.status === 'sent').length,
    scheduled: campaigns.filter((c) => c.status === 'scheduled').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
    totalDelivered: campaigns.reduce((sum, c) => sum + c.delivered_count, 0),
    totalRead: campaigns.reduce((sum, c) => sum + c.read_count, 0),
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (campaign: WACampaign) => {
    setEditing(campaign);
    setForm({
      name: campaign.name,
      message: campaign.message,
      campaign_type: campaign.campaign_type || 'promotional',
      scheduled_at: campaign.scheduled_at || '',
      recipients: '',
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Campaign name is required'); return; }
    if (!form.message.trim()) { toast.error('Message is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        message: form.message.trim(),
        campaign_type: form.campaign_type,
        scheduled_at: form.scheduled_at || null,
        status: form.scheduled_at ? 'scheduled' : 'draft',
      };
      if (editing) {
        const { error } = await supabase.from('whatsapp_campaigns').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Campaign updated');
      } else {
        const { error } = await supabase.from('whatsapp_campaigns').insert(payload);
        if (error) throw error;
        toast.success('Campaign created');
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const sendNow = async (campaign: WACampaign) => {
    if (!confirm(`Send "${campaign.name}" now?`)) return;
    const { error } = await supabase
      .from('whatsapp_campaigns')
      .update({ status: 'sending', sent_count: 1 })
      .eq('id', campaign.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Campaign sending started');
      load();
    }
  };

  const duplicate = async (campaign: WACampaign) => {
    const { error } = await supabase.from('whatsapp_campaigns').insert({
      name: `${campaign.name} (Copy)`,
      message: campaign.message,
      campaign_type: campaign.campaign_type,
      status: 'draft',
    });
    if (error) toast.error(error.message);
    else {
      toast.success('Campaign duplicated');
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    const { error } = await supabase.from('whatsapp_campaigns').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      load();
    }
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case 'draft': return { label: 'Draft', class: 'bg-muted text-muted-foreground' };
      case 'scheduled': return { label: 'Scheduled', class: 'bg-blue-500/10 text-blue-500' };
      case 'sending': return { label: 'Sending', class: 'bg-yellow-500/10 text-yellow-500' };
      case 'sent': return { label: 'Sent', class: 'bg-success/10 text-success' };
      default: return { label: status, class: 'bg-muted' };
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="WhatsApp Campaigns"
        description="Send bulk WhatsApp messages to your customers"
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
            New Campaign
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Campaigns', value: stats.total, icon: MessageSquare, color: 'text-green-500' },
          { label: 'Sent', value: stats.sent, icon: Send, color: 'text-success' },
          { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-blue-500' },
          { label: 'Messages Sent', value: stats.totalSent.toLocaleString(), icon: MessageSquare, color: 'text-purple-500' },
          { label: 'Delivered', value: stats.totalDelivered.toLocaleString(), icon: CheckCheck, color: 'text-orange-500' },
          { label: 'Read', value: stats.totalRead.toLocaleString(), icon: Eye, color: 'text-cyan-500' },
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
            <p className="mt-2 font-display text-xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns..." className="h-9 rounded-xl pl-9" />
        </div>
        <div className="flex gap-1.5">
          {['all', 'draft', 'scheduled', 'sent'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                statusFilter === s
                  ? 'bg-green-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 mx-auto">
            <MessageSquare className="h-7 w-7 text-green-500" />
          </div>
          <p className="mt-4 text-sm font-medium">No campaigns found</p>
          <p className="mt-1 text-xs text-muted-foreground">Create your first WhatsApp campaign</p>
          <Button onClick={() => setDialogOpen(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((campaign, i) => {
              const sc = statusConfig(campaign.status);
              const deliveryRate = campaign.sent_count > 0 ? Math.round((campaign.delivered_count / campaign.sent_count) * 100) : 0;
              const readRate = campaign.delivered_count > 0 ? Math.round((campaign.read_count / campaign.delivered_count) * 100) : 0;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="group glass-card p-5 premium-shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge className={cn('shrink-0 text-[10px]', sc.class)}>{sc.label}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {campaign.status === 'draft' && (
                          <DropdownMenuItem onClick={() => sendNow(campaign)}>
                            <Send className="mr-2 h-3.5 w-3.5" />
                            Send Now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => duplicate(campaign)}>
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => remove(campaign.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="mt-3 font-display text-sm font-semibold line-clamp-1">{campaign.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{campaign.message}</p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {campaign.total_recipients || 0} recipients
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {campaign.sent_count} sent
                    </span>
                  </div>

                  {campaign.status === 'sent' && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground">Delivered</p>
                        <p className="mt-0.5 font-semibold text-sm">{deliveryRate}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground">Read Rate</p>
                        <p className="mt-0.5 font-semibold text-sm">{readRate}%</p>
                      </div>
                    </div>
                  )}

                  {campaign.scheduled_at && campaign.status === 'scheduled' && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(campaign.scheduled_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
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
            <DialogTitle>{editing ? 'Edit Campaign' : 'New WhatsApp Campaign'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Campaign Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Launch" />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.campaign_type} onValueChange={(v) => setForm({ ...form, campaign_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {campaignTypes.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Message *</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                placeholder="Hi {name}! Check out our latest offerings..."
              />
              <p className="text-xs text-muted-foreground">{form.message.length} characters</p>
            </div>
            <div className="grid gap-2">
              <Label>Schedule (optional)</Label>
              <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="gap-2 bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4" />
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
