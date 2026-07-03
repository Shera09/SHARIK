'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Key,
  Eye,
  Server,
  Globe,
  Activity,
  RefreshCw,
  Settings,
  Search,
  FileText,
  Users,
  Fingerprint,
  Wifi,
  HardDrive,
  Clock,
  TrendingUp,
  TrendingDown,
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

const authEvents = [
  { id: '1', user: 'sarah.m@company.com', event: 'login_success', ip: '192.168.1.45', location: 'San Francisco, US', time: '2 min ago', risk: 'low' },
  { id: '2', user: 'admin@company.com', event: 'login_failed', ip: '103.45.67.89', location: 'Unknown', time: '5 min ago', risk: 'high' },
  { id: '3', user: 'john.d@company.com', event: 'password_reset', ip: '192.168.1.102', location: 'New York, US', time: '12 min ago', risk: 'low' },
  { id: '4', user: 'api-service', event: 'token_revoked', ip: '-', location: 'System', time: '25 min ago', risk: 'medium' },
  { id: '5', user: 'mike.k@company.com', event: 'mfa_enabled', ip: '192.168.1.78', location: 'Austin, US', time: '1 hour ago', risk: 'low' },
  { id: '6', user: 'unknown', event: 'brute_force_detected', ip: '45.67.89.123', location: 'Russia', time: '2 hours ago', risk: 'critical' },
];

const vulnerabilities = [
  { id: 'CVE-2024-1234', severity: 'critical', component: 'nginx', version: '1.18.0', affected: 12, status: 'open', discovered: '2 days ago' },
  { id: 'CVE-2024-5678', severity: 'high', component: 'openssl', version: '1.1.1k', affected: 8, status: 'patching', discovered: '3 days ago' },
  { id: 'CVE-2024-9012', severity: 'medium', component: 'node.js', version: '18.17.0', affected: 24, status: 'open', discovered: '1 week ago' },
  { id: 'CVE-2024-3456', severity: 'low', component: 'redis', version: '6.2.4', affected: 5, status: 'resolved', discovered: '2 weeks ago' },
];

const configDrift = [
  { resource: 'API Server 3', type: 'Security Group', drift: 'Port 8080 opened', severity: 'high', detected: '1 hour ago' },
  { resource: 'Database Primary', type: 'IAM Policy', drift: 'Role expanded', severity: 'critical', detected: '3 hours ago' },
  { resource: 'Cache Cluster', type: 'Network ACL', drift: 'CIDR range modified', severity: 'medium', detected: '5 hours ago' },
  { resource: 'Load Balancer', type: 'SSL Certificate', drift: 'Certificate expiring', severity: 'low', detected: '1 day ago' },
];

const complianceFrameworks = [
  { name: 'SOC 2 Type II', score: 94, status: 'compliant', lastAudit: '3 months ago', nextAudit: 'In 9 months' },
  { name: 'ISO 27001', score: 89, status: 'needs_attention', lastAudit: '6 months ago', nextAudit: 'In 6 months' },
  { name: 'GDPR', score: 97, status: 'compliant', lastAudit: '1 month ago', nextAudit: 'In 11 months' },
  { name: 'HIPAA', score: 91, status: 'compliant', lastAudit: '4 months ago', nextAudit: 'In 8 months' },
  { name: 'PCI DSS', score: 85, status: 'needs_attention', lastAudit: '2 months ago', nextAudit: 'In 10 months' },
];

const securityMetrics = [
  { label: 'Failed Logins (24h)', value: 145, trend: '-12%', trendUp: true, icon: XCircle, color: 'text-orange-500' },
  { label: 'Active Sessions', value: 2450, trend: '+5%', trendUp: true, icon: Users, color: 'text-blue-500' },
  { label: 'MFA Adoption', value: '87%', trend: '+3%', trendUp: true, icon: Fingerprint, color: 'text-green-500' },
  { label: 'Open Vulnerabilities', value: 23, trend: '-8', trendUp: true, icon: AlertTriangle, color: 'text-red-500' },
];

export default function SecurityPage() {
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredVulns = vulnerabilities.filter(v => severityFilter === 'all' || v.severity === severityFilter);

  const severityColors: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-600',
    high: 'bg-orange-500/10 text-orange-600',
    medium: 'bg-yellow-500/10 text-yellow-600',
    low: 'bg-blue-500/10 text-blue-600',
  };

  const eventsRiskColors: Record<string, string> = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };

  return (
    <AppShell>
      <PageHeader
        title="Security Operations"
        description="Security monitoring, compliance, and threat management"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
            <Button className="gap-2 rounded-xl">
              <Shield className="h-4 w-4" />
              Run Audit
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Security Score</span>
            </div>
          </div>
          <div className="text-center">
            <div className="relative inline-flex">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-muted" />
                <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={214} strokeDashoffset={214 * (1 - 0.89)} className="text-green-500" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold">89</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Good - Room to improve</p>
          </div>
        </motion.div>

        {securityMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <metric.icon className={cn('h-4 w-4', metric.color)} />
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{metric.value}</p>
              <div className={cn('flex items-center gap-1 text-xs', metric.trendUp ? 'text-green-600' : 'text-red-600')}>
                {metric.trendUp ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {metric.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="auth" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="auth" className="rounded-lg gap-1.5">
            <Key className="h-4 w-4" />
            Auth Events
          </TabsTrigger>
          <TabsTrigger value="vulnerabilities" className="rounded-lg gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Vulnerabilities
          </TabsTrigger>
          <TabsTrigger value="drift" className="rounded-lg gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Config Drift
          </TabsTrigger>
          <TabsTrigger value="compliance" className="rounded-lg gap-1.5">
            <FileText className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="access" className="rounded-lg gap-1.5">
            <Lock className="h-4 w-4" />
            Access Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Authentication Events</CardTitle>
                  <CardDescription>Recent login attempts and security events</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    placeholder="Search events..."
                    className="pl-10 pr-4 py-2 rounded-lg border bg-background text-sm w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y font-mono text-sm">
                {authEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground w-24">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                    <div className={cn('w-2 h-2 rounded-full',
                      event.risk === 'critical' && 'bg-red-500 animate-pulse',
                      event.risk === 'high' && 'bg-orange-500',
                      event.risk === 'medium' && 'bg-yellow-500',
                      event.risk === 'low' && 'bg-green-500'
                    )} />
                    <Badge className={cn('text-[10px]', severityColors[event.risk] || 'bg-muted')}>
                      {event.risk}
                    </Badge>
                    <div className="flex-1">
                      <span className="font-medium">{event.user}</span>
                      <span className="text-muted-foreground mx-2">•</span>
                      <span className={cn(
                        event.event.includes('failed') || event.event.includes('brute') ? 'text-red-600' :
                        event.event.includes('success') ? 'text-green-600' : 'text-blue-600'
                      )}>
                        {event.event.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.ip !== '-' && <span>{event.ip}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.location}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Vulnerability Management</CardTitle>
                  <CardDescription>Tracked CVEs and patch status</CardDescription>
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32">
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
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">CVE ID</th>
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Component</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Severity</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Affected</th>
                      <th className="p-4 text-center text-xs font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-right text-xs font-medium text-muted-foreground">Discovered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVulns.map((vuln) => (
                      <tr key={vuln.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <code className="text-sm">{vuln.id}</code>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium">{vuln.component}</p>
                            <p className="text-xs text-muted-foreground">v{vuln.version}</p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Badge className={cn('text-[10px]', severityColors[vuln.severity])}>
                            {vuln.severity}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">{vuln.affected}</td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className={cn(
                            'text-[10px]',
                            vuln.status === 'resolved' && 'text-green-600',
                            vuln.status === 'patching' && 'text-blue-600',
                            vuln.status === 'open' && 'text-red-600'
                          )}>
                            {vuln.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right text-sm text-muted-foreground">{vuln.discovered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drift" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuration Drift Detection</CardTitle>
              <CardDescription>Infrastructure configuration changes and anomalies</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {configDrift.map((drift, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        drift.severity === 'critical' && 'bg-red-500/10',
                        drift.severity === 'high' && 'bg-orange-500/10',
                        drift.severity === 'medium' && 'bg-yellow-500/10',
                        drift.severity === 'low' && 'bg-blue-500/10'
                      )}>
                        <RefreshCw className={cn(
                          'h-5 w-5',
                          drift.severity === 'critical' && 'text-red-600',
                          drift.severity === 'high' && 'text-orange-600',
                          drift.severity === 'medium' && 'text-yellow-600',
                          drift.severity === 'low' && 'text-blue-600'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium">{drift.resource}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px]">{drift.type}</Badge>
                          <span>{drift.drift}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn('text-[10px]', severityColors[drift.severity])}>
                        {drift.severity}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{drift.detected}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceFrameworks.map((framework, i) => (
              <motion.div
                key={framework.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn('overflow-hidden', framework.status === 'needs_attention' && 'border-yellow-500/50')}>
                  <div className={cn('h-1',
                    framework.status === 'compliant' && 'bg-green-500',
                    framework.status === 'needs_attention' && 'bg-yellow-500'
                  )} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{framework.name}</CardTitle>
                      <Badge className={cn(
                        'text-[10px]',
                        framework.status === 'compliant' && 'bg-green-500/10 text-green-600',
                        framework.status === 'needs_attention' && 'bg-yellow-500/10 text-yellow-600'
                      )}>
                        {framework.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Compliance Score</span>
                        <span className="font-bold">{framework.score}%</span>
                      </div>
                      <Progress value={framework.score} className="h-2" />
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Last Audit</span>
                        <span>{framework.lastAudit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Next Audit</span>
                        <span>{framework.nextAudit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="access" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Role-Based Access Control</CardTitle>
                <CardDescription>Permission levels and role assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { role: 'Admin', users: 3, permissions: 'Full access' },
                    { role: 'Developer', users: 28, permissions: 'Read/Write non-prod' },
                    { role: 'Analyst', users: 45, permissions: 'Read-only' },
                    { role: 'Support', users: 12, permissions: 'Customer data access' },
                  ].map((item) => (
                    <div key={item.role} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{item.role}</p>
                        <p className="text-xs text-muted-foreground">{item.permissions}</p>
                      </div>
                      <Badge variant="outline">{item.users} users</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security Policies</CardTitle>
                <CardDescription>Active security rules and configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Password Policy', status: 'Strong', icon: Key },
                    { name: 'MFA Required', status: 'Enabled', icon: Fingerprint },
                    { name: 'Session Timeout', status: '30 minutes', icon: Clock },
                    { name: 'IP Whitelisting', status: 'Enabled for admin', icon: Globe },
                    { name: 'Audit Logging', status: 'Full logging', icon: Eye },
                  ].map((policy) => (
                    <div key={policy.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <policy.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{policy.name}</span>
                      </div>
                      <Badge variant="outline" className="text-green-600">{policy.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
