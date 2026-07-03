'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Users,
  Settings,
  Filter,
  Lock,
  Unlock,
  Ban,
  AlertCircle,
  Activity,
  Zap,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const safetyRules = [
  { id: '1', name: 'PII Detection', type: 'pii_detection', status: 'active', violations: 23, action: 'block', lastTriggered: '2 hours ago' },
  { id: '2', name: 'Toxic Content Filter', type: 'content_filter', status: 'active', violations: 5, action: 'block', lastTriggered: '1 day ago' },
  { id: '3', name: 'Prompt Injection Guard', type: 'prompt_injection', status: 'active', violations: 12, action: 'warn', lastTriggered: '5 hours ago' },
  { id: '4', name: 'Output Validation', type: 'output_validation', status: 'active', violations: 45, action: 'log', lastTriggered: '30 minutes ago' },
  { id: '5', name: 'Cost Limit Alert', type: 'cost_limit', status: 'active', violations: 2, action: 'escalate', lastTriggered: '3 days ago' },
  { id: '6', name: 'Rate Limiting', type: 'rate_limit', status: 'disabled', violations: 0, action: 'block', lastTriggered: '-' },
];

const contentFilters = [
  { name: 'Profanity Filter', type: 'keyword', applyTo: 'output', active: true, matches: 156 },
  { name: 'Personal Data Regex', type: 'regex', applyTo: 'input', active: true, matches: 234 },
  { name: 'Harmful Content Model', type: 'model', applyTo: 'both', active: true, matches: 12 },
  { name: 'Finance Data Mask', type: 'custom', applyTo: 'output', active: true, matches: 89 },
];

const auditEvents = [
  { time: '14:32:15', actor: 'Sales AI', action: 'POTENTIAL_PII_DETECTED', resource: 'Customer Record', severity: 'medium', blocked: true },
  { time: '14:15:00', actor: 'Support AI', action: 'CONTENT_FILTER_TRIGGERED', resource: 'Email Draft', severity: 'low', blocked: false },
  { time: '13:45:22', actor: 'Finance AI', action: 'SENSITIVE_DATA_ACCESS', resource: 'Invoice INV-0892', severity: 'high', blocked: false },
  { time: '12:30:00', actor: 'CRM AI', action: 'RATE_LIMIT_EXCEEDED', resource: 'API Endpoint', severity: 'medium', blocked: true },
  { time: '11:15:45', actor: 'User (john.d)', action: 'COST_THRESHOLD_WARNING', resource: 'Model: GPT-4', severity: 'low', blocked: false },
];

const rateLimits = [
  { scope: 'user', requestsPerMinute: 60, requestsPerHour: 500, tokensPerDay: 100000, costPerDay: 10 },
  { scope: 'agent', requestsPerMinute: 120, requestsPerHour: 2000, tokensPerDay: 500000, costPerDay: 50 },
  { scope: 'model', requestsPerMinute: 300, requestsPerHour: 10000, tokensPerDay: 5000000, costPerDay: 500 },
  { scope: 'global', requestsPerMinute: 1000, requestsPerHour: 50000, tokensPerDay: 25000000, costPerDay: 2500 },
];

export default function GovernancePage() {
  const [selectedRuleType, setSelectedRuleType] = useState('all');

  const stats = {
    activeRules: safetyRules.filter(r => r.status === 'active').length,
    violationsToday: 87,
    blockedActions: 23,
    auditEvents: 1256,
    avgResponseTime: '45ms',
    complianceScore: 98.5,
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Governance"
        description="Safety rules, content filters, and audit logging"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Export Audit Log
            </Button>
            <Button className="gap-2 rounded-xl">
              <Shield className="h-4 w-4" />
              New Rule
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Active Rules', value: stats.activeRules, icon: Shield, color: 'text-blue-500' },
          { label: 'Violations Today', value: stats.violationsToday, icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Blocked', value: stats.blockedActions, icon: Ban, color: 'text-red-500' },
          { label: 'Audit Events', value: stats.auditEvents.toLocaleString(), icon: Eye, color: 'text-purple-500' },
          { label: 'Response Time', value: stats.avgResponseTime, icon: Zap, color: 'text-green-500' },
          { label: 'Compliance', value: `${stats.complianceScore}%`, icon: CheckCircle, color: 'text-emerald-500' },
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

      <Tabs defaultValue="rules" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="rules" className="rounded-lg gap-1.5">
            <Shield className="h-4 w-4" />
            Safety Rules
          </TabsTrigger>
          <TabsTrigger value="filters" className="rounded-lg gap-1.5">
            <Filter className="h-4 w-4" />
            Content Filters
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-lg gap-1.5">
            <Eye className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="limits" className="rounded-lg gap-1.5">
            <Lock className="h-4 w-4" />
            Rate Limits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Safety Rules</CardTitle>
                  <CardDescription>Automated guardrails for AI behavior</CardDescription>
                </div>
                <Select value={selectedRuleType} onValueChange={setSelectedRuleType}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="content_filter">Content Filter</SelectItem>
                    <SelectItem value="pii_detection">PII Detection</SelectItem>
                    <SelectItem value="prompt_injection">Prompt Injection</SelectItem>
                    <SelectItem value="output_validation">Output Validation</SelectItem>
                    <SelectItem value="rate_limit">Rate Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {safetyRules.map((rule, i) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        rule.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'
                      )}>
                        {rule.status === 'active' ? <Shield className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px] capitalize">{rule.type.replace('_', ' ')}</Badge>
                          <span>{rule.violations} violations</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={cn(
                          'text-[10px]',
                          rule.action === 'block' && 'bg-red-500/10 text-red-600',
                          rule.action === 'warn' && 'bg-yellow-500/10 text-yellow-600',
                          rule.action === 'log' && 'bg-blue-500/10 text-blue-600',
                          rule.action === 'escalate' && 'bg-purple-500/10 text-purple-600'
                        )}>
                          {rule.action}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{rule.lastTriggered}</p>
                      </div>
                      <Switch checked={rule.status === 'active'} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Filters</CardTitle>
              <CardDescription>Real-time content moderation rules</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {contentFilters.map((filter, i) => (
                  <motion.div
                    key={filter.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Filter className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{filter.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px] capitalize">{filter.type}</Badge>
                          <span>Apply to: {filter.applyTo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{filter.matches.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">matches</p>
                      </div>
                      <Switch checked={filter.active} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Log</CardTitle>
              <CardDescription>Recent security and governance events</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y font-mono text-sm">
                {auditEvents.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground w-20">{event.time}</span>
                    <div className="w-2 h-2 rounded-full shrink-0 bg-green-500" />
                    <Badge variant="outline" className="text-[10px] capitalize">{event.actor}</Badge>
                    <span className={cn(
                      'flex-1',
                      event.blocked && 'text-red-600'
                    )}>
                      {event.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-muted-foreground">{event.resource}</span>
                    <Badge className={cn(
                      'text-[10px]',
                      event.severity === 'high' && 'bg-red-500/10 text-red-600',
                      event.severity === 'medium' && 'bg-orange-500/10 text-orange-600',
                      event.severity === 'low' && 'bg-blue-500/10 text-blue-600'
                    )}>
                      {event.severity}
                    </Badge>
                    {event.blocked && (
                      <Badge variant="outline" className="text-red-600 text-[10px]">
                        <Ban className="h-3 w-3 mr-1" />
                        Blocked
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rate Limiting Configuration</CardTitle>
              <CardDescription>Prevent abuse and control costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {rateLimits.map((limit) => (
                  <div key={limit.scope} className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium capitalize">{limit.scope} Level</p>
                      <Switch checked={true} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Requests/Min</p>
                        <p className="font-medium">{limit.requestsPerMinute}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Requests/Hour</p>
                        <p className="font-medium">{limit.requestsPerHour}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Tokens/Day</p>
                        <p className="font-medium">{limit.tokensPerDay.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Cost/Day</p>
                        <p className="font-medium">${limit.costPerDay}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
