'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Zap,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Database,
  Mail,
  MessageSquare,
  CreditCard,
  Webhook,
  Play,
  Pause,
  Settings,
  Eye,
  ArrowRight,
  Activity,
  UserPlus,
  Users,
  FileText,
  File,
  Calendar,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type DomainEvent = {
  id: string;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  payload: any;
  metadata: any;
  status: string;
  retry_count: number;
  error_message: string;
  processed_at: string;
  created_at: string;
};

type EventSubscription = {
  id: string;
  subscriber_name: string;
  event_types: string[];
  webhook_url: string;
  is_active: boolean;
  retry_policy: any;
  created_at: string;
};

type IntegrationConnector = {
  id: string;
  name: string;
  type: string;
  provider: string;
  config: any;
  status: string;
  last_sync_at: string;
  sync_frequency_minutes: number;
  created_at: string;
};

type SyncJob = {
  id: string;
  connector_id: string;
  job_type: string;
  status: string;
  records_processed: number;
  records_failed: number;
  error_message: string;
  started_at: string;
  completed_at: string;
};

const eventTypeIcons: Record<string, typeof Globe> = {
  LeadCreated: UserPlus,
  LeadAssigned: UserPlus,
  LeadConverted: CheckCircle,
  CustomerCreated: Users,
  InvoiceGenerated: FileText,
  InvoicePaid: CreditCard,
  PaymentFailed: XCircle,
  DocumentUploaded: FileText,
  WorkflowCompleted: CheckCircle,
  TaskAssigned: CheckCircle,
  AppointmentBooked: Calendar,
  AIConversationStarted: MessageSquare,
  KnowledgeBaseUpdated: Database,
  SubscriptionRenewed: RefreshCw,
  SecurityAlertTriggered: AlertTriangle,
};

const connectorTypeIcons: Record<string, typeof Globe> = {
  payment: CreditCard,
  messaging: MessageSquare,
  email: Mail,
  crm: Users,
  storage: Database,
  analytics: BarChart3,
  ai_provider: Zap,
};

export default function EventBusPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<DomainEvent[]>([]);
  const [subscriptions, setSubscriptions] = useState<EventSubscription[]>([]);
  const [connectors, setConnectors] = useState<IntegrationConnector[]>([]);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DomainEvent | null>(null);
  const [eventDialog, setEventDialog] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [eventsRes, subsRes, connectorsRes, jobsRes] = await Promise.all([
      supabase.from('domain_events').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('event_subscriptions').select('*'),
      supabase.from('integration_connectors').select('*'),
      supabase.from('sync_jobs').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    if (eventsRes.data) setEvents(eventsRes.data);
    if (subsRes.data) setSubscriptions(subsRes.data);
    if (connectorsRes.data) setConnectors(connectorsRes.data);
    if (jobsRes.data) setSyncJobs(jobsRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const retryEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('domain_events')
      .update({ status: 'retrying', retry_count: 0 })
      .eq('id', eventId);

    if (error) toast.error(error.message);
    else {
      toast.success('Event queued for retry');
      loadData();
    }
  };

  // Stats
  const pendingEvents = events.filter(e => e.status === 'pending').length;
  const processedEvents = events.filter(e => e.status === 'processed').length;
  const failedEvents = events.filter(e => e.status === 'failed').length;
  const activeSubscriptions = subscriptions.filter(s => s.is_active).length;

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.event_type.toLowerCase().includes(search.toLowerCase()) ||
                          e.aggregate_type?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'processed': return { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle };
      case 'pending': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock };
      case 'failed': return { color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle };
      case 'retrying': return { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: RefreshCw };
      default: return { color: 'text-muted-foreground', bg: 'bg-muted', icon: Clock };
    }
  };

  const getConnectorStatusStyle = (status: string) => {
    switch (status) {
      case 'connected': return { color: 'text-success', bg: 'bg-success/10' };
      case 'syncing': return { color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'error': return { color: 'text-destructive', bg: 'bg-destructive/10' };
      default: return { color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Event Bus & Integrations"
        description="Central event system and external integrations"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Events</span>
          </div>
          <p className="text-2xl font-bold">{events.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <p className="text-2xl font-bold">{pendingEvents}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Processed</span>
          </div>
          <p className="text-2xl font-bold">{processedEvents}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Failed</span>
          </div>
          <p className="text-2xl font-bold">{failedEvents}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Webhook className="h-4 w-4 text-cyan-500" />
            <span className="text-xs text-muted-foreground">Subscriptions</span>
          </div>
          <p className="text-2xl font-bold">{activeSubscriptions}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Connectors</span>
          </div>
          <p className="text-2xl font-bold">{connectors.length}</p>
        </motion.div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="events" className="rounded-lg">Event Stream</TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-lg">Subscriptions</TabsTrigger>
          <TabsTrigger value="connectors" className="rounded-lg">Integrations</TabsTrigger>
          <TabsTrigger value="jobs" className="rounded-lg">Sync Jobs</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-0">
          <div className="glass-card p-4 premium-shadow">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="pl-9" />
              </div>
              <div className="flex gap-1.5">
                {['all', 'pending', 'processed', 'failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                      statusFilter === status ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-lg shimmer" />)}</div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">No events found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredEvents.slice(0, 50).map((event, i) => {
                  const style = getStatusStyle(event.status);
                  const Icon = style.icon;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => { setSelectedEvent(event); setEventDialog(true); }}
                    >
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', style.bg)}>
                        <Icon className={cn('h-4 w-4', style.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm truncate">{event.event_type}</span>
                          <Badge variant="outline" className="text-[9px]">{event.aggregate_type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          ID: {event.aggregate_id?.slice(0, 8)}... • Retry: {event.retry_count}
                        </p>
                      </div>
                      {event.status === 'failed' && (
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); retryEvent(event.id); }}>
                          Retry
                        </Button>
                      )}
                      <span className="text-xs text-muted-foreground w-24 shrink-0 text-right">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-4 premium-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{sub.subscriber_name}</h3>
                  <Badge className={sub.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                    {sub.is_active ? 'Active' : 'Paused'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Event Types</p>
                    <div className="flex flex-wrap gap-1">
                      {sub.event_types?.slice(0, 3).map((type: string) => (
                        <Badge key={type} variant="outline" className="text-[9px]">{type}</Badge>
                      ))}
                      {sub.event_types?.length > 3 && (
                        <Badge variant="outline" className="text-[9px]">+{sub.event_types.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                  {sub.webhook_url && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Webhook</p>
                      <p className="text-xs truncate">{sub.webhook_url}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Settings className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {subscriptions.length === 0 && !loading && (
            <div className="glass-card p-8 text-center">
              <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No subscriptions</p>
              <p className="text-sm text-muted-foreground">Create subscriptions to receive events</p>
            </div>
          )}
        </TabsContent>

        {/* Connectors Tab */}
        <TabsContent value="connectors" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map((connector, i) => {
              const style = getConnectorStatusStyle(connector.status);
              const Icon = connectorTypeIcons[connector.type] || Globe;

              return (
                <motion.div
                  key={connector.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card p-4 premium-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', style.bg)}>
                        <Icon className={cn('h-4 w-4', style.color)} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{connector.name}</h3>
                        <p className="text-[10px] text-muted-foreground capitalize">{connector.provider}</p>
                      </div>
                    </div>
                    <Badge className={cn('text-[10px]', style.bg, style.color)}>
                      {connector.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 capitalize">{connector.type} integration</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last sync: {connector.last_sync_at ? new Date(connector.last_sync_at).toLocaleDateString() : 'Never'}</span>
                    <span>Every {connector.sync_frequency_minutes}m</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1">
                      <Settings className="h-3 w-3" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Sync
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Sync Jobs Tab */}
        <TabsContent value="jobs" className="mt-0">
          <div className="glass-card p-4 premium-shadow">
            <h3 className="font-semibold mb-4">Recent Sync Jobs</h3>
            {syncJobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sync jobs yet</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {syncJobs.map((job, i) => (
                  <div key={job.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      job.status === 'completed' ? 'bg-success/10' :
                      job.status === 'running' ? 'bg-blue-500/10' :
                      job.status === 'failed' ? 'bg-destructive/10' :
                      'bg-muted'
                    )}>
                      {job.status === 'completed' ? <CheckCircle className="h-4 w-4 text-success" /> :
                       job.status === 'running' ? <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" /> :
                       job.status === 'failed' ? <XCircle className="h-4 w-4 text-destructive" /> :
                       <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{job.job_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.records_processed} processed • {job.records_failed} failed
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{job.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Detail Dialog */}
      <Dialog open={eventDialog} onOpenChange={setEventDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.event_type}
              <Badge variant="outline" className="text-[10px]">{selectedEvent?.status}</Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Aggregate Type</p>
                  <p className="font-medium capitalize">{selectedEvent.aggregate_type}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Aggregate ID</p>
                  <p className="font-medium text-xs truncate">{selectedEvent.aggregate_id}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Payload</p>
                <pre className="p-4 rounded-lg bg-muted text-xs whitespace-pre-wrap font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Metadata</p>
                <pre className="p-4 rounded-lg bg-muted text-xs whitespace-pre-wrap font-mono overflow-x-auto max-h-32">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Created: {new Date(selectedEvent.created_at).toLocaleString()}</span>
                {selectedEvent.processed_at && (
                  <span>Processed: {new Date(selectedEvent.processed_at).toLocaleString()}</span>
                )}
              </div>

              {selectedEvent.error_message && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="text-xs font-medium text-destructive">Error</p>
                  <p className="text-xs text-muted-foreground">{selectedEvent.error_message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
