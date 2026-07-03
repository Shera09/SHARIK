'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Server,
  Activity,
  Database,
  Cpu,
  HardDrive,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Shield,
  DollarSign,
  GitBranch,
  Eye,
  Gauge,
  Layers,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const devopsModules = [
  { label: 'Infrastructure', href: '/devops/infrastructure', icon: Server, description: 'Cloud resources and platform architecture', color: 'from-blue-500/20 to-cyan-500/20' },
  { label: 'CI/CD Pipeline', href: '/devops/pipelines', icon: GitBranch, description: 'Build, test, and deployment automation', color: 'from-green-500/20 to-emerald-500/20' },
  { label: 'Monitoring', href: '/devops/monitoring', icon: Activity, description: 'Real-time system health dashboards', color: 'from-purple-500/20 to-pink-500/20' },
  { label: 'Observability', href: '/devops/observability', icon: Eye, description: 'Centralized logging and tracing', color: 'from-orange-500/20 to-amber-500/20' },
  { label: 'Alerts', href: '/devops/alerts', icon: AlertTriangle, description: 'Alert configuration and escalation', color: 'from-red-500/20 to-rose-500/20' },
  { label: 'Performance', href: '/devops/performance', icon: Gauge, description: 'Performance engineering and optimization', color: 'from-teal-500/20 to-cyan-500/20' },
  { label: 'Backup & DR', href: '/devops/backup', icon: Database, description: 'Backup strategy and disaster recovery', color: 'from-indigo-500/20 to-violet-500/20' },
  { label: 'Security Ops', href: '/devops/security', icon: Shield, description: 'Security operations and compliance', color: 'from-slate-500/20 to-zinc-500/20' },
  { label: 'Costs', href: '/devops/costs', icon: DollarSign, description: 'Infrastructure cost optimization', color: 'from-emerald-500/20 to-green-500/20' },
  { label: 'Environments', href: '/devops/environments', icon: Layers, description: 'Environment management and promotion', color: 'from-sky-500/20 to-blue-500/20' },
];

interface Resource {
  resource_type: string;
  status: string;
  environment: string;
}

interface Deployment {
  status: string;
  environment: string;
  started_at: string;
}

interface Alert {
  severity: string;
  status: string;
}

interface Backup {
  status: string;
  backup_target: string;
}

export default function DevOpsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [resourcesRes, deploymentsRes, alertsRes, backupsRes] = await Promise.all([
        supabase.from('infrastructure_resources').select('resource_type, status, environment'),
        supabase.from('deployments').select('status, environment, started_at').order('started_at', { ascending: false }).limit(20),
        supabase.from('monitoring_alerts').select('severity, status').eq('status', 'firing'),
        supabase.from('backups').select('status, backup_target').order('started_at', { ascending: false }).limit(10),
      ]);

      if (resourcesRes.data) setResources(resourcesRes.data);
      if (deploymentsRes.data) setDeployments(deploymentsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (backupsRes.data) setBackups(backupsRes.data);
    } catch (error) {
      console.error('Error loading DevOps data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const runningResources = resources.filter(r => r.status === 'running').length;
  const totalResources = resources.length;
  const productionResources = resources.filter(r => r.environment === 'production' && r.status === 'running').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const highAlerts = alerts.filter(a => a.severity === 'high').length;
  const recentDeploys = deployments.filter(d => {
    const date = new Date(d.started_at);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;
  const successfulBackups = backups.filter(b => b.status === 'success').length;

  const systemHealth = totalResources > 0 ? ((runningResources / totalResources) * 100) : 100;

  return (
    <AppShell>
      <PageHeader
        title="DevOps Platform"
        description="Enterprise infrastructure, CI/CD, monitoring, and operations"
        action={
          <div className="flex items-center gap-3">
            <Badge className={cn(
              'gap-1.5',
              systemHealth >= 95 ? 'bg-green-500/10 text-green-600 border-green-500/20' :
              systemHealth >= 80 ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
              'bg-red-500/10 text-red-600 border-red-500/20'
            )}>
              {systemHealth >= 95 ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {systemHealth.toFixed(0)}% Healthy
            </Badge>
            <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Resources', value: totalResources, icon: Server, color: 'text-blue-500' },
          { label: 'Running', value: runningResources, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Production', value: productionResources, icon: Globe, color: 'text-purple-500' },
          { label: 'Deploys Today', value: recentDeploys, icon: GitBranch, color: 'text-cyan-500' },
          { label: 'Critical', value: criticalAlerts, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Warnings', value: highAlerts, icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Backups OK', value: successfulBackups, icon: Database, color: 'text-emerald-500' },
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

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Module Cards */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Platform Modules</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devopsModules.map((module, i) => (
              <motion.div
                key={module.href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.03 }}
              >
                <Link href={module.href}>
                  <Card className="h-full hover:shadow-md transition-all cursor-pointer group overflow-hidden">
                    <div className={cn('h-1 bg-gradient-to-r', module.color)} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br', module.color)}>
                          <module.icon className="h-5 w-5" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-sm">{module.label}</CardTitle>
                      <CardDescription className="text-xs mt-1">{module.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Status Panels */}
        <div className="space-y-6">
          {/* System Health */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              System Health
            </h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Overall Health</span>
                      <span className="font-bold">{systemHealth.toFixed(0)}%</span>
                    </div>
                    <Progress value={systemHealth} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'API Gateway', status: 'running', health: 99 },
                      { label: 'Database', status: 'running', health: 100 },
                      { label: 'Cache', status: 'running', health: 99 },
                      { label: 'Queue', status: 'running', health: 98 },
                      { label: 'AI Cluster', status: 'running', health: 97 },
                      { label: 'Storage', status: 'running', health: 100 },
                    ].map((service) => (
                      <div key={service.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-xs">{service.label}</span>
                        <div className="flex items-center gap-1">
                          <div className={cn('w-2 h-2 rounded-full', service.status === 'running' ? 'bg-green-500' : 'bg-red-500')} />
                          <span className="text-xs font-medium">{service.health}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deployments */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-cyan-500" />
              Recent Deployments
            </h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { app: 'API Service', env: 'production', status: 'success', time: '2 hours ago' },
                    { app: 'Web App', env: 'staging', status: 'success', time: '4 hours ago' },
                    { app: 'AI Engine', env: 'production', status: 'success', time: '6 hours ago' },
                  ].map((deploy) => (
                    <div key={deploy.app} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{deploy.app}</p>
                        <p className="text-xs text-muted-foreground">{deploy.env}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500/10 text-green-600 text-[10px]">{deploy.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{deploy.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
