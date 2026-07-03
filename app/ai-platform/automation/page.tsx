'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Play,
  Pause,
  RefreshCw,
  Settings,
  ArrowRight,
  Filter,
  Calendar,
  FileText,
  Users,
  DollarSign,
  MessageSquare,
  Target,
  BarChart3,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const automationActions = [
  { key: 'create_task', name: 'Create Task', category: 'create', resource: 'tasks', requiresApproval: false, executions: 1245, success: 97.8 },
  { key: 'schedule_meeting', name: 'Schedule Meeting', category: 'schedule', resource: 'calendar', requiresApproval: false, executions: 456, success: 99.1 },
  { key: 'generate_invoice', name: 'Generate Invoice', category: 'generate', resource: 'invoices', requiresApproval: true, executions: 234, success: 98.5 },
  { key: 'draft_quotation', name: 'Draft Quotation', category: 'generate', resource: 'quotations', requiresApproval: false, executions: 189, success: 96.2 },
  { key: 'assign_lead', name: 'Assign Lead', category: 'assign', resource: 'leads', requiresApproval: true, executions: 312, success: 94.5 },
  { key: 'draft_email', name: 'Draft Email', category: 'generate', resource: 'emails', requiresApproval: false, executions: 890, success: 95.8 },
  { key: 'send_whatsapp', name: 'Send WhatsApp', category: 'send', resource: 'whatsapp', requiresApproval: true, executions: 567, success: 99.2 },
  { key: 'generate_report', name: 'Generate Report', category: 'generate', resource: 'reports', requiresApproval: false, executions: 123, success: 97.4 },
  { key: 'analyze_dashboard', name: 'Analyze Dashboard', category: 'analyze', resource: 'analytics', requiresApproval: false, executions: 456, success: 98.9 },
  { key: 'recommend_followup', name: 'Recommend Follow-up', category: 'analyze', resource: 'crm', requiresApproval: false, executions: 678, success: 96.7 },
];

const pendingApprovals = [
  { id: '1', action: 'Generate Invoice', agent: 'Invoice AI', input: 'Customer: ABC Corp, Amount: $4,567.89', requestedAt: '10 minutes ago' },
  { id: '2', action: 'Assign Lead', agent: 'Sales AI', input: 'Lead: John Smith, Recommend: Sarah Johnson', requestedAt: '25 minutes ago' },
  { id: '3', action: 'Send WhatsApp', agent: 'Marketing AI', input: 'Campaign: Q3 Promo, Recipients: 1,234', requestedAt: '1 hour ago' },
];

const recentExecutions = [
  { id: '1', action: 'Create Task', status: 'completed', agent: 'Workflow AI', duration: '1.2s', time: '2 hours ago' },
  { id: '2', action: 'Draft Email', status: 'completed', agent: 'Sales AI', duration: '3.5s', time: '3 hours ago' },
  { id: '3', action: 'Generate Report', status: 'completed', agent: 'Analytics AI', duration: '12.8s', time: '4 hours ago' },
  { id: '4', action: 'Create Task', status: 'completed', agent: 'Support AI', duration: '0.8s', time: '5 hours ago' },
  { id: '5', action: 'Schedule Meeting', status: 'failed', agent: 'Meeting AI', duration: '-', time: '6 hours ago' },
];

export default function AIAutomationPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [approving, setApproving] = useState<string | null>(null);

  const stats = {
    totalExecutions: automationActions.reduce((s, a) => s + a.executions, 0),
    avgSuccess: (automationActions.reduce((s, a) => s + a.success, 0) / automationActions.length).toFixed(1),
    pendingApprovals: pendingApprovals.length,
    automationRate: 94.5,
    timeSaved: '156 hours',
    actionsAvailable: automationActions.length,
  };

  function approve(id: string) {
    setApproving(id);
    setTimeout(() => {
      setApproving(null);
    }, 1500);
  }

  const filteredActions = selectedCategory === 'all'
    ? automationActions
    : automationActions.filter(a => a.category === selectedCategory);

  return (
    <AppShell>
      <PageHeader
        title="AI Automation Engine"
        description="Automated actions with human oversight for high-impact decisions"
        action={
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure Rules
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Executions', value: stats.totalExecutions.toLocaleString(), icon: Zap, color: 'text-blue-500' },
          { label: 'Success Rate', value: `${stats.avgSuccess}%`, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Pending Approvals', value: stats.pendingApprovals, icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Automation Rate', value: `${stats.automationRate}%`, icon: Bot, color: 'text-purple-500' },
          { label: 'Time Saved', value: stats.timeSaved, icon: Clock, color: 'text-cyan-500' },
          { label: 'Actions', value: stats.actionsAvailable, icon: Target, color: 'text-pink-500' },
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

      {/* Pending Approvals Banner */}
      {pendingApprovals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-base">{pendingApprovals.length} Actions Awaiting Approval</CardTitle>
                </div>
                <Badge variant="outline" className="text-orange-600">Requires Review</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-orange-500/20">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.agent} • {item.requestedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button
                        onClick={() => approve(item.id)}
                        disabled={approving === item.id}
                        className="gap-2 rounded-lg"
                      >
                        {approving === item.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="actions" className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="glass-card p-1 h-auto">
            <TabsTrigger value="actions" className="rounded-lg gap-1.5">
              <Zap className="h-4 w-4" />
              All Actions
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg gap-1.5">
              <Clock className="h-4 w-4" />
              Execution History
            </TabsTrigger>
            <TabsTrigger value="rules" className="rounded-lg gap-1.5">
              <Settings className="h-4 w-4" />
              Approval Rules
            </TabsTrigger>
          </TabsList>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="generate">Generate</SelectItem>
              <SelectItem value="schedule">Schedule</SelectItem>
              <SelectItem value="send">Send</SelectItem>
              <SelectItem value="assign">Assign</SelectItem>
              <SelectItem value="analyze">Analyze</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="actions" className="mt-0">
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredActions.map((action, i) => (
              <motion.div
                key={action.key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={cn(action.requiresApproval && 'border-orange-500/30')}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          action.category === 'create' && 'bg-blue-500/10 text-blue-600',
                          action.category === 'generate' && 'bg-purple-500/10 text-purple-600',
                          action.category === 'schedule' && 'bg-green-500/10 text-green-600',
                          action.category === 'send' && 'bg-cyan-500/10 text-cyan-600',
                          action.category === 'assign' && 'bg-orange-500/10 text-orange-600',
                          action.category === 'analyze' && 'bg-pink-500/10 text-pink-600'
                        )}>
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{action.name}</p>
                          <p className="text-xs text-muted-foreground">Target: {action.resource}</p>
                        </div>
                      </div>
                      <Switch checked={!action.requiresApproval} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {action.requiresApproval && (
                          <Badge variant="outline" className="text-orange-600 text-[10px]">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Approval Required
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] capitalize">{action.category}</Badge>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-muted-foreground">{action.executions.toLocaleString()} runs</p>
                        <p className="text-green-600 font-medium">{action.success}% success</p>
                      </div>
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
              <CardTitle className="text-base">Recent Executions</CardTitle>
              <CardDescription>Automated action history</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentExecutions.map((exec, i) => (
                  <motion.div
                    key={exec.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        exec.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                      )}>
                        {exec.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{exec.action}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px]">{exec.agent}</Badge>
                          {exec.duration !== '-' && <span>{exec.duration}</span>}
                          <span>{exec.time}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={cn(
                      'text-[10px]',
                      exec.status === 'completed' && 'bg-green-500/10 text-green-600',
                      exec.status === 'failed' && 'bg-red-500/10 text-red-600'
                    )}>
                      {exec.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approval Rules</CardTitle>
              <CardDescription>Configure which actions require human approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rule: 'Actions with financial impact', condition: 'amount > $1000', approval: true },
                  { rule: 'External communications', condition: 'channel = whatsapp|email', approval: true },
                  { rule: 'Data modifications', condition: 'action = delete|update', approval: true },
                  { rule: 'Read-only operations', condition: 'action = read|analyze', approval: false },
                  { rule: 'Internal task creation', condition: 'resource = tasks', approval: false },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{rule.rule}</p>
                      <code className="text-xs text-muted-foreground">{rule.condition}</code>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn(
                        'text-[10px]',
                        rule.approval ? 'text-orange-600' : 'text-green-600'
                      )}>
                        {rule.approval ? 'Requires Approval' : 'Auto-Execute'}
                      </Badge>
                      <Switch checked={rule.approval} />
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
