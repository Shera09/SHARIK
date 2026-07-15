'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plug,
  Plus,
  Search,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Video,
  DollarSign,
  FileText,
  Users,
  Shield,
  Calendar,
  TrendingUp,
  BarChart3,
  Zap,
  Store,
  Database,
  Brain,
  ArrowRight,
  Repeat,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ConnectorType {
  type_id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  auth_type: string;
  is_popular: boolean;
}

interface InstalledConnector {
  connector_id: string;
  name: string;
  connector_type: string;
  is_active: boolean;
  last_sync: string | null;
  sync_status: string;
  records_synced: number;
  health_status: string;
}

interface SyncJob {
  job_id: string;
  connector_id: string;
  status: string;
  records_processed: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

const categoryIcons: Record<string, typeof Plug> = {
  communication: MessageSquare,
  payment: DollarSign,
  document: FileText,
  identity: Users,
  accounting: BarChart3,
  productivity: Calendar,
  marketing: TrendingUp,
  search: Database,
};

const statusColors: Record<string, string> = {
  connected: 'bg-green-500/10 text-green-600',
  disconnected: 'bg-red-500/10 text-red-600',
  syncing: 'bg-blue-500/10 text-blue-600',
  error: 'bg-red-500/10 text-red-600',
};

// Mock installed connectors
const mockConnectors: InstalledConnector[] = [
  { connector_id: '1', name: 'WhatsApp Business', connector_type: 'whatsapp', is_active: true, last_sync: new Date().toISOString(), sync_status: 'completed', records_synced: 15420, health_status: 'healthy' },
  { connector_id: '2', name: 'Razorpay Payments', connector_type: 'razorpay', is_active: true, last_sync: new Date().toISOString(), sync_status: 'completed', records_synced: 8923, health_status: 'healthy' },
  { connector_id: '3', name: 'Google Workspace', connector_type: 'google', is_active: true, last_sync: new Date().toISOString(), sync_status: 'completed', records_synced: 2341, health_status: 'healthy' },
  { connector_id: '4', name: 'Slack Integration', connector_type: 'slack', is_active: true, last_sync: new Date(Date.now() - 3600000).toISOString(), sync_status: 'completed', records_synced: 5672, health_status: 'degraded' },
  { connector_id: '5', name: 'Gmail Connector', connector_type: 'gmail', is_active: false, last_sync: null, sync_status: 'idle', records_synced: 0, health_status: 'offline' },
];

const iconMap: Record<string, typeof Plug> = {
  whatsapp: MessageSquare,
  razorpay: DollarSign,
  google: Globe,
  slack: MessageSquare,
  gmail: Mail,
};

export default function ConnectorsPage() {
  const [loading, setLoading] = useState(true);
  const [connectorTypes, setConnectorTypes] = useState<ConnectorType[]>([]);
  const [installedConnectors, setInstalledConnectors] = useState<InstalledConnector[]>(mockConnectors);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingConnector, setSyncingConnector] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: types } = await supabase
        .from('connector_types')
        .select('*')
        .order('category')
        .order('name');

      if (types) setConnectorTypes(types);

      const { data: connectors } = await supabase
        .from('connectors')
        .select('*')
        .order('created_at', { ascending: false });

      if (connectors && connectors.length > 0) setInstalledConnectors(connectors);
    } catch (error) {
      console.error('Error loading connectors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function syncConnector(connectorId: string) {
    setSyncingConnector(connectorId);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate sync
      toast.success('Connector synced successfully');
      loadData();
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncingConnector(null);
    }
  }

  const healthyCount = installedConnectors.filter(c => c.health_status === 'healthy').length;
  const totalRecords = installedConnectors.reduce((sum, c) => sum + c.records_synced, 0);

  const connectorsByCategory = installedConnectors.reduce((acc, connector) => {
    const type = connectorTypes.find(t => t.type_id === connector.connector_type);
    const category = type?.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(connector);
    return acc;
  }, {} as Record<string, InstalledConnector[]>);

  return (
    <AppShell>
      <PageHeader
        title="Connectors"
        description="Manage installed integrations and sync status"
        action={
          <Link href="/integration/marketplace">
            <Button className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Add Connector
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { label: 'Installed', value: installedConnectors.length, icon: Plug, color: 'text-blue-500' },
          { label: 'Active', value: installedConnectors.filter(c => c.is_active).length, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Healthy', value: healthyCount, icon: Activity, color: 'text-emerald-500' },
          { label: 'Total Records', value: totalRecords.toLocaleString(), icon: Database, color: 'text-purple-500' },
          { label: 'Last Sync', value: '2 min ago', icon: Clock, color: 'text-orange-500' },
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

      {/* Installed Connectors */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Installed Connectors</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-xl shimmer" />)}
          </div>
        ) : installedConnectors.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Plug className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No connectors installed</p>
              <Link href="/integration/marketplace">
                <Button className="gap-2">
                  <Store className="h-4 w-4" />
                  Browse Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {installedConnectors.map((connector, i) => {
              const Icon = iconMap[connector.connector_type] || Plug;
              const healthColor = connector.health_status === 'healthy' ? 'text-green-500' :
                                  connector.health_status === 'degraded' ? 'text-yellow-500' : 'text-red-500';

              return (
                <motion.div
                  key={connector.connector_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className={cn('h-1',
                      connector.health_status === 'healthy' && 'bg-green-500',
                      connector.health_status === 'degraded' && 'bg-yellow-500',
                      connector.health_status === 'offline' && 'bg-red-500',
                    )} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-sm">{connector.name}</CardTitle>
                            <p className="text-xs text-muted-foreground capitalize">{connector.connector_type}</p>
                          </div>
                        </div>
                        <Badge className={cn(
                          connector.is_active && connector.health_status === 'healthy' ? 'bg-green-500/10 text-green-600' :
                          connector.is_active ? 'bg-yellow-500/10 text-yellow-600' : 'bg-red-500/10 text-red-600'
                        )}>
                          {connector.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Records Synced</span>
                          <span className="font-medium">{connector.records_synced.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last Sync</span>
                          <span className="text-xs">
                            {connector.last_sync ? new Date(connector.last_sync).toLocaleString() : 'Never'}
                          </span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => syncConnector(connector.connector_id)}
                            disabled={syncingConnector === connector.connector_id || !connector.is_active}
                          >
                            {syncingConnector === connector.connector_id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Repeat className="h-4 w-4" />
                            )}
                            Sync Now
                          </Button>
                          <Button variant="outline" size="icon" className="shrink-0">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Sync Jobs */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Recent Sync Jobs</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {[
                { connector: 'WhatsApp Business', status: 'completed', records: 234, time: '2 min ago' },
                { connector: 'Razorpay Payments', status: 'completed', records: 89, time: '5 min ago' },
                { connector: 'Google Workspace', status: 'completed', records: 12, time: '15 min ago' },
                { connector: 'Slack Integration', status: 'failed', records: 0, time: '1 hour ago' },
              ].map((job, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      job.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                    )} />
                    <div>
                      <p className="text-sm font-medium">{job.connector}</p>
                      <p className="text-xs text-muted-foreground">{job.records.toLocaleString()} records</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={cn(
                      job.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                    )}>
                      {job.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{job.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
