'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Server,
  Database,
  Globe,
  GitBranch,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  Play,
  Pause,
  Copy,
  Shield,
  Zap,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Monitor,
  Activity,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const environments = [
  {
    name: 'Production',
    type: 'production',
    status: 'healthy',
    version: 'v2.4.12',
    deployed: '2 hours ago',
    branch: 'main',
    instances: 12,
    cpu: 45,
    memory: 62,
    features: 98,
    alerts: 0,
  },
  {
    name: 'Staging',
    type: 'staging',
    status: 'healthy',
    version: 'v2.4.13-rc',
    deployed: '4 hours ago',
    branch: 'release/2.4.13',
    instances: 4,
    cpu: 34,
    memory: 48,
    features: 100,
    alerts: 0,
  },
  {
    name: 'QA',
    type: 'qa',
    status: 'running_tests',
    version: 'v2.4.13-dev',
    deployed: '1 hour ago',
    branch: 'develop',
    instances: 3,
    cpu: 78,
    memory: 65,
    features: 85,
    alerts: 2,
  },
  {
    name: 'Pre-Production',
    type: 'preprod',
    status: 'healthy',
    version: 'v2.4.12',
    deployed: '6 hours ago',
    branch: 'main',
    instances: 6,
    cpu: 28,
    memory: 42,
    features: 98,
    alerts: 0,
  },
  {
    name: 'Development',
    type: 'development',
    status: 'degraded',
    version: 'v2.4.14-alpha',
    deployed: '30 minutes ago',
    branch: 'feature/new-ui',
    instances: 2,
    cpu: 92,
    memory: 88,
    features: 72,
    alerts: 3,
  },
  {
    name: 'DR Site',
    type: 'dr',
    status: 'standby',
    version: 'v2.4.12',
    deployed: '2 hours ago',
    branch: 'main',
    instances: 6,
    cpu: 12,
    memory: 34,
    features: 98,
    alerts: 0,
  },
];

const promotionPath = ['Development', 'QA', 'Pre-Production', 'Production'];

const featureFlags = [
  { name: 'new_dashboard_ui', enabled: true, environments: ['development', 'qa'], rollout: 100 },
  { name: 'ai_recommendations', enabled: true, environments: ['development', 'qa', 'staging', 'production'], rollout: 25 },
  { name: 'real_time_sync', enabled: true, environments: ['development'], rollout: 100 },
  { name: 'dark_mode', enabled: true, environments: ['development', 'qa', 'staging', 'production'], rollout: 100 },
  { name: 'advanced_analytics', enabled: false, environments: ['development'], rollout: 0 },
  { name: 'mobile_app_v2', enabled: true, environments: ['development', 'qa'], rollout: 50 },
];

const maintenanceWindows = [
  { env: 'Production', scheduled: 'July 7, 2024 02:00 UTC', duration: '2 hours', reason: 'Database upgrade' },
  { env: 'Staging', scheduled: 'July 5, 2024 18:00 UTC', duration: '1 hour', reason: 'System patch' },
  { env: 'QA', scheduled: 'July 4, 2024 10:00 UTC', duration: '30 min', reason: 'Configuration update' },
];

const deploymentHistory = [
  { env: 'Production', version: 'v2.4.12', time: '2 hours ago', status: 'success', deployedBy: 'Pipeline' },
  { env: 'Staging', version: 'v2.4.13-rc', time: '4 hours ago', status: 'success', deployedBy: 'John D.' },
  { env: 'QA', version: 'v2.4.13-dev', time: '1 hour ago', status: 'success', deployedBy: 'Pipeline' },
  { env: 'Development', version: 'v2.4.14-alpha', time: '30 min ago', status: 'success', deployedBy: 'Sarah M.' },
];

const statusColors: Record<string, string> = {
  healthy: 'bg-green-500/10 text-green-600',
  degraded: 'bg-yellow-500/10 text-yellow-600',
  running_tests: 'bg-blue-500/10 text-blue-600',
  standby: 'bg-gray-500/10 text-gray-600',
  maintenance: 'bg-purple-500/10 text-purple-600',
};

const environmentColors: Record<string, string> = {
  production: 'border-red-500/50',
  preprod: 'border-orange-500/50',
  staging: 'border-blue-500/50',
  qa: 'border-green-500/50',
  development: 'border-yellow-500/50',
  dr: 'border-gray-500/50',
};

export default function EnvironmentsPage() {
  const [selectedEnv, setSelectedEnv] = useState<string>('all');
  const [promoting, setPromoting] = useState(false);

  function promote() {
    setPromoting(true);
    setTimeout(() => setPromoting(false), 2000);
  }

  const stats = {
    total: environments.length,
    healthy: environments.filter(e => e.status === 'healthy').length,
    degraded: environments.filter(e => e.status === 'degraded').length,
    totalInstances: environments.reduce((sum, e) => sum + e.instances, 0),
    featureFlags: featureFlags.length,
    activeMaintenance: maintenanceWindows.length,
  };

  const filteredEnvs = selectedEnv === 'all' ? environments : environments.filter(e => e.type === selectedEnv);

  return (
    <AppShell>
      <PageHeader
        title="Environment Management"
        description="Manage development environments, promotions, and feature flags"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Copy className="h-4 w-4" />
              Clone Env
            </Button>
            <Button onClick={promote} disabled={promoting} className="gap-2 rounded-xl">
              {promoting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Promote
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Environments', value: stats.total, icon: Layers, color: 'text-blue-500' },
          { label: 'Healthy', value: stats.healthy, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Degraded', value: stats.degraded, icon: AlertTriangle, color: 'text-yellow-500' },
          { label: 'Total Instances', value: stats.totalInstances, icon: Server, color: 'text-purple-500' },
          { label: 'Feature Flags', value: stats.featureFlags, icon: ToggleRight, color: 'text-cyan-500' },
          { label: 'Maintenance', value: stats.activeMaintenance, icon: Calendar, color: 'text-orange-500' },
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

      {/* Promotion Path */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Promotion Path</CardTitle>
          <CardDescription>Standard deployment flow across environments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {promotionPath.map((env, i) => {
              const envData = environments.find(e => e.name === env);
              return (
                <div key={env} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center mb-2',
                      envData?.status === 'healthy' ? 'bg-green-500/10' :
                      envData?.status === 'degraded' ? 'bg-red-500/10' : 'bg-muted'
                    )}>
                      {env === 'Production' ? (
                        <Shield className="h-6 w-6 text-red-600" />
                      ) : (
                        <Server className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm font-medium">{env}</p>
                    <Badge className={cn('text-[10px] mt-1', statusColors[envData?.status || 'healthy'])}>
                      {envData?.version}
                    </Badge>
                  </div>
                  {i < promotionPath.length - 1 && (
                    <div className="flex items-center px-4">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="environments" className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="glass-card p-1 h-auto">
            <TabsTrigger value="environments" className="rounded-lg gap-1.5">
              <Layers className="h-4 w-4" />
              Environments
            </TabsTrigger>
            <TabsTrigger value="flags" className="rounded-lg gap-1.5">
              <ToggleRight className="h-4 w-4" />
              Feature Flags
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-lg gap-1.5">
              <Calendar className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="deployments" className="rounded-lg gap-1.5">
              <GitBranch className="h-4 w-4" />
              Deployments
            </TabsTrigger>
          </TabsList>

          <Select value={selectedEnv} onValueChange={setSelectedEnv}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="preprod">Pre-Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="qa">QA</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="dr">DR Site</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="environments" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEnvs.map((env, i) => (
              <motion.div
                key={env.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn('overflow-hidden', environmentColors[env.type])}>
                  <div className={cn('h-1',
                    env.status === 'healthy' && 'bg-green-500',
                    env.status === 'degraded' && 'bg-yellow-500',
                    env.status === 'running_tests' && 'bg-blue-500',
                    env.status === 'standby' && 'bg-gray-500'
                  )} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {env.type === 'production' ? (
                          <Shield className="h-5 w-5 text-red-500" />
                        ) : env.type === 'dr' ? (
                          <Shield className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Server className="h-5 w-5 text-muted-foreground" />
                        )}
                        <CardTitle className="text-sm">{env.name}</CardTitle>
                      </div>
                      <Badge className={cn('text-[10px]', statusColors[env.status])}>
                        {env.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Version</span>
                        <code className="font-medium">{env.version}</code>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Branch</span>
                        <code className="text-xs px-1.5 py-0.5 rounded bg-muted">{env.branch}</code>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Instances</span>
                        <span className="font-medium">{env.instances}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">CPU</span>
                            <span className={cn(env.cpu > 80 && 'text-red-600')}>{env.cpu}%</span>
                          </div>
                          <Progress value={env.cpu} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Memory</span>
                            <span className={cn(env.memory > 80 && 'text-red-600')}>{env.memory}%</span>
                          </div>
                          <Progress value={env.memory} className="h-1.5" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground text-xs">Deployed {env.deployed}</span>
                        {env.alerts > 0 && (
                          <Badge variant="outline" className="text-red-600 text-[10px]">
                            {env.alerts} alerts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flags" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature Flags</CardTitle>
              <CardDescription>Toggle features across environments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Flag Name</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Dev</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">QA</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Staging</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Prod</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Rollout</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureFlags.map((flag) => (
                      <tr key={flag.name} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <code className="text-sm">{flag.name}</code>
                        </td>
                        <td className="p-4 text-center">
                          <Switch checked={flag.environments.includes('development')} />
                        </td>
                        <td className="p-4 text-center">
                          <Switch checked={flag.environments.includes('qa')} />
                        </td>
                        <td className="p-4 text-center">
                          <Switch checked={flag.environments.includes('staging')} />
                        </td>
                        <td className="p-4 text-center">
                          <Switch checked={flag.environments.includes('production')} />
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="outline">{flag.rollout}%</Badge>
                        </td>
                        <td className="p-4 text-center">
                          <Badge className={cn(
                            'text-[10px]',
                            flag.enabled ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'
                          )}>
                            {flag.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scheduled Maintenance</CardTitle>
              <CardDescription>Upcoming maintenance windows and planned downtime</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {maintenanceWindows.map((window, i) => (
                  <motion.div
                    key={window.env}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{window.env}</p>
                        <p className="text-xs text-muted-foreground">{window.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{window.scheduled}</p>
                      <p className="text-xs text-muted-foreground">Duration: {window.duration}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployments" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Deployments</CardTitle>
              <CardDescription>Deployment history across environments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {deploymentHistory.map((deploy, i) => (
                  <motion.div
                    key={`${deploy.env}-${deploy.version}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        deploy.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
                      )}>
                        {deploy.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{deploy.env}</p>
                          <code className="text-sm px-2 py-0.5 rounded bg-muted">{deploy.version}</code>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{deploy.time}</span>
                          <span>by {deploy.deployedBy}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={cn(
                      'text-[10px]',
                      deploy.status === 'success' && 'bg-green-500/10 text-green-600',
                      deploy.status === 'failed' && 'bg-red-500/10 text-red-600'
                    )}>
                      {deploy.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
