'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  List,
  Search,
  Filter,
  RefreshCcw,
  User,
  FileText,
  CheckSquare,
  MessageSquare,
  Video,
  Zap,
  ShoppingCart,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Star,
  Edit,
  Trash2,
  Eye,
  Bot,
  GitBranch,
  Mail,
  MoreHorizontal,
  Clock,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ActivityEvent {
  event_id: string;
  user_id: string;
  actor_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  title: string;
  description: string;
  metadata: any;
  created_at: string;
}

const eventIcons: Record<string, typeof User> = {
  task_created: CheckSquare,
  task_updated: CheckSquare,
  task_completed: CheckSquare,
  message_sent: MessageSquare,
  meeting_scheduled: Video,
  meeting_started: Video,
  meeting_ended: Video,
  document_created: FileText,
  document_updated: FileText,
  comment_added: MessageSquare,
  invoice_created: ShoppingCart,
  payment_received: DollarSign,
  lead_created: User,
  customer_updated: Users,
  workflow_executed: GitBranch,
  ai_generated: Bot,
  email_sent: Mail,
  project_updated: Building2,
  announcement_published: Zap,
};

const eventTypeLabels: Record<string, string> = {
  task_created: 'Task Created',
  task_updated: 'Task Updated',
  task_completed: 'Task Completed',
  message_sent: 'Message Sent',
  meeting_scheduled: 'Meeting Scheduled',
  meeting_started: 'Meeting Started',
  meeting_ended: 'Meeting Ended',
  document_created: 'Document Created',
  document_updated: 'Document Updated',
  comment_added: 'Comment Added',
  invoice_created: 'Invoice Created',
  payment_received: 'Payment Received',
  lead_created: 'Lead Created',
  customer_updated: 'Customer Updated',
  workflow_executed: 'Workflow Executed',
  ai_generated: 'AI Generated',
  email_sent: 'Email Sent',
  project_updated: 'Project Updated',
  announcement_published: 'Announcement Published',
};

const eventTypeColors: Record<string, string> = {
  task: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  message: 'bg-green-500/10 text-green-700 border-green-500/20',
  meeting: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  document: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  invoice: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  payment: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  lead: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  customer: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  workflow: 'bg-pink-500/10 text-pink-700 border-pink-500/20',
  ai: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
  email: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
  project: 'bg-teal-500/10 text-teal-700 border-teal-500/20',
  announcement: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
};

export default function ActivityTimelinePage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const { data, error } = await supabase
        .from('activity_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading activity events:', error);
    } finally {
      setLoading(false);
    }
  }

  // Mock events
  const mockEvents = events.length > 0 ? events : [
    { event_id: '1', user_id: 'u1', actor_id: 'u1', event_type: 'task_completed', entity_type: 'task', entity_id: 't1', title: 'Task Completed', description: 'Sarah Johnson completed "Update documentation"', metadata: {}, created_at: new Date(Date.now() - 600000).toISOString() },
    { event_id: '2', user_id: 'u2', actor_id: 'u2', event_type: 'meeting_scheduled', entity_type: 'meeting', entity_id: 'm1', title: 'Meeting Scheduled', description: 'Michael Chen scheduled "Weekly Standup"', metadata: {}, created_at: new Date(Date.now() - 1200000).toISOString() },
    { event_id: '3', user_id: 'u3', actor_id: 'u3', event_type: 'document_updated', entity_type: 'document', entity_id: 'd1', title: 'Document Updated', description: 'Emily Davis updated "Q3 Roadmap"', metadata: {}, created_at: new Date(Date.now() - 1800000).toISOString() },
    { event_id: '4', user_id: 'u4', actor_id: 'u4', event_type: 'message_sent', entity_type: 'message', entity_id: 'msg1', title: 'Message Sent', description: 'Alex Thompson sent a message in #general', metadata: {}, created_at: new Date(Date.now() - 2400000).toISOString() },
    { event_id: '5', user_id: 'u1', actor_id: 'u1', event_type: 'invoice_created', entity_type: 'invoice', entity_id: 'inv1', title: 'Invoice Created', description: 'Sarah Johnson created invoice #INV-2024-001', metadata: {}, created_at: new Date(Date.now() - 3000000).toISOString() },
    { event_id: '6', user_id: 'u2', actor_id: 'u2', event_type: 'ai_generated', entity_type: 'ai', entity_id: 'ai1', title: 'AI Generated', description: 'Michael Chen generated a meeting summary using AI', metadata: {}, created_at: new Date(Date.now() - 3600000).toISOString() },
    { event_id: '7', user_id: 'u3', actor_id: 'u3', event_type: 'lead_created', entity_type: 'lead', entity_id: 'l1', title: 'Lead Created', description: 'Emily Davis created lead "Acme Corp"', metadata: {}, created_at: new Date(Date.now() - 4200000).toISOString() },
    { event_id: '8', user_id: 'u1', actor_id: 'u1', event_type: 'payment_received', entity_type: 'payment', entity_id: 'p1', title: 'Payment Received', description: 'Payment of ₹50,000 received from Tech Solutions Ltd', metadata: {}, created_at: new Date(Date.now() - 4800000).toISOString() },
    { event_id: '9', user_id: 'u4', actor_id: 'u4', event_type: 'workflow_executed', entity_type: 'workflow', entity_id: 'w1', title: 'Workflow Executed', description: 'Auto-invoice workflow executed successfully', metadata: {}, created_at: new Date(Date.now() - 5400000).toISOString() },
    { event_id: '10', user_id: 'u2', actor_id: 'u2', event_type: 'project_updated', entity_type: 'project', entity_id: 'pr1', title: 'Project Updated', description: 'Michael Chen updated progress on "Website Redesign" to 75%', metadata: {}, created_at: new Date(Date.now() - 6000000).toISOString() },
  ];

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || event.entity_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const stats = {
    total: mockEvents.length,
    today: mockEvents.filter(e => new Date(e.created_at) > new Date(Date.now() - 86400000)).length,
    tasks: mockEvents.filter(e => e.entity_type === 'task').length,
    messages: mockEvents.filter(e => e.entity_type === 'message').length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Activity Timeline"
        description="Track all activities and changes across the platform"
        action={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => loadEvents()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Events', value: stats.total, icon: List, color: 'text-blue-600' },
          { label: 'Today', value: stats.today, icon: Clock, color: 'text-green-600' },
          { label: 'Tasks', value: stats.tasks, icon: CheckSquare, color: 'text-purple-600' },
          { label: 'Messages', value: stats.messages, icon: MessageSquare, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                  <stat.icon className={cn("h-5 w-5", stat.color, "opacity-50")} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="meeting">Meetings</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="payment">Payments</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="workflow">Workflows</SelectItem>
            <SelectItem value="ai">AI</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Timeline */}
      <Card className="mt-6">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="relative p-6">
              {/* Timeline line */}
              <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-border" />

              {/* Events */}
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="ml-16 mb-6 h-16 bg-muted rounded-lg animate-pulse" />
                ))
              ) : (
                <div className="space-y-6">
                  {filteredEvents.map((event, i) => {
                    const Icon = eventIcons[event.event_type] || FileText;
                    const colorClass = eventTypeColors[event.entity_type] || eventTypeColors.task;

                    return (
                      <motion.div
                        key={event.event_id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative pl-16"
                      >
                        {/* Icon */}
                        <div className={cn(
                          "absolute left-0 h-10 w-10 rounded-full border-4 border-background flex items-center justify-center",
                          colorClass
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{event.title}</h3>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {event.entity_type}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {getTimeAgo(event.created_at)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">S</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">Actor ID: {event.actor_id}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </AppShell>
  );
}
