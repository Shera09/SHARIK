'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  HardDrive,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Calendar,
  Shield,
  Server,
  Globe,
  Zap,
  Download,
  Trash2,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const backupJobs = [
  { id: '1', name: 'Production Database', type: 'database', status: 'completed', size: '245 GB', duration: '1h 23m', started: '2 hours ago', retention: '30 days' },
  { id: '2', name: 'User Files Storage', type: 'files', status: 'completed', size: '1.2 TB', duration: '4h 15m', started: '6 hours ago', retention: '90 days' },
  { id: '3', name: 'Configuration Store', type: 'config', status: 'running', size: '12 GB', duration: '8m', started: '15 minutes ago', retention: '365 days' },
  { id: '4', name: 'AI Model Weights', type: 'models', status: 'completed', size: '89 GB', duration: '45m', started: '1 day ago', retention: '90 days' },
  { id: '5', name: 'Log Archives', type: 'logs', status: 'failed', size: '-', duration: '-', started: '1 day ago', retention: '180 days' },
];

const drPlans = [
  { name: 'Database Failover', rto: '15m', rpo: '5m', status: 'tested', lastTest: '3 days ago', priority: 'critical' },
  { name: 'Full Region Failover', rto: '2h', rpo: '1h', status: 'tested', lastTest: '1 week ago', priority: 'critical' },
  { name: 'App Server Recovery', rto: '30m', rpo: '-', status: 'tested', lastTest: '5 days ago', priority: 'high' },
  { name: 'Cache Layer Rebuild', rto: '10m', rpo: '-', status: 'not_tested', lastTest: '-', priority: 'medium' },
  { name: 'Search Index Rebuild', rto: '4h', rpo: '24h', status: 'tested', lastTest: '2 weeks ago', priority: 'low' },
];

const backupTargets = [
  { name: 'S3 Primary', provider: 'AWS', region: 'us-east-1', type: 'Hot', size: '4.5 TB', status: 'healthy', encrypted: true },
  { name: 'S3 Cross-Region', provider: 'AWS', region: 'eu-west-1', type: 'Hot', size: '4.5 TB', status: 'healthy', encrypted: true },
  { name: 'Azure Blob Archive', provider: 'Azure', region: 'eastus', type: 'Cold', size: '8.2 TB', status: 'healthy', encrypted: true },
  { name: 'On-Premise NAS', provider: 'Private', region: 'local', type: 'Hot', size: '2.1 TB', status: 'degraded', encrypted: true },
];

const restoreHistory = [
  { time: '2 days ago', target: 'Production Database', reason: 'Data corruption recovery', duration: '45m', status: 'success', initiatedBy: 'Sarah M.' },
  { time: '1 week ago', target: 'User Files', reason: 'Accidental deletion', duration: '2h 15m', status: 'success', initiatedBy: 'John D.' },
  { time: '2 weeks ago', target: 'Configuration Store', reason: 'Configuration rollback', duration: '12m', status: 'success', initiatedBy: 'Mike K.' },
];

const runbooks = [
  { name: 'Database Point-in-Time Recovery', steps: 12, lastUpdated: '1 week ago' },
  { name: 'Full System Restoration', steps: 45, lastUpdated: '2 weeks ago' },
  { name: 'Cross-Region Failover', steps: 28, lastUpdated: '1 week ago' },
  { name: 'Encrypted Backup Decryption', steps: 8, lastUpdated: '3 days ago' },
];

export default function BackupPage() {
  const [runningBackup, setRunningBackup] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');

  function triggerBackup() {
    setRunningBackup(true);
    setTimeout(() => setRunningBackup(false), 3000);
  }

  const stats = {
    totalBackups: 48,
    totalSize: '12.5 TB',
    successful: 45,
    failed: 3,
    avgDuration: '1h 45m',
    rtoCompliance: 98,
    rpoCompliance: 99,
  };

  return (
    <AppShell>
      <PageHeader
        title="Backup & Disaster Recovery"
        description="Backup strategy, DR plans, and recovery runbooks"
        action={
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Test DR
            </Button>
            <Button onClick={triggerBackup} disabled={runningBackup} className="gap-2 rounded-xl">
              {runningBackup ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Backup Now
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Total Backups', value: stats.totalBackups, icon: Database, color: 'text-blue-500' },
          { label: 'Total Size', value: stats.totalSize, icon: HardDrive, color: 'text-purple-500' },
          { label: 'Successful', value: stats.successful, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-500' },
          { label: 'Avg Duration', value: stats.avgDuration, icon: Clock, color: 'text-cyan-500' },
          { label: 'RTO Compliant', value: `${stats.rtoCompliance}%`, icon: Zap, color: 'text-amber-500' },
          { label: 'RPO Compliant', value: `${stats.rpoCompliance}%`, icon: Shield, color: 'text-emerald-500' },
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

      <Tabs defaultValue="backups" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="backups" className="rounded-lg gap-1.5">
            <Database className="h-4 w-4" />
            Backup Jobs
          </TabsTrigger>
          <TabsTrigger value="dr" className="rounded-lg gap-1.5">
            <Shield className="h-4 w-4" />
            DR Plans
          </TabsTrigger>
          <TabsTrigger value="targets" className="rounded-lg gap-1.5">
            <HardDrive className="h-4 w-4" />
            Storage Targets
          </TabsTrigger>
          <TabsTrigger value="restore" className="rounded-lg gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Restore History
          </TabsTrigger>
          <TabsTrigger value="runbooks" className="rounded-lg gap-1.5">
            <Activity className="h-4 w-4" />
            Runbooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {backupJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        job.status === 'completed' && 'bg-green-500/10 text-green-600',
                        job.status === 'running' && 'bg-blue-500/10 text-blue-600',
                        job.status === 'failed' && 'bg-red-500/10 text-red-600'
                      )}>
                        {job.status === 'running' ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : job.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{job.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px] capitalize">{job.type}</Badge>
                          <span>Started {job.started}</span>
                          {job.duration !== '-' && <span>Duration: {job.duration}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{job.size}</p>
                      <p className="text-xs text-muted-foreground">Retain {job.retention}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dr" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Disaster Recovery Plans</CardTitle>
              <CardDescription>RTO/RPO targets and verification status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Plan</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">RTO Target</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">RPO Target</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-right text-xs font-medium text-muted-foreground">Last Tested</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drPlans.map((plan) => (
                      <tr key={plan.name} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <p className="text-sm font-medium">{plan.name}</p>
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className="gap-1">
                            <Zap className="h-3 w-3" />
                            {plan.rto}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          {plan.rpo !== '-' ? (
                            <Badge variant="outline">{plan.rpo}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <Badge className={cn(
                            'text-[10px]',
                            plan.status === 'tested' && 'bg-green-500/10 text-green-600',
                            plan.status === 'not_tested' && 'bg-yellow-500/10 text-yellow-600'
                          )}>
                            {plan.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4 text-right text-sm text-muted-foreground">{plan.lastTest}</td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className={cn(
                            'text-[10px]',
                            plan.priority === 'critical' && 'text-red-600 border-red-600/30',
                            plan.priority === 'high' && 'text-orange-600 border-orange-600/30',
                            plan.priority === 'medium' && 'text-yellow-600 border-yellow-600/30',
                            plan.priority === 'low' && 'text-blue-600 border-blue-600/30'
                          )}>
                            {plan.priority}
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

        <TabsContent value="targets" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {backupTargets.map((target, i) => (
              <motion.div
                key={target.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn('overflow-hidden', target.status === 'degraded' && 'border-yellow-500/50')}>
                  <div className={cn('h-1',
                    target.status === 'healthy' && 'bg-green-500',
                    target.status === 'degraded' && 'bg-yellow-500'
                  )} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{target.name}</CardTitle>
                      <Badge className={cn(
                        'text-[10px]',
                        target.status === 'healthy' && 'bg-green-500/10 text-green-600',
                        target.status === 'degraded' && 'bg-yellow-500/10 text-yellow-600'
                      )}>
                        {target.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Provider</span>
                        <span className="font-medium">{target.provider}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Region</span>
                        <span>{target.region}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline" className="text-[10px]">{target.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Size</span>
                        <span className="font-medium">{target.size}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Encrypted</span>
                        {target.encrypted ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restore" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Restore History</CardTitle>
              <CardDescription>Past restore operations and their outcomes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {restoreHistory.map((restore, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{restore.target}</p>
                        <p className="text-xs text-muted-foreground">{restore.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500/10 text-green-600 text-[10px]">{restore.status}</Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{restore.duration}</span>
                        <span>by {restore.initiatedBy}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runbooks" className="mt-0">
          <div className="grid sm:grid-cols-2 gap-4">
            {runbooks.map((runbook, i) => (
              <motion.div
                key={runbook.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Activity className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{runbook.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{runbook.steps} steps</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Last updated {runbook.lastUpdated}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
