'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Brain,
  Users,
  Zap,
  Activity,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart3,
  MessageSquare,
  FileText,
  DollarSign,
  Shield,
  Cpu,
  Target,
  Sparkles,
  Play,
  Pause,
  RefreshCw,
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

const agentCategories = [
  { key: 'executive', label: 'Executive', icon: Brain, color: 'from-purple-500/20 to-pink-500/20' },
  { key: 'sales', label: 'Sales & CRM', icon: Users, color: 'from-blue-500/20 to-cyan-500/20' },
  { key: 'finance', label: 'Finance', icon: DollarSign, color: 'from-green-500/20 to-emerald-500/20' },
  { key: 'hr', label: 'HR & People', icon: Users, color: 'from-orange-500/20 to-amber-500/20' },
  { key: 'marketing', label: 'Marketing', icon: Target, color: 'from-pink-500/20 to-rose-500/20' },
  { key: 'operations', label: 'Operations', icon: Zap, color: 'from-cyan-500/20 to-sky-500/20' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-indigo-500/20 to-violet-500/20' },
  { key: 'support', label: 'Support', icon: MessageSquare, color: 'from-teal-500/20 to-green-500/20' },
];

const agents = [
  { key: 'ceo_ai', name: 'CEO AI', category: 'executive', description: 'Strategic decision support and business intelligence', status: 'active', tasks: 156, success: 98.2 },
  { key: 'sales_ai', name: 'Sales AI', category: 'sales', description: 'Lead scoring, pipeline management, and sales optimization', status: 'active', tasks: 423, success: 94.5 },
  { key: 'crm_ai', name: 'CRM AI', category: 'sales', description: 'Customer data management and relationship insights', status: 'active', tasks: 892, success: 96.8 },
  { key: 'finance_ai', name: 'Finance AI', category: 'finance', description: 'Financial analysis and forecasting', status: 'active', tasks: 234, success: 97.1 },
  { key: 'gst_ai', name: 'GST AI', category: 'finance', description: 'GST compliance and filing assistance', status: 'active', tasks: 89, success: 99.2 },
  { key: 'invoice_ai', name: 'Invoice AI', category: 'finance', description: 'Invoice processing and validation', status: 'active', tasks: 1245, success: 98.9 },
  { key: 'hr_ai', name: 'HR AI', category: 'hr', description: 'Employee management and HR analytics', status: 'active', tasks: 167, success: 95.3 },
  { key: 'recruitment_ai', name: 'Recruitment AI', category: 'hr', description: 'Candidate screening and hiring support', status: 'active', tasks: 78, success: 91.2 },
  { key: 'marketing_ai', name: 'Marketing AI', category: 'marketing', description: 'Campaign optimization and content strategy', status: 'active', tasks: 342, success: 93.7 },
  { key: 'support_ai', name: 'Support AI', category: 'support', description: 'Customer support and ticket routing', status: 'active', tasks: 2156, success: 94.8 },
  { key: 'document_ai', name: 'Document AI', category: 'operations', description: 'Document processing and extraction', status: 'active', tasks: 567, success: 97.4 },
  { key: 'workflow_ai', name: 'Workflow AI', category: 'operations', description: 'Workflow automation and orchestration', status: 'active', tasks: 445, success: 96.1 },
  { key: 'analytics_ai', name: 'Analytics AI', category: 'analytics', description: 'Data analysis and insights generation', status: 'active', tasks: 289, success: 95.9 },
  { key: 'bi_ai', name: 'Business Intelligence AI', category: 'analytics', description: 'Executive dashboards and reporting', status: 'active', tasks: 178, success: 97.6 },
  { key: 'security_ai', name: 'Security AI', category: 'executive', description: 'Threat detection and security monitoring', status: 'active', tasks: 890, success: 99.1 },
  { key: 'compliance_ai', name: 'Compliance AI', category: 'executive', description: 'Regulatory compliance and audit support', status: 'active', tasks: 123, success: 98.7 },
];

const recentTasks = [
  { agent: 'Invoice AI', task: 'Process invoice INV-2024-0892', status: 'completed', duration: '2.3s' },
  { agent: 'CRM AI', task: 'Analyze customer churn risk', status: 'completed', duration: '4.1s' },
  { agent: 'Support AI', task: 'Route ticket #4521 to agent', status: 'completed', duration: '0.8s' },
  { agent: 'Document AI', task: 'Extract data from contract.pdf', status: 'running', duration: '-' },
  { agent: 'Finance AI', task: 'Generate Q2 forecast report', status: 'completed', duration: '12.5s' },
];

export default function MultiAgentPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgents = agents.filter(agent => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalTasks: agents.reduce((sum, a) => sum + a.tasks, 0),
    avgSuccess: (agents.reduce((sum, a) => sum + a.success, 0) / agents.length).toFixed(1),
    categories: agentCategories.length,
    escalations: 12,
  };

  return (
    <AppShell>
      <PageHeader
        title="Multi-Agent Intelligence"
        description="27 specialized AI agents working together"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
            <Button className="gap-2 rounded-xl">
              <Sparkles className="h-4 w-4" />
              New Agent
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Agents', value: stats.totalAgents, icon: Bot, color: 'text-blue-500' },
          { label: 'Active', value: stats.activeAgents, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Tasks Today', value: stats.totalTasks.toLocaleString(), icon: Activity, color: 'text-purple-500' },
          { label: 'Avg Success', value: `${stats.avgSuccess}%`, icon: Target, color: 'text-emerald-500' },
          { label: 'Categories', value: stats.categories, icon: Brain, color: 'text-cyan-500' },
          { label: 'Escalations', value: stats.escalations, icon: AlertTriangle, color: 'text-orange-500' },
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

      <Tabs defaultValue="agents" className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="glass-card p-1 h-auto">
            <TabsTrigger value="agents" className="rounded-lg gap-1.5">
              <Bot className="h-4 w-4" />
              All Agents
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg gap-1.5">
              <Brain className="h-4 w-4" />
              By Category
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-lg gap-1.5">
              <Activity className="h-4 w-4" />
              Recent Tasks
            </TabsTrigger>
            <TabsTrigger value="collaborations" className="rounded-lg gap-1.5">
              <Users className="h-4 w-4" />
              Collaborations
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {agentCategories.map(cat => (
                  <SelectItem key={cat.key} value={cat.key}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="agents" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent, i) => (
              <motion.div
                key={agent.key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                  <div className="h-1 bg-gradient-to-r from-primary/50 to-primary" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{agent.name}</CardTitle>
                          <Badge variant="outline" className="text-[10px] mt-1 capitalize">{agent.category}</Badge>
                        </div>
                      </div>
                      <Switch checked={agent.status === 'active'} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">{agent.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground">Tasks</p>
                        <p className="font-medium">{agent.tasks.toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground">Success</p>
                        <p className="font-medium text-green-600">{agent.success}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {agentCategories.map((category, i) => {
              const categoryAgents = agents.filter(a => a.category === category.key);
              const totalTasks = categoryAgents.reduce((sum, a) => sum + a.tasks, 0);
              return (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={cn('overflow-hidden bg-gradient-to-br', category.color)}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center">
                          <category.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{category.label}</CardTitle>
                          <p className="text-xs text-muted-foreground">{categoryAgents.length} agents</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tasks Today</span>
                        <span className="font-bold">{totalTasks.toLocaleString()}</span>
                      </div>
                      <div className="mt-3 space-y-1">
                        {categoryAgents.slice(0, 3).map(agent => (
                          <div key={agent.key} className="flex items-center justify-between text-xs">
                            <span>{agent.name}</span>
                            <Badge variant="outline" className="text-[10px]">{agent.success}%</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Agent Tasks</CardTitle>
              <CardDescription>Live task execution across all agents</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentTasks.map((task, i) => (
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
                        task.status === 'completed' ? 'bg-green-500/10' : 'bg-blue-500/10'
                      )}>
                        {task.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm">{task.task}</p>
                        <p className="text-xs text-muted-foreground">{task.agent}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn(
                        'text-[10px]',
                        task.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'
                      )}>
                        {task.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{task.duration}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborations" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agent Collaborations</CardTitle>
              <CardDescription>Multi-agent workflows in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Invoice Processing Pipeline', agents: ['Document AI', 'Invoice AI', 'Finance AI'], status: 'active', completed: 45 },
                  { name: 'Customer Onboarding Flow', agents: ['CRM AI', 'Support AI', 'Workflow AI'], status: 'active', completed: 23 },
                  { name: 'Monthly Report Generation', agents: ['Analytics AI', 'BI AI', 'Document AI'], status: 'completed', completed: 100 },
                  { name: 'Lead Qualification', agents: ['Sales AI', 'Marketing AI', 'CRM AI'], status: 'active', completed: 78 },
                ].map((workflow, i) => (
                  <div key={workflow.name} className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium">{workflow.name}</p>
                      <Badge className={cn(
                        'text-[10px]',
                        workflow.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'
                      )}>
                        {workflow.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {workflow.agents.map((agent, idx) => (
                        <span key={agent} className="flex items-center text-xs">
                          <Badge variant="outline" className="text-[10px]">{agent}</Badge>
                          {idx < workflow.agents.length - 1 && <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${workflow.completed}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{workflow.completed}%</span>
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

function ArrowRight({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>;
}
