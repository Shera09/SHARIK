'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Plus,
  Search,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  Users,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  ArrowRight,
  Target,
  Sparkles,
  Workflow,
  Send,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const triggerTypes: Record<string, { icon: typeof Zap; label: string }> = {
  lead_created: { icon: Users, label: 'New Lead Created' },
  form_submitted: { icon: Target, label: 'Form Submitted' },
  email_opened: { icon: Mail, label: 'Email Opened' },
  purchase_made: { icon: CheckCircle2, label: 'Purchase Made' },
  tag_added: { icon: Sparkles, label: 'Tag Added' },
};

export default function MarketingAutomationPage() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const mockWorkflows = [
    { id: '1', workflow_name: 'New Lead Welcome Sequence', trigger_type: 'lead_created', workflow_status: 'active', execution_count: 1250, success_count: 1198, steps: ['Send Welcome Email', 'Wait 2 hours', 'Send WhatsApp', 'Assign Sales Rep'] },
    { id: '2', workflow_name: 'Abandoned Cart Follow-up', trigger_type: 'form_submitted', workflow_status: 'active', execution_count: 850, success_count: 820, steps: ['Send Email', 'Wait 24 hours', 'Send SMS Reminder', 'Apply Tag'] },
    { id: '3', workflow_name: 'Post-Purchase Thank You', trigger_type: 'purchase_made', workflow_status: 'paused', execution_count: 520, success_count: 505, steps: ['Send Thank You Email', 'Add to Loyalty Program', 'Request Review'] },
    { id: '4', workflow_name: 'Newsletter Subscriber', trigger_type: 'form_submitted', workflow_status: 'draft', execution_count: 0, success_count: 0, steps: ['Send Confirmation', 'Wait 5 min', 'Send Welcome'] },
  ];

  const stats = {
    total: mockWorkflows.length,
    active: mockWorkflows.filter(w => w.workflow_status === 'active').length,
    totalExecutions: mockWorkflows.reduce((sum, w) => sum + w.execution_count, 0),
    successRate: 97,
  };

  return (
    <AppShell>
      <PageHeader
        title="Marketing Automation"
        description="Build automated workflows to nurture leads and engage customers"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Automation Workflow</DialogTitle>
                <DialogDescription>Set up automated marketing sequences</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Workflow Name</Label>
                  <Input className="mt-1.5" placeholder="e.g., New Lead Welcome Sequence" />
                </div>
                <div>
                  <Label>Trigger</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(triggerTypes).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Workflow Steps</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Send Email: Welcome Message</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Wait: 2 hours</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">Send WhatsApp: Follow-up</span>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-2 gap-1"><Plus className="h-4 w-4" /> Add Step</Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button variant="outline">Save Draft</Button>
                <Button onClick={() => setCreateDialogOpen(false)}>Activate</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Workflows', value: stats.total, icon: Workflow, color: 'text-blue-600' },
          { label: 'Active', value: stats.active, icon: Play, color: 'text-green-600' },
          { label: 'Total Executions', value: stats.totalExecutions.toLocaleString(), icon: Zap, color: 'text-purple-600' },
          { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle2, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Workflows */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockWorkflows.map((workflow, i) => {
          const triggerConfig = triggerTypes[workflow.trigger_type] || triggerTypes.lead_created;
          const TriggerIcon = triggerConfig.icon;

          return (
            <motion.div key={workflow.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-medium">{workflow.workflow_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <TriggerIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{triggerConfig.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={workflow.workflow_status === 'active' ? 'bg-green-500/10 text-green-700' : workflow.workflow_status === 'paused' ? 'bg-yellow-500/10 text-yellow-700' : 'bg-gray-500/10 text-gray-700'}>
                        {workflow.workflow_status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                          {workflow.workflow_status === 'active' && (
                            <DropdownMenuItem><Pause className="h-4 w-4 mr-2" /> Pause</DropdownMenuItem>
                          )}
                          {workflow.workflow_status === 'paused' && (
                            <DropdownMenuItem><Play className="h-4 w-4 mr-2" /> Activate</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    {workflow.steps.map((step: string, idx: number) => (
                      <span key={idx} className="flex items-center">
                        <span className="px-2 py-1 rounded bg-muted text-xs">{step}</span>
                        {idx < workflow.steps.length - 1 && <ArrowRight className="h-4 w-4 mx-1" />}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t">
                    <div>
                      <p className="text-lg font-bold">{workflow.execution_count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Executions</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{workflow.success_count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Successes</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{workflow.execution_count > 0 ? Math.round((workflow.success_count / workflow.execution_count) * 100) : 0}%</p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}
