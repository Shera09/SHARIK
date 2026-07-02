'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  Copy,
  Zap,
  Users,
  FileText,
  Mail,
  MessageSquare,
  Calendar,
  Bell,
  Clock,
  Eye,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const suggestions = [
  {
    title: 'New Lead Onboarding',
    description: 'When a new lead is created, send welcome email and WhatsApp, assign sales person, create follow-up task',
    trigger: 'lead_created',
    nodes: 5,
    category: 'Sales',
  },
  {
    title: 'Invoice Payment Reminder',
    description: 'Send automated reminders for overdue invoices with escalating notifications',
    trigger: 'invoice_overdue',
    nodes: 4,
    category: 'Finance',
  },
  {
    title: 'Birthday Greetings',
    description: 'Send personalized birthday wishes via WhatsApp and email to customers',
    trigger: 'birthday',
    nodes: 2,
    category: 'Customer Engagement',
  },
  {
    title: 'GST Filing Reminder',
    description: 'Monthly reminder for GST filing with task creation and team notification',
    trigger: 'cron',
    nodes: 3,
    category: 'Compliance',
  },
  {
    title: 'High Value Lead Alert',
    description: 'Route high-value leads to senior sales with immediate follow-up scheduling',
    trigger: 'lead_created',
    nodes: 4,
    category: 'Sales',
  },
  {
    title: 'Service Renewal Reminder',
    description: 'Notify customers about upcoming service expiry and offer renewal discounts',
    trigger: 'service_expiry',
    nodes: 3,
    category: 'Retention',
  },
];

export default function AIWorkflowGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [applied, setApplied] = useState<string[]>([]);

  const generateWorkflow = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what you want to automate');
      return;
    }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setGenerated({
      name: 'Custom Workflow',
      description: prompt,
      trigger_type: 'manual',
      nodes: [
        { id: '1', type: 'trigger', data: { label: 'Start', triggerType: 'manual' }, position: { x: 100, y: 100 } },
        { id: '2', type: 'action', data: { label: 'Send Email', actionType: 'send_email' }, position: { x: 300, y: 100 } },
        { id: '3', type: 'action', data: { label: 'Send WhatsApp', actionType: 'send_whatsapp' }, position: { x: 500, y: 100 } },
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
      ],
    });
    setGenerating(false);
  };

  const applySuggestion = (title: string) => {
    setApplied((prev) => [...prev, title]);
    toast.success(`"${title}" workflow created!`);
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Workflow Generator"
        description="Describe what you want to automate and let AI build it for you"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generator */}
        <div className="space-y-6">
          {/* AI Generator Card */}
          <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wand2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Describe Your Workflow</h2>
                <p className="text-xs text-muted-foreground">Tell AI what to automate</p>
              </div>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="When someone fills the GST Registration form, send them a welcome email, create a lead, assign to sales team, and schedule a follow-up call..."
              className="mb-4"
            />
            <Button
              onClick={generateWorkflow}
              disabled={generating}
              className="w-full gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {generating ? 'Generating...' : 'Generate Workflow'}
            </Button>
          </Card>

          {/* Generated Result */}
          <AnimatePresence>
            {generated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-semibold">{generated.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{generated.description}</p>
                    </div>
                    <Badge className="shrink-0">AI Generated</Badge>
                  </div>

                  {/* Visual representation */}
                  <div className="p-4 rounded-xl bg-muted/30 mb-4">
                    <div className="flex items-center gap-2 justify-center">
                      {generated.nodes.map((node: any, i: number) => (
                        <div key={node.id} className="flex items-center gap-2">
                          <div className="w-20 h-12 rounded-lg bg-card border border-primary/30 flex items-center justify-center text-[10px] text-center px-1">
                            {node.data.label}
                          </div>
                          {i < generated.nodes.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button className="flex-1 gap-2">
                      <Zap className="h-4 w-4" />
                      Create Workflow
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h2 className="font-semibold">Ready-to-Use Workflow Templates</h2>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion, i) => (
              <motion.div
                key={suggestion.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      suggestion.category === 'Sales' ? 'bg-purple-500/10' :
                      suggestion.category === 'Finance' ? 'bg-green-500/10' :
                      suggestion.category === 'Customer Engagement' ? 'bg-pink-500/10' :
                      suggestion.category === 'Compliance' ? 'bg-orange-500/10' :
                      'bg-blue-500/10'
                    )}>
                      {suggestion.category === 'Sales' && <Users className="h-5 w-5 text-purple-500" />}
                      {suggestion.category === 'Finance' && <FileText className="h-5 w-5 text-green-500" />}
                      {suggestion.category === 'Customer Engagement' && <Mail className="h-5 w-5 text-pink-500" />}
                      {suggestion.category === 'Compliance' && <Calendar className="h-5 w-5 text-orange-500" />}
                      {suggestion.category === 'Retention' && <Bell className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{suggestion.title}</p>
                        <Badge variant="outline" className="text-[9px]">{suggestion.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {suggestion.trigger}
                        </span>
                        <span>{suggestion.nodes} nodes</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={applied.includes(suggestion.title)}
                      onClick={() => applySuggestion(suggestion.title)}
                    >
                      {applied.includes(suggestion.title) ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
