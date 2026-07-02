'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Plus,
  Search,
  Send,
  Users,
  Eye,
  MousePointer,
  XCircle,
  ArrowRight,
  Clock,
  BarChart3,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  FileText,
  Calendar,
  Sparkles,
  Save,
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

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
  usage_count: number;
};

type EmailCampaign = {
  id: string;
  name: string;
  subject: string;
  body: string;
  campaign_type: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  scheduled_at: string;
  sent_at: string;
  created_at: string;
};

const campaignTypes = ['promotional', 'transactional', 'reminder', 'newsletter', 'follow_up'];

const emptyForm = {
  name: '',
  subject: '',
  body: '',
  template_id: '',
  campaign_type: 'promotional',
  recipients: '',
  scheduled_at: '',
};

export default function EmailCampaignsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmailCampaign | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [templatesRes, campaignsRes] = await Promise.all([
      supabase.from('email_templates').select('*').order('name'),
      supabase.from('email_campaigns').select('*').order('created_at', { ascending: false }),
    ]);
    if (templatesRes.data) setTemplates(templatesRes.data);
    if (campaignsRes.data) setCampaigns(campaignsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = campaigns.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter((c) => c.status === 'sent').length,
    scheduled: campaigns.filter((c) => c.status === 'scheduled').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
    totalOpened: campaigns.reduce((sum, c) => sum + c.opened_count, 0),
    totalClicked: campaigns.reduce((sum, c) => sum + c.clicked_count, 0),
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setForm({
        ...form,
        template_id: templateId,
        subject: template.subject,
        body: template.body,
      });
    }
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.subject.trim()) { toast.error('Subject is required'); return; }
    if (!form.body.trim()) { toast.error('Body is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        subject: form.subject,
        body: form.body,
        campaign_type: form.campaign_type,
        status: form.scheduled_at ? 'scheduled' : 'draft',
        scheduled_at: form.scheduled_at || null,
      };
      if (editing) {
        const { error } = await supabase.from('email_campaigns').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Campaign updated');
      } else {
        const { error } = await supabase.from('email_campaigns').insert(payload);
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

  const sendNow = async (campaign: EmailCampaign) => {
    if (!confirm('Send campaign now? This cannot be undone.')) return;
    const { error } = await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaign.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Campaign sending started');
      load();
    }
  };

  const duplicate = async (campaign: EmailCampaign) => {
    const { error } = await supabase.from('email_campaigns').insert({
      name: `${campaign.name} (Copy)`,
      subject: campaign.subject,
      body: campaign.body,
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
    const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
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
        title="Email Campaigns"
        description="Create and manage email marketing campaigns"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Campaigns', value: stats.total, icon: Mail, color: 'text-primary' },
          { label: 'Sent', value: stats.sent, icon: Send, color: 'text-success' },
          { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-blue-500' },
          { label: 'Emails Sent', value: stats.totalSent.toLocaleString(), icon: Mail, color: 'text-purple-500' },
          { label: 'Opened', value: stats.totalOpened.toLocaleString(), icon: Eye, color: 'text-orange-500' },
          { label: 'Clicked', value: stats.totalClicked.toLocaleString(), icon: MousePointer, color: 'text-pink-500' },
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
                  ? 'bg-primary text-primary-foreground'
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
            <div key={i} className="h-48 rounded-2xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto">
            <Mail className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">No campaigns found</p>
          <p className="mt-1 text-xs text-muted-foreground">Create your first email campaign</p>
          <Button onClick={openAdd} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((campaign, i) => {
              const sc = statusConfig(campaign.status);
              const openRate = campaign.sent_count > 0 ? Math.round((campaign.opened_count / campaign.sent_count) * 100) : 0;
              const clickRate = campaign.opened_count > 0 ? Math.round((campaign.clicked_count / campaign.opened_count) * 100) : 0;

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
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{campaign.subject}</p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {campaign.total_recipients || 0} recipients
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {campaign.sent_count} sent
                    </span>
                  </div>

                  {campaign.status === 'sent' && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground">Open Rate</p>
                        <p className="mt-0.5 font-semibold text-sm">{openRate}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground">Click Rate</p>
                        <p className="mt-0.5 font-semibold text-sm">{clickRate}%</p>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Campaign' : 'New Email Campaign'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Campaign Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Monthly Newsletter" />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label>Template</Label>
                <Select value={form.template_id} onValueChange={applyTemplate}>
                  <SelectTrigger><SelectValue placeholder="Select template..." /></SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Subject *</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Email subject line" />
            </div>
            <div className="grid gap-2">
              <Label>Body *</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={10}
                placeholder="<h1>Hello {name}</h1><p>Your content here...</p>"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Use {'{name}'}, {'{company}'} etc. for personalization</p>
            </div>
            <div className="grid gap-2">
              <Label>Schedule (optional)</Label>
              <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
