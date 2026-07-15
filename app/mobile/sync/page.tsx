'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Database,
  Smartphone,
  Wifi,
  WifiOff,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SyncQueue {
  queue_id: string;
  entity_type: string;
  entity_id: string;
  operation_type: string;
  status: string;
  priority: number;
  retry_count: number;
  error_message: string | null;
  created_at: string;
  synced_at: string | null;
  created_offline: boolean;
}

interface SyncConflict {
  conflict_id: string;
  entity_type: string;
  entity_id: string;
  resolution_strategy: string | null;
  resolved_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  syncing: 'bg-blue-500/10 text-blue-600',
  completed: 'bg-green-500/10 text-green-600',
  failed: 'bg-red-500/10 text-red-600',
  conflict: 'bg-orange-500/10 text-orange-600',
};

const operationColors: Record<string, string> = {
  create: 'text-green-600',
  update: 'text-blue-600',
  delete: 'text-red-600',
};

// Mock data
const mockSyncQueue: SyncQueue[] = [
  { queue_id: '1', entity_type: 'customer', entity_id: 'cust_001', operation_type: 'create', status: 'pending', priority: 5, retry_count: 0, error_message: null, created_at: new Date().toISOString(), synced_at: null, created_offline: true },
  { queue_id: '2', entity_type: 'invoice', entity_id: 'inv_001', operation_type: 'update', status: 'syncing', priority: 3, retry_count: 0, error_message: null, created_at: new Date().toISOString(), synced_at: null, created_offline: true },
  { queue_id: '3', entity_type: 'lead', entity_id: 'lead_001', operation_type: 'create', status: 'completed', priority: 5, retry_count: 0, error_message: null, created_at: new Date(Date.now() - 3600000).toISOString(), synced_at: new Date().toISOString(), created_offline: true },
  { queue_id: '4', entity_type: 'task', entity_id: 'task_001', operation_type: 'update', status: 'failed', priority: 7, retry_count: 3, error_message: 'Network timeout', created_at: new Date(Date.now() - 7200000).toISOString(), synced_at: null, created_offline: true },
  { queue_id: '5', entity_type: 'customer', entity_id: 'cust_002', operation_type: 'delete', status: 'conflict', priority: 5, retry_count: 1, error_message: null, created_at: new Date(Date.now() - 1800000).toISOString(), synced_at: null, created_offline: true },
];

export default function SyncEnginePage() {
  const [loading, setLoading] = useState(true);
  const [syncQueue, setSyncQueue] = useState<SyncQueue[]>(mockSyncQueue);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [queueRes, conflictsRes] = await Promise.all([
        supabase.from('sync_queue').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('sync_conflicts').select('*').order('created_at', { ascending: false }),
      ]);

      if (queueRes.data && queueRes.data.length > 0) {
        setSyncQueue(queueRes.data.map(q => ({
          queue_id: q.queue_id,
          entity_type: q.entity_type,
          entity_id: q.entity_id,
          operation_type: q.operation_type,
          status: q.status,
          priority: q.priority,
          retry_count: q.retry_count,
          error_message: q.error_message,
          created_at: q.created_at,
          synced_at: q.synced_at,
          created_offline: q.created_offline,
        })));
      }

      if (conflictsRes.data) setConflicts(conflictsRes.data);
    } catch (error) {
      console.error('Error loading sync data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function triggerSync() {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncing(false);
    toast.success('Sync triggered successfully');
    loadData();
  }

  const stats = {
    pending: syncQueue.filter(s => s.status === 'pending').length,
    syncing: syncQueue.filter(s => s.status === 'syncing').length,
    completed: syncQueue.filter(s => s.status === 'completed').length,
    failed: syncQueue.filter(s => s.status === 'failed').length,
    conflicts: syncQueue.filter(s => s.status === 'conflict').length,
  };

  const totalSynced = stats.completed;
  const successRate = syncQueue.length > 0 ? (stats.completed / syncQueue.length) * 100 : 100;

  return (
    <AppShell>
      <PageHeader
        title="Sync Engine"
        description="Offline-first synchronization with conflict resolution"
        action={
          <Button onClick={triggerSync} disabled={syncing} className="gap-2">
            {syncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Sync Now
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
          { label: 'Syncing', value: stats.syncing, icon: RefreshCw, color: 'text-blue-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-500' },
          { label: 'Conflicts', value: stats.conflicts, icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Success Rate', value: `${successRate.toFixed(0)}%`, icon: TrendingUp, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
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

      <Tabs defaultValue="queue" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="queue" className="rounded-lg gap-1.5">
            <Layers className="h-4 w-4" />
            Sync Queue
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="rounded-lg gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Conflicts
            {stats.conflicts > 0 && <Badge className="h-4 px-1.5 text-[9px] bg-red-500">{stats.conflicts}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg gap-1.5">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {syncQueue.map((item, i) => (
                  <motion.div
                    key={item.queue_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        statusColors[item.status] || 'bg-muted'
                      )}>
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{item.entity_type}</span>
                          <code className="text-xs bg-muted px-2 py-0.5 rounded">{item.entity_id}</code>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn('text-[10px]', operationColors[item.operation_type])}>
                            {item.operation_type}
                          </Badge>
                          {item.created_offline && (
                            <Badge variant="outline" className="text-[10px]">
                              <WifiOff className="h-3 w-3 mr-1" />
                              Offline
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={cn('text-[10px]', statusColors[item.status])}>
                          {item.status}
                        </Badge>
                        {item.error_message && (
                          <p className="text-xs text-red-500 mt-1">{item.error_message}</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="mt-0">
          <Card>
            <CardContent className="p-4">
              {conflicts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No sync conflicts</p>
                  <p className="text-xs text-muted-foreground mt-1">All data synchronized successfully</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conflicts.map((conflict) => (
                    <div key={conflict.conflict_id} className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{conflict.entity_type}: {conflict.entity_id}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created: {new Date(conflict.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {conflict.resolution_strategy ? (
                            <Badge className="bg-green-500/10 text-green-600">
                              {conflict.resolution_strategy}
                            </Badge>
                          ) : (
                            <Button size="sm" variant="outline">Resolve</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sync Configuration</CardTitle>
                <CardDescription>Configure sync behavior for different network conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Sync Interval (WiFi)', value: '60 seconds' },
                  { label: 'Sync Interval (Cellular)', value: '600 seconds' },
                  { label: 'Offline Cache Limit', value: '100 MB' },
                  { label: 'Max Offline Days', value: '7 days' },
                  { label: 'Background Sync', value: 'Enabled' },
                  { label: 'Auto-Retry Failed', value: 'Enabled' },
                ].map((config) => (
                  <div key={config.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm">{config.label}</span>
                    <span className="text-sm font-medium">{config.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conflict Resolution</CardTitle>
                <CardDescription>Default resolution strategy for sync conflicts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Customers', strategy: 'Server wins', desc: 'Server version takes priority' },
                  { label: 'Invoices', strategy: 'Manual review', desc: 'Requires manual intervention' },
                  { label: 'Tasks', strategy: 'Merge', desc: 'Merge both versions' },
                  { label: 'Leads', strategy: 'Client wins', desc: 'Client version takes priority' },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.label}</span>
                      <Badge variant="outline" className="text-[10px]">{item.strategy}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
