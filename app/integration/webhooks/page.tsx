'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Webhook,
  Plus,
  Search,
  Send,
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Trash2,
  Filter,
  ArrowRight,
  Activity,
  GitBranch,
  Shield,
  Copy,
  Globe,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WebhookConfig {
  webhook_id: string;
  name: string;
  url: string;
  events: string[];
  headers: Record<string, string>;
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  created_at: string;
}

interface WebhookDelivery {
  delivery_id: string;
  webhook_id: string;
  event_type: string;
  status: string;
  response_code: number | null;
  attempt_count: number;
  delivered_at: string | null;
  next_retry_at: string | null;
  created_at: string;
}

interface IncomingWebhook {
  webhook_id: string;
  name: string;
  source: string;
  endpoint_path: string;
  secret_header: string | null;
  is_active: boolean;
  created_at: string;
}

const eventTypes = [
  'customer.created', 'customer.updated', 'customer.deleted',
  'invoice.created', 'invoice.paid', 'invoice.voided',
  'lead.created', 'lead.converted', 'lead.lost',
  'payment.received', 'payment.failed',
  'task.created', 'task.completed',
];

const statusColors: Record<string, string> = {
  delivered: 'bg-green-500/10 text-green-600',
  pending: 'bg-yellow-500/10 text-yellow-600',
  failed: 'bg-red-500/10 text-red-600',
  retrying: 'bg-orange-500/10 text-orange-600',
};

export default function WebhooksPage() {
  const [loading, setLoading] = useState(true);
  const [outgoingWebhooks, setOutgoingWebhooks] = useState<WebhookConfig[]>([]);
  const [incomingWebhooks, setIncomingWebhooks] = useState<IncomingWebhook[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [outgoingRes, incomingRes, deliveriesRes] = await Promise.all([
        supabase.from('webhooks').select('*').order('created_at', { ascending: false }),
        supabase.from('incoming_webhooks').select('*').order('created_at', { ascending: false }),
        supabase.from('webhook_deliveries').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (outgoingRes.data) setOutgoingWebhooks(outgoingRes.data);
      if (incomingRes.data) setIncomingWebhooks(incomingRes.data);
      if (deliveriesRes.data) setDeliveries(deliveriesRes.data);
    } catch (error) {
      console.error('Error loading webhooks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createWebhook() {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          name: newWebhook.name,
          url: newWebhook.url,
          events: newWebhook.events,
          is_active: true,
          retry_count: 3,
          timeout_seconds: 30,
        })
        .select()
        .single();

      if (error) throw error;
      setOutgoingWebhooks([...outgoingWebhooks, data]);
      setCreateDialogOpen(false);
      setNewWebhook({ name: '', url: '', events: [] });
      toast.success('Webhook created');
    } catch (error) {
      toast.error('Failed to create webhook');
    }
  }

  async function toggleWebhook(webhookId: string, currentState: boolean) {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: !currentState })
        .eq('webhook_id', webhookId);

      if (error) throw error;
      setOutgoingWebhooks(outgoingWebhooks.map(w =>
        w.webhook_id === webhookId ? { ...w, is_active: !currentState } : w
      ));
      toast.success(currentState ? 'Webhook disabled' : 'Webhook enabled');
    } catch (error) {
      toast.error('Failed to update webhook');
    }
  }

  const stats = {
    total: outgoingWebhooks.length,
    active: outgoingWebhooks.filter(w => w.is_active).length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    failed: deliveries.filter(d => d.status === 'failed').length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Webhook Management"
        description="Configure outgoing webhooks and handle incoming webhooks"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Outgoing Webhook</DialogTitle>
                <DialogDescription>
                  Configure a new webhook endpoint for event notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="e.g., Sync to CRM"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Endpoint URL</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="https://api.example.com/webhooks"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Events to Subscribe</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {eventTypes.map((event) => (
                      <button
                        key={event}
                        onClick={() => {
                          const events = newWebhook.events.includes(event)
                            ? newWebhook.events.filter(e => e !== event)
                            : [...newWebhook.events, event];
                          setNewWebhook({ ...newWebhook, events });
                        }}
                        className={cn(
                          'px-2 py-1.5 rounded-lg text-xs font-medium transition-colors',
                          newWebhook.events.includes(event)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        )}
                      >
                        {event.split('.')[1]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={createWebhook}>Create Webhook</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Webhooks', value: stats.total, icon: Webhook, color: 'text-blue-500' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Delivered Today', value: stats.delivered, icon: Send, color: 'text-purple-500' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="outgoing" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="outgoing" className="rounded-lg gap-1.5">
            <Send className="h-4 w-4" />
            Outgoing
          </TabsTrigger>
          <TabsTrigger value="incoming" className="rounded-lg gap-1.5">
            <Inbox className="h-4 w-4" />
            Incoming
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="rounded-lg gap-1.5">
            <Activity className="h-4 w-4" />
            Delivery Log
          </TabsTrigger>
        </TabsList>

        {/* Outgoing Webhooks */}
        <TabsContent value="outgoing" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-lg shimmer" />)}
                </div>
              ) : outgoingWebhooks.length === 0 ? (
                <div className="text-center py-12">
                  <Webhook className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No webhooks configured</p>
                  <Button variant="outline" className="mt-4 gap-2" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Create your first webhook
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outgoingWebhooks.map((webhook, i) => (
                      <motion.tr
                        key={webhook.webhook_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="group"
                      >
                        <TableCell className="font-medium">{webhook.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px] block">
                            {webhook.url}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.slice(0, 3).map((event) => (
                              <Badge key={event} variant="outline" className="text-[10px]">
                                {event}
                              </Badge>
                            ))}
                            {webhook.events.length > 3 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{webhook.events.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            webhook.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                          )}>
                            {webhook.is_active ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(webhook.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => toggleWebhook(webhook.webhook_id, webhook.is_active)}
                            >
                              {webhook.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incoming Webhooks */}
        <TabsContent value="incoming" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Incoming Webhooks</CardTitle>
              <CardDescription>External services can send events to these endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              {incomingWebhooks.length === 0 ? (
                <div className="text-center py-8">
                  <Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No incoming webhooks configured</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingWebhooks.map((webhook) => (
                    <div
                      key={webhook.webhook_id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Inbox className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">{webhook.name}</p>
                          <p className="text-sm text-muted-foreground">{webhook.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          POST /hooks/{webhook.endpoint_path}
                        </code>
                        <Badge className={cn(
                          webhook.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                        )}>
                          {webhook.is_active ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Log */}
        <TabsContent value="deliveries" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {deliveries.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No delivery logs yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((delivery, i) => (
                      <motion.tr
                        key={delivery.delivery_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{delivery.event_type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{delivery.webhook_id}</TableCell>
                        <TableCell>
                          <Badge className={cn('text-[10px]', statusColors[delivery.status])}>
                            {delivery.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {delivery.response_code || '-'}
                        </TableCell>
                        <TableCell>{delivery.attempt_count}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(delivery.created_at).toLocaleString()}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
