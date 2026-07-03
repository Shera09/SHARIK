'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Webhook,
  Clock,
  AlertTriangle,
  Activity,
  Copy,
  Plus,
  Search,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Code,
  Globe,
  CheckCircle,
  XCircle,
  Shield,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  status: string;
  rate_limit: number;
  requests_count: number;
  last_used_at: string;
  created_at: string;
  expires_at: string;
};

type Webhook = {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  success_count: number;
  failure_count: number;
  last_triggered_at: string;
  created_at: string;
};

type Delivery = {
  id: string;
  event_type: string;
  success: boolean;
  response_status: number;
  duration_ms: number;
  created_at: string;
};

const eventData = [
  'invoice.created', 'invoice.paid', 'invoice.overdue', 'lead.created', 'lead.converted',
  'customer.created', 'payment.received', 'payment.failed', 'subscription.created',
  'subscription.cancelled', 'user.created', 'user.deleted', 'branch.created'
];

export default function APIPlatformPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('keys');
  const [keyDialog, setKeyDialog] = useState(false);
  const [webhookDialog, setWebhookDialog] = useState(false);
  const [keyForm, setKeyForm] = useState({ name: '', rate_limit: 1000 });
  const [webhookForm, setWebhookForm] = useState({ name: '', url: '', events: [] as string[], is_active: true });
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [keysRes, webhooksRes] = await Promise.all([
      supabase.from('api_keys').select('*').order('created_at', { ascending: false }),
      supabase.from('webhooks').select('*').order('created_at', { ascending: false }),
    ]);

    if (keysRes.data) setApiKeys(keysRes.data);
    if (webhooksRes.data) setWebhooks(webhooksRes.data);

    // Simulated deliveries
    setDeliveries([
      { id: '1', event_type: 'invoice.created', success: true, response_status: 200, duration_ms: 125, created_at: new Date().toISOString() },
      { id: '2', event_type: 'payment.received', success: true, response_status: 200, duration_ms: 89, created_at: new Date().toISOString() },
      { id: '3', event_type: 'lead.converted', success: false, response_status: 500, duration_ms: 234, created_at: new Date().toISOString() },
    ]);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateApiKey = () => {
    return 'wh_' + Array.from({ length: 32 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  };

  const createKey = async () => {
    if (!keyForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    const rawKey = generateApiKey();
    const keyPrefix = rawKey.substring(0, 12);

    const { error } = await supabase.from('api_keys').insert({
      name: keyForm.name,
      key_prefix: keyPrefix,
      key_hash: rawKey, // In production, this should be hashed
      rate_limit: keyForm.rate_limit,
      status: 'active',
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSavedKey(rawKey);
      toast.success('API key created');
      loadData();
    }
    setSaving(false);
  };

  const createWebhook = async () => {
    if (!webhookForm.name.trim() || !webhookForm.url.trim()) {
      toast.error('Name and URL are required');
      return;
    }
    setSaving(true);

    const { error } = await supabase.from('webhooks').insert({
      name: webhookForm.name,
      url: webhookForm.url,
      events: webhookForm.events,
      is_active: webhookForm.is_active,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Webhook created');
      setWebhookDialog(false);
      setWebhookForm({ name: '', url: '', events: [], is_active: true });
      loadData();
    }
    setSaving(false);
  };

  const deleteKey = async (id: string) => {
    const { error } = await supabase.from('api_keys').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('API key revoked');
      loadData();
    }
  };

  const deleteWebhook = async (id: string) => {
    const { error } = await supabase.from('webhooks').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Webhook deleted');
      loadData();
    }
  };

  const toggleWebhook = async (webhook: Webhook) => {
    const { error } = await supabase.from('webhooks').update({ is_active: !webhook.is_active }).eq('id', webhook.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(webhook.is_active ? 'Webhook disabled' : 'Webhook enabled');
      loadData();
    }
  };

  const stats = {
    totalKeys: apiKeys.length,
    activeKeys: apiKeys.filter(k => k.status === 'active').length,
    totalWebhooks: webhooks.length,
    activeWebhooks: webhooks.filter(w => w.is_active).length,
    totalRequests: apiKeys.reduce((sum, k) => sum + k.requests_count, 0),
    successRate: webhooks.length > 0
      ? Math.round((webhooks.reduce((sum, w) => sum + w.success_count, 0) / (webhooks.reduce((sum, w) => sum + w.success_count + w.failure_count, 0) || 1)) * 100)
      : 100,
  };

  return (
    <AppShell>
      <PageHeader
        title="API Platform"
        description="Manage API keys, webhooks, and integrations"
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'API Keys', value: stats.totalKeys, icon: Key, color: 'text-blue-500' },
          { label: 'Active Keys', value: stats.activeKeys, icon: Shield, color: 'text-success' },
          { label: 'Webhooks', value: stats.totalWebhooks, icon: Webhook, color: 'text-purple-500' },
          { label: 'Active Hooks', value: stats.activeWebhooks, icon: Zap, color: 'text-emerald-500' },
          { label: 'API Calls', value: stats.totalRequests.toLocaleString(), icon: Activity, color: 'text-orange-500' },
          { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle, color: 'text-cyan-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 premium-shadow"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="keys" className="rounded-lg gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="rounded-lg gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-lg gap-2">
            <Activity className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setKeyDialog(true)} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Create API Key
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No API keys</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first API key</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden premium-shadow">
              <div className="divide-y divide-border/40">
                {apiKeys.map((key, i) => (
                  <div key={key.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Key className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {key.key_prefix}...{key.last_used_at ? ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{key.requests_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">requests</p>
                      </div>
                      <Badge className={key.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted'}>
                        {key.status}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => deleteKey(key.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setWebhookDialog(true)} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Add Webhook
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
            </div>
          ) : webhooks.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No webhooks</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first webhook endpoint</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden premium-shadow">
              <div className="divide-y divide-border/40">
                {webhooks.map((hook, i) => (
                  <div key={hook.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', hook.is_active ? 'bg-success/10' : 'bg-muted')}>
                          <Webhook className={cn('h-5 w-5', hook.is_active ? 'text-success' : 'text-muted-foreground')} />
                        </div>
                        <div>
                          <p className="font-medium">{hook.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-md">{hook.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-xs">
                          <p className="text-success">{hook.success_count} success</p>
                          <p className="text-red-500">{hook.failure_count} failed</p>
                        </div>
                        <Switch checked={hook.is_active} onCheckedChange={() => toggleWebhook(hook)} />
                        <Button variant="ghost" size="icon" onClick={() => deleteWebhook(hook.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(hook.events as string[] || []).map((event) => (
                        <Badge key={event} variant="outline" className="text-[10px]">{event}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="mt-0">
          <div className="glass-card overflow-hidden premium-shadow">
            <div className="divide-y divide-border/40">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', delivery.success ? 'bg-success/10' : 'bg-red-500/10')}>
                      {delivery.success ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{delivery.event_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(delivery.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">{delivery.response_status}</Badge>
                    <span className="text-muted-foreground">{delivery.duration_ms}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create API Key Dialog */}
      <Dialog open={keyDialog} onOpenChange={setKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          {savedKey ? (
            <div className="py-4 space-y-4">
              <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                <p className="text-xs text-success mb-2">API Key Generated (save this - it won&apos;t be shown again)</p>
                <code className="text-sm font-mono break-all">{savedKey}</code>
              </div>
              <Button onClick={() => { navigator.clipboard.writeText(savedKey); toast.success('Copied!'); }} className="w-full gap-2">
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Key Name</Label>
                  <Input value={keyForm.name} onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })} placeholder="Production API Key" />
                </div>
                <div className="grid gap-2">
                  <Label>Rate Limit (requests/hour)</Label>
                  <Input type="number" value={keyForm.rate_limit} onChange={(e) => setKeyForm({ ...keyForm, rate_limit: parseInt(e.target.value) || 1000 })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setKeyDialog(false)}>Cancel</Button>
                <Button onClick={createKey} disabled={saving} className="rounded-xl">
                  {saving ? 'Creating...' : 'Create Key'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={webhookDialog} onOpenChange={setWebhookDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Webhook Name</Label>
              <Input value={webhookForm.name} onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })} placeholder="CRM Integration" />
            </div>
            <div className="grid gap-2">
              <Label>Endpoint URL</Label>
              <Input value={webhookForm.url} onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })} placeholder="https://api.example.com/webhooks" />
            </div>
            <div className="grid gap-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2">
                {eventData.map((event) => (
                  <label key={event} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookForm.events.includes(event)}
                      onChange={(e) => setWebhookForm({
                        ...webhookForm,
                        events: e.target.checked
                          ? [...webhookForm.events, event]
                          : webhookForm.events.filter((ev) => ev !== event)
                      })}
                      className="rounded border-border"
                    />
                    {event}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWebhookDialog(false)}>Cancel</Button>
            <Button onClick={createWebhook} disabled={saving} className="rounded-xl">
              {saving ? 'Creating...' : 'Create Webhook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
