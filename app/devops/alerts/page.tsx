'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Plus,
  Filter,
  Volume2,
  VolumeX,
  Mail,
  MessageSquare,
  Smartphone,
  Users,
  Zap,
  Shield,
  Server,
  Database,
  Globe,
  Activity,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-600 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

const severityDotColors: Record<string, string> = {
  critical: 'bg-red-500 animate-pulse',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

const firingAlerts = [
  { id: '1', name: 'High CPU Usage', severity: 'critical', source: 'API Gateway', value: '95%', threshold: '80%', duration: '12m', acknowledged: false },
  { id: '2', name: 'Database Connection Pool Exhausted', severity: 'critical', source: 'Database Primary', value: '100%', threshold: '90%', duration: '8m', acknowledged: true },
  { id: '3', name: 'Memory Usage Warning', severity: 'high', source: 'App Server 3', value: '85%', threshold: '80%', duration: '23m', acknowledged: false },
  { id: '4', name: 'Disk Space Low', severity: 'high', source: 'Storage Node 2', value: '92%', threshold: '90%', duration: '1h 12m', acknowledged: true },
  { id: '5', name: 'API Latency Degradation', severity: 'medium', source: 'Load Balancer', value: '450ms', threshold: '300ms', duration: '45m', acknowledged: false },
  { id: '6', name: 'Certificate Expiring Soon', severity: 'low', source: 'SSL Manager', value: '7 days', threshold: '14 days', duration: '2h', acknowledged: false },
];

const alertRules = [
  { id: '1', name: 'CPU Usage Critical', metric: 'cpu.utilization', condition: '>', threshold: '90%', severity: 'critical', enabled: true, notifications: ['pagerduty', 'slack'] },
  { id: '2', name: 'Memory Usage High', metric: 'memory.utilization', condition: '>', threshold: '85%', severity: 'high', enabled: true, notifications: ['slack', 'email'] },
  { id: '3', name: 'Database Connection Pool', metric: 'db.connections.active', condition: '>', threshold: '90%', severity: 'critical', enabled: true, notifications: ['pagerduty', 'slack', 'sms'] },
  { id: '4', name: 'API Error Rate', metric: 'api.errors.rate', condition: '>', threshold: '5%', severity: 'high', enabled: true, notifications: ['slack', 'email'] },
  { id: '5', name: 'Disk Space Warning', metric: 'disk.usage', condition: '>', threshold: '85%', severity: 'medium', enabled: true, notifications: ['email'] },
  { id: '6', name: 'SSL Certificate Expiry', metric: 'ssl.days_until_expiry', condition: '<', threshold: '14', severity: 'low', enabled: true, notifications: ['email'] },
  { id: '7', name: 'Container Restart Loop', metric: 'container.restarts', condition: '>', threshold: '5/10min', severity: 'critical', enabled: false, notifications: ['pagerduty'] },
  { id: '8', name: 'Request Latency High', metric: 'http.request.latency_p95', condition: '>', threshold: '500ms', severity: 'medium', enabled: true, notifications: ['slack'] },
];

const escalationPolicies = [
  { name: 'Critical Alert Escalation', levels: [['On-Call Engineer', '5 min'], ['Senior Engineer', '15 min'], ['Engineering Manager', '30 min']], enabled: true },
  { name: 'Database Alert Escalation', levels: [['DBA On-Call', '5 min'], ['Senior DBA', '15 min'], ['Infrastructure Lead', '30 min']], enabled: true },
  { name: 'Security Alert Escalation', levels: [['Security Analyst', '5 min'], ['Security Lead', '10 min'], ['CISO', '30 min']], enabled: true },
];

const alertHistory = [
  { time: '14:32:15', alert: 'API Latency Spike', severity: 'medium', status: 'resolved', duration: '12m', acknowledgedBy: 'John D.' },
  { time: '14:15:00', alert: 'Memory Pressure', severity: 'high', status: 'resolved', duration: '8m', acknowledgedBy: 'System' },
  { time: '13:45:22', alert: 'Database Connection Limit', severity: 'critical', status: 'resolved', duration: '23m', acknowledgedBy: 'Sarah M.' },
  { time: '12:30:00', alert: 'Certificate Renewal', severity: 'low', status: 'resolved', duration: '2h', acknowledgedBy: 'Auto' },
  { time: '11:15:45', alert: 'Disk Cleanup Needed', severity: 'medium', status: 'ignored', duration: '-', acknowledgedBy: 'Mike K.' },
];

const notificationChannels = [
  { id: 'pagerduty', name: 'PagerDuty', icon: Zap, configured: true },
  { id: 'slack', name: 'Slack', icon: MessageSquare, configured: true },
  { id: 'email', name: 'Email', icon: Mail, configured: true },
  { id: 'sms', name: 'SMS', icon: Smartphone, configured: true },
];

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('firing');

  const filteredAlerts = firingAlerts.filter(alert => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesSeverity;
  });

  const stats = {
    firing: firingAlerts.length,
    critical: firingAlerts.filter(a => a.severity === 'critical').length,
    high: firingAlerts.filter(a => a.severity === 'high').length,
    acknowledged: firingAlerts.filter(a => a.acknowledged).length,
    rulesActive: alertRules.filter(r => r.enabled).length,
    escalations: escalationPolicies.length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Alerting Platform"
        description="Alert rules, escalation policies, and incident management"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="h-4 w-4" />
              Test Alert
            </Button>
            <Button className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              New Rule
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Firing', value: stats.firing, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Critical', value: stats.critical, icon: XCircle, color: 'text-red-600' },
          { label: 'High', value: stats.high, icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Acknowledged', value: stats.acknowledged, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Active Rules', value: stats.rulesActive, icon: Settings, color: 'text-blue-500' },
          { label: 'Escalation Policies', value: stats.escalations, icon: Users, color: 'text-purple-500' },
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

      <Tabs defaultValue="firing" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="firing" className="rounded-lg gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Firing Alerts
          </TabsTrigger>
          <TabsTrigger value="rules" className="rounded-lg gap-1.5">
            <Settings className="h-4 w-4" />
            Alert Rules
          </TabsTrigger>
          <TabsTrigger value="escalation" className="rounded-lg gap-1.5">
            <Users className="h-4 w-4" />
            Escalation
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg gap-1.5">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg gap-1.5">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="firing" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {filteredAlerts.length} firing
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredAlerts.map((alert, i) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className={cn('w-3 h-3 rounded-full', severityDotColors[alert.severity])} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{alert.name}</p>
                        <Badge className={cn('text-[10px]', severityColors[alert.severity])}>
                          {alert.severity}
                        </Badge>
                        {alert.acknowledged && (
                          <Badge variant="outline" className="text-[10px]">Acknowledged</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{alert.source}</span>
                        <span>Value: {alert.value} (threshold: {alert.threshold})</span>
                        <span>For {alert.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!alert.acknowledged && (
                        <Button variant="outline" size="sm">
                          Acknowledge
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Resolve
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alert Rules</CardTitle>
              <CardDescription>Configure alert conditions and thresholds</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {alertRules.map((rule, i) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Switch checked={rule.enabled} />
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <code className="px-1.5 py-0.5 rounded bg-muted">{rule.metric}</code>
                          <span>{rule.condition}</span>
                          <code className="px-1.5 py-0.5 rounded bg-muted">{rule.threshold}</code>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {rule.notifications.map((n) => {
                          const channel = notificationChannels.find(c => c.id === n);
                          if (!channel) return null;
                          const Icon = channel.icon;
                          return (
                            <div key={n} className="w-7 h-7 rounded bg-muted flex items-center justify-center">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          );
                        })}
                      </div>
                      <Badge className={cn('text-[10px]', severityColors[rule.severity])}>
                        {rule.severity}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalation" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            {escalationPolicies.map((policy, i) => (
              <motion.div
                key={policy.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {policy.name}
                      </CardTitle>
                      <Switch checked={policy.enabled} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {policy.levels.map((level, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{level[0]}</p>
                            <p className="text-xs text-muted-foreground">Escalate after {level[1]}</p>
                          </div>
                          {idx < policy.levels.length - 1 && (
                            <div className="w-px h-8 bg-border" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alert History</CardTitle>
              <CardDescription>Past 24 hours of alert activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Time</th>
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Alert</th>
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Severity</th>
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Duration</th>
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Acknowledged By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertHistory.map((item, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4 text-sm font-mono text-muted-foreground">{item.time}</td>
                        <td className="p-4 text-sm font-medium">{item.alert}</td>
                        <td className="p-4">
                          <Badge className={cn('text-[10px]', severityColors[item.severity])}>
                            {item.severity}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={cn(
                            'text-[10px]',
                            item.status === 'resolved' && 'text-green-600',
                            item.status === 'ignored' && 'text-gray-500'
                          )}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{item.duration}</td>
                        <td className="p-4 text-sm text-muted-foreground">{item.acknowledgedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Channels</CardTitle>
              <CardDescription>Configure how alerts are delivered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {notificationChannels.map((channel, i) => (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className={cn(
                      'cursor-pointer transition-colors',
                      channel.configured ? 'border-primary/50' : 'border-dashed opacity-60'
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <channel.icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          {channel.configured ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Plus className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {channel.configured ? 'Configured' : 'Click to configure'}
                        </p>
                      </CardContent>
                    </Card>
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
