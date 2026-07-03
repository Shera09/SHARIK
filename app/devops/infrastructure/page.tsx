'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Globe,
  Wifi,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Settings,
  Search,
  Plus,
  MoreHorizontal,
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

interface Resource {
  resource_id: string;
  resource_name: string;
  resource_type: string;
  provider: string;
  region: string;
  status: string;
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  environment: string;
  ip_address: string;
}

const resourceTypeIcons: Record<string, typeof Server> = {
  server: Server,
  container: Cpu,
  database: Database,
  cache: HardDrive,
  queue: Activity,
  storage: HardDrive,
  cdn: Globe,
  load_balancer: Wifi,
  api_gateway: Globe,
  ai_cluster: Cpu,
};

const statusColors: Record<string, string> = {
  running: 'bg-green-500/10 text-green-600',
  stopped: 'bg-gray-500/10 text-gray-600',
  degraded: 'bg-yellow-500/10 text-yellow-600',
  failed: 'bg-red-500/10 text-red-600',
  maintenance: 'bg-blue-500/10 text-blue-600',
};

const providerColors: Record<string, string> = {
  aws: 'text-orange-500',
  azure: 'text-blue-500',
  gcp: 'text-red-500',
  private: 'text-gray-500',
  hybrid: 'text-purple-500',
};

export default function InfrastructurePage() {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    try {
      const { data, error } = await supabase
        .from('infrastructure_resources')
        .select('*')
        .order('resource_name');

      if (error) throw error;
      if (data) {
        setResources(data.map(r => ({
          resource_id: r.resource_id,
          resource_name: r.resource_name,
          resource_type: r.resource_type,
          provider: r.provider || 'aws',
          region: r.region || 'unknown',
          status: r.status,
          cpu_cores: r.cpu_cores || 0,
          memory_gb: r.memory_gb || 0,
          storage_gb: r.storage_gb || 0,
          environment: r.environment,
          ip_address: r.ip_address || '-',
        })));
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredResources = resources.filter(r =>
    r.resource_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.resource_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resourcesByProvider = resources.reduce((acc, r) => {
    acc[r.provider] = (acc[r.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const resourcesByEnv = resources.reduce((acc, r) => {
    acc[r.environment] = acc[r.environment] || { total: 0, running: 0 };
    acc[r.environment].total++;
    if (r.status === 'running') acc[r.environment].running++;
    return acc;
  }, {} as Record<string, { total: number; running: number }>);

  return (
    <AppShell>
      <PageHeader
        title="Cloud Infrastructure"
        description="Manage cloud resources across AWS, Azure, GCP, and private infrastructure"
        action={
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Resources', value: resources.length, icon: Server, color: 'text-blue-500' },
          { label: 'Running', value: resources.filter(r => r.status === 'running').length, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Degraded', value: resources.filter(r => r.status === 'degraded').length, icon: AlertTriangle, color: 'text-yellow-500' },
          { label: 'Providers', value: Object.keys(resourcesByProvider).length, icon: Globe, color: 'text-purple-500' },
          { label: 'CPU Cores', value: resources.reduce((s, r) => s + (r.cpu_cores || 0), 0), icon: Cpu, color: 'text-cyan-500' },
          { label: 'Memory (GB)', value: resources.reduce((s, r) => s + (r.memory_gb || 0), 0), icon: HardDrive, color: 'text-orange-500' },
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

      <Tabs defaultValue="all" className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="glass-card p-1 h-auto">
            <TabsTrigger value="all" className="rounded-lg">All Resources</TabsTrigger>
            <TabsTrigger value="production" className="rounded-lg">Production</TabsTrigger>
            <TabsTrigger value="staging" className="rounded-lg">Staging</TabsTrigger>
            <TabsTrigger value="by-provider" className="rounded-lg">By Provider</TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredResources.map((resource, i) => {
                  const Icon = resourceTypeIcons[resource.resource_type] || Server;
                  return (
                    <motion.div
                      key={resource.resource_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-muted')}>
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{resource.resource_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{resource.resource_type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{resource.region}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-sm">{resource.cpu_cores} cores, {resource.memory_gb}GB RAM</p>
                          <p className="text-xs text-muted-foreground">{resource.environment}</p>
                        </div>
                        <Badge className={cn('text-[10px]', statusColors[resource.status] || 'bg-muted')}>
                          {resource.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.filter(r => r.environment === 'production').map((resource, i) => {
              const Icon = resourceTypeIcons[resource.resource_type] || Server;
              return (
                <motion.div
                  key={resource.resource_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="overflow-hidden">
                    <div className={cn('h-1',
                      resource.status === 'running' && 'bg-green-500',
                      resource.status === 'degraded' && 'bg-yellow-500',
                      resource.status === 'failed' && 'bg-red-500'
                    )} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-sm">{resource.resource_name}</CardTitle>
                            <p className="text-xs text-muted-foreground capitalize">{resource.resource_type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <Badge className={cn('text-[10px]', statusColors[resource.status])}>
                          {resource.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Region</p>
                          <p className="font-medium">{resource.region}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Provider</p>
                          <p className="font-medium capitalize">{resource.provider}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="staging" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.filter(r => r.environment === 'staging').map((resource) => {
              const Icon = resourceTypeIcons[resource.resource_type] || Server;
              return (
                <Card key={resource.resource_id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-sm">{resource.resource_name}</CardTitle>
                      </div>
                      <Badge className={cn('text-[10px]', statusColors[resource.status])}>
                        {resource.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{resource.region}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="by-provider" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(resourcesByProvider).map(([provider, count]) => (
              <Card key={provider}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className={cn('h-8 w-8', providerColors[provider] || 'text-gray-500')} />
                    <div>
                      <p className="font-semibold capitalize">{provider}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">resources deployed</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
