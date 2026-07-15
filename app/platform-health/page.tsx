'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Server,
  Database,
  Shield,
  Globe,
  Smartphone,
  Zap,
  Brain,
  Users,
  DollarSign,
  Target,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  Thermometer,
  BarChart3,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const infrastructureMetrics = [
  { name: 'CPU Usage', value: 67, status: 'normal', icon: Cpu, unit: '%' },
  { name: 'Memory', value: 78, status: 'warning', icon: HardDrive, unit: '%' },
  { name: 'Network I/O', value: 45, status: 'normal', icon: Wifi, unit: 'Mbps' },
  { name: 'Disk I/O', value: 32, status: 'normal', icon: HardDrive, unit: 'MB/s' },
];

const services = [
  { name: 'API Gateway', status: 'healthy', uptime: 99.99, latency: 45, region: 'US-East', instances: 4 },
  { name: 'Database Primary', status: 'healthy', uptime: 99.98, latency: 12, region: 'US-East', instances: 1 },
  { name: 'Database Replica', status: 'healthy', uptime: 99.98, latency: 15, region: 'US-West', instances: 2 },
  { name: 'Redis Cache', status: 'healthy', uptime: 99.95, latency: 2, region: 'Multi', instances: 3 },
  { name: 'AI Model Router', status: 'healthy', uptime: 99.92, latency: 85, region: 'Multi', instances: 6 },
  { name: 'Vector Search', status: 'healthy', uptime: 99.85, latency: 120, region: 'US-East', instances: 2 },
  { name: 'Message Queue', status: 'healthy', uptime: 99.99, latency: 5, region: 'Multi', instances: 3 },
  { name: 'Storage Service', status: 'healthy', uptime: 99.95, latency: 35, region: 'Multi', instances: 4 },
  { name: 'Email Service', status: 'degraded', uptime: 98.5, latency: 450, region: 'US-East', instances: 2 },
  { name: 'SMS Gateway', status: 'healthy', uptime: 99.8, latency: 180, region: 'Multi', instances: 2 },
];

const platformModules = [
  { name: 'AI Platform', icon: Brain, status: 'operational', lastIncident: '3 days ago', mttr: '12m' },
  { name: 'CRM Module', icon: Users, status: 'operational', lastIncident: '5 days ago', mttr: '8m' },
  { name: 'Finance Module', icon: DollarSign, status: 'operational', lastIncident: '7 days ago', mttr: '5m' },
  { name: 'Marketing Cloud', icon: Target, status: 'operational', lastIncident: '2 days ago', mttr: '15m' },
  { name: 'HRMS Module', icon: Users, status: 'operational', lastIncident: '14 days ago', mttr: '3m' },
  { name: 'Collaboration', icon: MessageSquare, status: 'operational', lastIncident: '1 day ago', mttr: '10m' },
  { name: 'DevOps Platform', icon: Server, status: 'operational', lastIncident: '4 days ago', mttr: '20m' },
  { name: 'Mobile Ecosystem', icon: Smartphone, status: 'operational', lastIncident: '6 days ago', mttr: '25m' },
  { name: 'Integration Hub', icon: Zap, status: 'operational', lastIncident: '12 days ago', mttr: '18m' },
  { name: 'Security Center', icon: Shield, status: 'operational', lastIncident: '30 days ago', mttr: '45m' },
];

const incidentHistory = [
  { id: 'INC-0892', title: 'Email service latency spike', severity: 'medium', status: 'resolved', duration: '45m', time: '2 days ago' },
  { id: 'INC-0891', title: 'AI model timeout errors', severity: 'high', status: 'resolved', duration: '12m', time: '3 days ago' },
  { id: 'INC-0890', title: 'Database connection pool exhausted', severity: 'critical', status: 'resolved', duration: '8m', time: '5 days ago' },
  { id: 'INC-0889', title: 'Redis cache eviction rate high', severity: 'low', status: 'resolved', duration: '2h', time: '7 days ago' },
  { id: 'INC-0888', title: 'Mobile push notification delays', severity: 'medium', status: 'resolved', duration: '25m', time: '12 days ago' },
];

const slaMetrics = [
  { name: 'API Availability', target: 99.9, current: 99.92, trend: 'up' },
  { name: 'Response Time P95', target: 2000, current: 1850, trend: 'down', unit: 'ms' },
  { name: 'Error Rate', target: 0.1, current: 0.08, trend: 'down', unit: '%', inverse: true },
  { name: 'Data Durability', target: 99.999, current: 100, trend: 'stable', unit: '%' },
];

export default function PlatformHealthPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const operationalCount = platformModules.filter(m => m.status === 'operational').length;
  const healthyServices = services.filter(s => s.status === 'healthy').length;

  return (
    <AppShell>
      <PageHeader
        title="Platform Health"
        description="Real-time system status and infrastructure monitoring"
        action={
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={cn(
              operationalCount === platformModules.length ? 'text-green-600' : 'text-yellow-600'
            )}>
              {operationalCount}/{platformModules.length} Operational
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* System Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-4 rounded-xl mb-6 border',
          operationalCount === platformModules.length
            ? 'bg-green-500/5 border-green-500/20'
            : 'bg-yellow-500/5 border-yellow-500/20'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              operationalCount === platformModules.length ? 'bg-green-500/10' : 'bg-yellow-500/10'
            )}>
              {operationalCount === platformModules.length ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              )}
            </div>
            <div>
              <p className="font-semibold text-lg">
                {operationalCount === platformModules.length ? 'All Systems Operational' : 'Partial System Degradation'}
              </p>
              <p className="text-sm text-muted-foreground">
                Last incident: 2 days ago MTTR: 45 minutes
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">99.92%</p>
            <p className="text-xs text-muted-foreground">30-day uptime</p>
          </div>
        </div>
      </motion.div>

      {/* Infrastructure Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {infrastructureMetrics.map((metric, i) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={cn(
                'h-4 w-4',
                metric.status === 'normal' && 'text-green-500',
                metric.status === 'warning' && 'text-yellow-500',
                metric.status === 'critical' && 'text-red-500'
              )} />
              <Badge variant="outline" className={cn(
                'text-[10px]',
                metric.status === 'normal' && 'text-green-600',
                metric.status === 'warning' && 'text-yellow-600',
                metric.status === 'critical' && 'text-red-600'
              )}>
                {metric.status}
              </Badge>
            </div>
            <p className="text-2xl font-bold">{metric.value}{metric.unit}</p>
            <p className="text-xs text-muted-foreground">{metric.name}</p>
            <Progress
              value={metric.value}
              className={cn(
                'h-1.5 mt-2',
                metric.status === 'warning' && '[&>div]:bg-yellow-500'
              )}
            />
          </motion.div>
        ))}
      </div>

      {/* SLA Metrics */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">SLA Performance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {slaMetrics.map((sla, i) => {
              const achievingTarget = sla.inverse
                ? sla.current <= sla.target
                : sla.current >= sla.target;
              return (
                <motion.div
                  key={sla.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-lg bg-muted/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{sla.name}</p>
                    {sla.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {sla.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">
                      {sla.unit === '%' ? sla.current.toFixed(sla.current < 1 ? 2 : 1) : sla.current}
                      {sla.unit || ''}
                    </p>
                    {achievingTarget ? (
                      <Badge className="text-[10px] bg-green-500/10 text-green-600">On Target</Badge>
                    ) : (
                      <Badge className="text-[10px] bg-yellow-500/10 text-yellow-600">At Risk</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {sla.target}{sla.unit || '%'}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services" className="gap-1.5">
            <Server className="h-4 w-4" />
            Services ({healthyServices}/{services.length})
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-1.5">
            <Layers className="h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Incidents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Service Health</CardTitle>
              <CardDescription>Real-time status of all platform services</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {services.map((service, i) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        service.status === 'healthy' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                      )}>
                        <Server className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{service.region}</span>
                          <span>{service.instances} instances</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">{service.latency}ms</p>
                        <p className="text-xs text-muted-foreground">latency</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{service.uptime}%</p>
                        <p className="text-xs text-muted-foreground">uptime</p>
                      </div>
                      <Badge className={cn(
                        'text-[10px]',
                        service.status === 'healthy' && 'bg-green-500/10 text-green-600',
                        service.status === 'degraded' && 'bg-yellow-500/10 text-yellow-600',
                        service.status === 'down' && 'bg-red-500/10 text-red-600'
                      )}>
                        {service.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformModules.map((module, i) => (
              <motion.div
                key={module.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn(
                  module.status !== 'operational' && 'border-yellow-500/50'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          module.status === 'operational' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                        )}>
                          <module.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{module.name}</p>
                          <Badge className={cn(
                            'text-[10px]',
                            module.status === 'operational' && 'bg-green-500/10 text-green-600'
                          )}>
                            {module.status}
                          </Badge>
                        </div>
                      </div>
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        module.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Last Incident</p>
                        <p className="font-medium">{module.lastIncident}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg MTTR</p>
                        <p className="font-medium">{module.mttr}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Incident History</CardTitle>
              <CardDescription>Recent platform incidents and resolutions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {incidentHistory.map((incident, i) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        incident.severity === 'critical' && 'bg-red-500/10 text-red-600',
                        incident.severity === 'high' && 'bg-orange-500/10 text-orange-600',
                        incident.severity === 'medium' && 'bg-yellow-500/10 text-yellow-600',
                        incident.severity === 'low' && 'bg-blue-500/10 text-blue-600'
                      )}>
                        {incident.status === 'resolved' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
                          <Badge variant="outline" className={cn(
                            'text-[10px]',
                            incident.severity === 'critical' && 'text-red-600',
                            incident.severity === 'high' && 'text-orange-600',
                            incident.severity === 'medium' && 'text-yellow-600',
                            incident.severity === 'low' && 'text-blue-600'
                          )}>
                            {incident.severity}
                          </Badge>
                        </div>
                        <p className="font-medium mt-0.5">{incident.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-sm font-medium">{incident.duration}</p>
                        <p className="text-xs text-muted-foreground">duration</p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-600">
                        {incident.status}
                      </Badge>
                    </div>
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

function Layers({ className }: { className?: string }) {
  return <div className={cn('h-4 w-4', className)} />;
}
